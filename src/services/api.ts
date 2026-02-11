declare const __API_BASE__: string
declare const __API_PREFIX__: string

const API_BASE = __API_BASE__ ?? ''
const API_PREFIX = __API_PREFIX__ || '/api'

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
