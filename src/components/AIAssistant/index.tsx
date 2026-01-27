import React, { useState, useRef } from 'react';
import { View, Button, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import './index.scss';

interface AIAssistantProps {
  question: string;
  result: any;
  generatePrompt: () => string;
  stream?: boolean; // 新增参数，控制是否流式
  isFromHistory?: boolean; // 是否来自历史记录
}

const AIAssistant: React.FC<AIAssistantProps> = ({ question, result, generatePrompt, stream = true, isFromHistory = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const fullResponseRef = useRef('');

  const DEEPSEEK_API_KEY = 'sk-c4a5a166346e40439b6ac8ed20dac9c9';

  // 流式请求实现 - 修复版本
  const callDeepSeekAPIStream = async (prompt: string) => {
    setAiResponse('🔮 AI 正在为您分析卦象...\n\n');
    fullResponseRef.current = '🔮 AI 正在为您分析卦象...\n\n';

    try {
      // 检查是否在小程序环境中（Taro 环境）
      const isTaroEnv = typeof Taro !== 'undefined' && Taro.getEnv;

      if (isTaroEnv) {
        // 小程序环境不支持原生 fetch 流式，改用非流式请求
        const aiResult = await callDeepSeekAPINonStream(prompt);
        setAiResponse(aiResult);
        return aiResult;
      }

      // Web 环境使用 fetch 流式
      // @ts-ignore
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位精通六爻预测的命理专家，请根据用户提供的六爻排盘信息进行专业解读。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.body) throw new Error('流式响应不被支持');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      // 使用防抖来优化UI更新
      let updateTimer: NodeJS.Timeout | null = null;
      const updateUI = () => {
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          setAiResponse(fullResponseRef.current);
        }, 50); // 50ms 防抖
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          chunk.split('\n').forEach(line => {
            if (!line.trim()) return;
            try {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') return;
                const data = JSON.parse(jsonStr);
                const delta = data.choices?.[0]?.delta;
                if (typeof delta?.content === 'string' && delta.content) {
                  fullResponseRef.current += delta.content;
                  updateUI();
                }
              }
            } catch (e) {
              // 跳过非 JSON 行
            }
          });
        }
      }

      // 确保最后的更新
      if (updateTimer) clearTimeout(updateTimer);
      setAiResponse(fullResponseRef.current);
      return fullResponseRef.current.replace('🔮 AI 正在为您分析卦象...\n\n', '');
    } catch (err: any) {
      throw err;
    }
  };

  // 非流式请求实现
  const callDeepSeekAPINonStream = async (prompt: string): Promise<string> => {
    try {
      const response = await Taro.request({
        url: 'https://api.deepseek.com/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位精通六爻预测的命理专家，请根据用户提供的六爻排盘信息进行专业解读。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          temperature: 0.7,
          max_tokens: 100
        },
        timeout: 30000
      });
      if (response.statusCode === 200) {
        const data = response.data as any;
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        } else {
          throw new Error('API 返回格式异常');
        }
      } else if (response.statusCode === 401) {
        throw new Error('API 密钥无效，请检查配置');
      } else if (response.statusCode === 429) {
        throw new Error('请求频率过高，请稍后再试');
      } else {
        throw new Error(`API 请求失败: ${response.statusCode}`);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleGenerateAIAnalysis = async () => {
    if (!result || !question) {
      Taro.showToast({
        title: '请先完成排盘',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    setIsGenerating(true);
    setError('');
    setAiResponse('');
    fullResponseRef.current = '';
    try {
      const prompt = generatePrompt();
      if (stream) {
        await callDeepSeekAPIStream(prompt);
      } else {
        setAiResponse('🔮 AI 正在为您分析卦象...\n\n');
        const aiResult = await callDeepSeekAPINonStream(prompt);
        setAiResponse(aiResult);
      }
    } catch (err: any) {
      setError(err.message || 'AI 分析失败，请重试');
      setAiResponse('');
      Taro.showToast({
        title: err.message || 'AI 分析失败',
        icon: 'none',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (aiResponse) {
      const textToCopy = aiResponse.replace('🔮 AI 正在为您分析卦象...\n\n', '');
      Taro.setClipboardData({
        data: textToCopy,
        success: () => {
          Taro.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    }
  };

  return (
    <View className="ai-assistant">
      <View className="ai-response-section">
        <ScrollView
          className="ai-response-content"
          scrollY
          scrollIntoView="bottom"
          style={{ maxHeight: '400px', minHeight: '200px', marginTop: '8px' }}
        >
          {isGenerating ? (
            <View className="loading-animation">🔄 正在生成，请稍候...</View>
          ) : (
            <MarkdownRenderer content={aiResponse} />
          )}
          {isGenerating && <View id="bottom"></View>}
        </ScrollView>
        {!isGenerating && aiResponse && (
          <Button
            className="copy-btn"
            onClick={copyToClipboard}
            style={{ marginTop: '8px', fontSize: '14px', padding: '6px 12px' }}
          >
            复制结果
          </Button>
        )}
      </View>
      {error && (
        <View className="error-section" style={{ marginTop: '12px', color: '#ff6b6b' }}>
          <Text>{error}</Text>
        </View>
      )}
      <Button
        className="primary-btn"
        onClick={handleGenerateAIAnalysis}
        disabled={isGenerating}
      >
        {isGenerating ? 'AI 分析中...' : (isFromHistory ? '重新解读' : '生成 AI 解读')}
      </Button>
    </View>
  );
};

export default AIAssistant;
