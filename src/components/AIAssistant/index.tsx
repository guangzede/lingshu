import React, { useState, useRef } from 'react';
import { View, Button, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { deepseekChat } from '@/services/aiClient';
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
  const [elapsed, setElapsed] = useState(0);
  const [currentTip, setCurrentTip] = useState('');
  const tipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tipIndexRef = useRef(0);

  const tips = [
    '提示：正在一次性拉去AI计算结果，耗时可能较长。',
    '建议：保持网络稳定，避免切出页面。',
    '说明：生成报告通常需要 20-40 秒。',
    '马上完成：感谢您的耐心等待！',
    // '可选：用 H5 端体验流式输出。',
  ];

  React.useEffect(() => {
    if (isGenerating) {
      setElapsed(0);
      tipIndexRef.current = 0;
      setCurrentTip(tips[0]);

      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);

      elapsedTimerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      tipTimerRef.current = setInterval(() => {
        tipIndexRef.current = (tipIndexRef.current + 1) % tips.length;
        setCurrentTip(tips[tipIndexRef.current]);
      }, 3000);
    } else {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
      if (tipTimerRef.current) {
        clearInterval(tipTimerRef.current);
        tipTimerRef.current = null;
      }
    }

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    };
  }, [isGenerating]);

  // 流式（Web）与非流式（小程序等）统一封装调用
  const callDeepSeekAPIStream = async (prompt: string) => {
    console.log('[AIAssistant] callDeepSeekAPIStream 被调用，stream=true');
    setAiResponse('🔮 AI 正在为您分析卦象...\n\n');
    fullResponseRef.current = '🔮 AI 正在为您分析卦象...\n\n';
    try {
      const result = await deepseekChat({
        prompt,
        stream: true,
        maxTokens: 1000,
        onDelta: (text) => {
          console.log('[AIAssistant] onDelta 收到数据:', text.substring(0, 50));
          fullResponseRef.current += text;
          // 使用函数式更新确保每次都能触发重新渲染
          setAiResponse(prev => prev + text);
        },
      });
      console.log('[AIAssistant] deepseekChat 返回，总长度:', result.length);
      // 确保最终结果展示（小程序会一次性回调）
      if (result && result !== fullResponseRef.current) {
        setAiResponse(result);
      }
      return (fullResponseRef.current || result).replace('🔮 AI 正在为您分析卦象...\n\n', '');
    } catch (err: any) {
      console.error('[AIAssistant] callDeepSeekAPIStream 错误:', err);
      throw err;
    }
  };

  // 非流式调用（统一走公共方法）
  const callDeepSeekAPINonStream = async (prompt: string): Promise<string> => {
    const result = await deepseekChat({
      prompt,
      stream: true,
      maxTokens: 100,
    });
    return result;
  };

  const handleGenerateAIAnalysis = React.useCallback(async () => {
    console.log('[AIAssistant] handleGenerateAIAnalysis 开始，question:', question, 'stream:', stream);

    // 防止重复点击
    if (isGenerating) {
      console.log('[AIAssistant] 正在生成中，忽略重复点击');
      return;
    }

    if (!result || !question) {
      Taro.showToast({
        title: '请把您的思绪记录下来否则AI无法生成报告',
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
      console.log('[AIAssistant] 生成的 prompt 长度:', prompt.length);
      if (stream) {
        await callDeepSeekAPIStream(prompt);
      } else {
        setAiResponse('🔮 AI 正在为您分析卦象...\n\n');
        const aiResult = await callDeepSeekAPINonStream(prompt);
        setAiResponse(aiResult);
      }
    } catch (err: any) {
      console.error('[AIAssistant] 生成失败:', err);
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
  }, [result, question, generatePrompt, stream, isGenerating]);

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
          style={{ maxHeight: '60vh', minHeight: '40vh', marginTop: '8px' }}
        >
          {isGenerating && !aiResponse ? (
            <View className="loading-panel">
              <View className="loading-spinner" />
              <Text className="loading-title">正在生成分析报告</Text>
              <Text className="loading-subtitle">
                {Taro.getEnv && Taro.getEnv() === Taro.ENV_TYPE.WEAPP
                  ? '小程序端不支持流式，将一次性返回'
                  : '正在流式生成…'}
              </Text>
              <Text className="loading-elapsed">已等待 {elapsed} 秒</Text>
              <View className="loading-tips">{currentTip}</View>
              <View className="skeleton">
                <View className="skeleton-line" />
                <View className="skeleton-line" />
                <View className="skeleton-line short" />
              </View>
            </View>
          ) : (
            <>
              <MarkdownRenderer content={aiResponse} />
              {isGenerating && (
                <View className="streaming-indicator" style={{ marginTop: '8px', color: '#15e0ff', fontSize: '12px' }}>
                  <Text>● 正在生成中... ({elapsed}s)</Text>
                </View>
              )}
            </>
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
        style={{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
      >
        {isGenerating ? 'AI 解读中...' : (isFromHistory ? '重新解读' : '生成分析报告')}
      </Button>
    </View>
  );
};

export default AIAssistant;
