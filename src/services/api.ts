interface Env {
  TARO_APP_API_BASE?: string;
  TARO_APP_API_PREFIX?: string;
}
const env: Env = typeof process !== 'undefined' && process.env ? process.env as Env : {};
const API_BASE = env.TARO_APP_API_BASE ?? '';
const API_PREFIX = env.TARO_APP_API_PREFIX || '/api';

function normalizePrefix(prefix: string) {
  if (!prefix) return '';
  return prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
}

export function buildApiUrl(path: string) {
  const prefix = normalizePrefix(API_PREFIX);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) {
    return `${prefix}${normalizedPath}`;
  }
  return `${API_BASE}${prefix}${normalizedPath}`;
}
