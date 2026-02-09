import Taro from '@tarojs/taro';
import { getToken } from './auth';

/* eslint-disable @typescript-eslint/no-explicit-any */
// wx 全局在微信小程序环境可用，这里做一个声明避免 TS 报错
// 运行时会通过 typeof 判断确保安全访问
declare const wx: any | undefined;

export interface AIChatOptions {
  prompt: string;
  stream?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onDelta?: (text: string) => void; // 流式回调（Web 环境）
}

const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:8787';

export async function deepseekChat(options: AIChatOptions): Promise<string> {
  const {
    prompt,
    stream = true,
    systemPrompt = '你是一位精通六爻预测的命理专家，请根据用户提供的六爻排盘信息进行专业解读。思考过程<think>不要输出给用户。',
    temperature = 0.7,
    maxTokens = 1500,
    onDelta,
  } = options;

  const url = `${BASE_URL}/api/ai/chat`;
  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    stream,
    temperature,
    max_tokens: maxTokens,
  } as const;

  const token = getToken();
  if (!token) {
    throw new Error('未授权：请先登录');
  }

  try {
    const env = typeof Taro !== 'undefined' && Taro.getEnv ? Taro.getEnv() : undefined;
    console.log('[DeepSeek] 当前环境:', env, 'stream:', stream, 'typeof fetch:', typeof fetch);

    // 微信小程序：使用 wx.request（不支持流式，自动降级）
    if (env === Taro.ENV_TYPE.WEAPP) {
      const canUseWx = typeof wx !== 'undefined' && typeof wx.request === 'function';
      const req = canUseWx ? wx.request : Taro.request;
      return await new Promise<string>((resolve, reject) => {
        req({
          url,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: { ...payload, stream: false },
          success: (res: any) => {
            const status = res?.statusCode ?? res?.status;
            if (status === 200) {
              const data = res.data as any;
              const content = data?.choices?.[0]?.message?.content || data?.data?.choices?.[0]?.message?.content;
              if (typeof content === 'string') {
                if (onDelta) onDelta(content);
                resolve(content);
              } else {
                reject(new Error('API 返回格式异常'));
              }
            } else if (status === 401) {
              reject(new Error('API 密钥无效，请检查配置'));
            } else if (status === 429) {
              reject(new Error('请求频率过高，请稍后再试'));
            } else {
              reject(new Error(`API 请求失败: ${status}`));
            }
          },
          fail: (err: any) => {
            reject(new Error(err?.errMsg || '网络请求失败'));
          },
        });
      });
    }

    // Web 环境：优先使用 fetch 流式；否则走一次性返回
    if (env === Taro.ENV_TYPE.WEB && stream && typeof fetch !== 'undefined') {
      console.log('[DeepSeek] 进入 Web 流式分支');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[DeepSeek] fetch response.ok:', response.ok, 'status:', response.status);

      if (!response.ok) {
        if (response.status === 401) throw new Error('API 密钥无效，请检查配置');
        if (response.status === 429) throw new Error('请求频率过高，请稍后再试');
        throw new Error(`API 请求失败: ${response.status}`);
      }

      if (!response.body) {
        console.log('[DeepSeek] response.body 不存在，降级到非流式');
        // 某些浏览器/环境不支持 ReadableStream，降级到非流式
        return await fetchNonStream(url, token, { ...payload, stream: false });
      }

      console.log('[DeepSeek] 开始读取流式数据');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              const delta = data?.choices?.[0]?.delta;
              const contentPiece = typeof delta?.content === 'string' ? delta.content : '';
              if (contentPiece) {
                fullText += contentPiece;
                if (onDelta) onDelta(contentPiece);
              }
            } catch (_) {
              // 忽略非 JSON 行
            }
          }
        }
      }
      console.log('[DeepSeek] 流式读取完成，总长度:', fullText.length);
      return fullText;
    }

    console.log('[DeepSeek] 使用非流式方式（Taro.request）');
    // 其它环境或不支持流式：统一走非流式（Taro.request）
    return await fetchViaTaro(url, token, { ...payload, stream: false });
  } catch (err: any) {
    throw err;
  }
}

async function fetchNonStream(url: string, token: string, data: any): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('API 密钥无效，请检查配置');
    if (res.status === 429) throw new Error('请求频率过高，请稍后再试');
    throw new Error(`API 请求失败: ${res.status}`);
  }
  const body = (await res.json()) as any;
  const content = body?.choices?.[0]?.message?.content || body?.data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  throw new Error('API 返回格式异常');
}

async function fetchViaTaro(url: string, token: string, data: any): Promise<string> {
  const response = await Taro.request({
    url,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data,
    timeout: 30000,
  });

  const status = (response as any)?.statusCode ?? (response as any)?.status;
  if (status === 200) {
    const body = (response.data as any) ?? {};
    const content = body?.choices?.[0]?.message?.content || body?.data?.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    throw new Error('API 返回格式异常');
  }
  if (status === 401) throw new Error('API 密钥无效，请检查配置');
  if (status === 429) throw new Error('请求频率过高，请稍后再试');
  throw new Error(`API 请求失败: ${status}`);
}
