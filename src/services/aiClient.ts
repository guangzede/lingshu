import Taro from '@tarojs/taro';
import { getToken } from './auth';
import { buildApiUrl } from './api';
import { fetchWithLoading, requestWithLoading } from './request';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AIChatOptions {
  prompt: string;
  stream?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onDelta?: (text: string) => void; // 流式回调（Web 环境）
}

const API_URL = buildApiUrl('/ai/chat');
const REMOTE_AI_URL = 'https://api.lylingshu.shop/api/ai/chat';

function isGatewayFailure(err: any): boolean {
  const msg = String(err?.message || '');
  return /API 请求失败:\s*5\d\d/.test(msg) || /网络请求失败|Failed to fetch/i.test(msg);
}

async function withAiFallback<T>(requester: (url: string) => Promise<T>, primaryUrl: string): Promise<T> {
  try {
    return await requester(primaryUrl);
  } catch (err: any) {
    if (primaryUrl !== REMOTE_AI_URL && isGatewayFailure(err)) {
      return requester(REMOTE_AI_URL);
    }
    throw err;
  }
}

export async function deepseekChat(options: AIChatOptions): Promise<string> {
  const {
    prompt,
    stream = true,
    systemPrompt = '你是一位精通六爻预测的命理专家，请根据用户提供的六爻排盘信息进行专业解读。思考过程<think>不要输出给用户。',
    temperature = 0.7,
    maxTokens = 1500,
    onDelta,
  } = options;

  const url = API_URL;
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

    // 微信小程序：使用 wx.request（不支持流式，自动降级）
    if (env === Taro.ENV_TYPE.WEAPP) {
      return await withAiFallback(
        (targetUrl) => fetchViaTaro(targetUrl, token, { ...payload, stream: false }),
        url
      );
    }

    // Web 环境：优先使用 fetch 流式；否则走一次性返回
    if (env === Taro.ENV_TYPE.WEB && stream && typeof fetch !== 'undefined') {
      return await withAiFallback(
        (targetUrl) => fetchStream(targetUrl, token, payload, onDelta),
        url
      );
    }

    // 其它环境或不支持流式：统一走非流式（Taro.request）
    return await withAiFallback(
      (targetUrl) => fetchViaTaro(targetUrl, token, { ...payload, stream: false }),
      url
    );
  } catch (err: any) {
    throw err;
  }
}

async function fetchStream(
  url: string,
  token: string,
  data: any,
  onDelta?: (text: string) => void
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return await fetchNonStream(url, token, { ...data, stream: false });
  } finally {
    clearTimeout(timeoutId);
  }


  if (!response.ok) {
    if (response.status === 401) throw new Error('API 密钥无效，请检查配置');
    if (response.status === 429) throw new Error('请求频率过高，请稍后再试');
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!response.body || !contentType.includes('text/event-stream')) {
    return await fetchNonStream(url, token, { ...data, stream: false });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let fullText = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (!value) continue;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed?.choices?.[0]?.delta;
        const contentPiece = typeof delta?.content === 'string' ? delta.content : '';
        if (contentPiece) {
          fullText += contentPiece;
          if (onDelta) onDelta(contentPiece);
        }
      } catch (_) {
        // ignore invalid json line
      }
    }
  }
  return fullText;
}

async function fetchNonStream(url: string, token: string, data: any): Promise<string> {
  const res = await fetchWithLoading(url, {
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
  const response = await requestWithLoading({
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
