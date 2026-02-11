const API_BASE = process.env.TARO_APP_API_BASE ?? '';
const API_PREFIX = process.env.TARO_APP_API_PREFIX || '/api';

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
