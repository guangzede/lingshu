import Taro from '@tarojs/taro'

export const DEFAULT_LOADING_TEXT = '正在加载....请稍后'

let loadingCount = 0

function showGlobalLoading(title: string) {
  if (loadingCount === 0) {
    Taro.showLoading({ title, mask: true })
  }
  loadingCount += 1
}

function hideGlobalLoading() {
  loadingCount = Math.max(loadingCount - 1, 0)
  if (loadingCount === 0) {
    Taro.hideLoading()
  }
}

export async function requestWithLoading<T = any>(
  options: Taro.request.Option,
  loadingText: string = DEFAULT_LOADING_TEXT
): Promise<Taro.request.SuccessCallbackResult<T>> {
  showGlobalLoading(loadingText)
  try {
    return await Taro.request<T>(options)
  } finally {
    hideGlobalLoading()
  }
}

export async function fetchWithLoading(
  input: RequestInfo | URL,
  init?: RequestInit,
  loadingText: string = DEFAULT_LOADING_TEXT
): Promise<Response> {
  showGlobalLoading(loadingText)
  try {
    return await fetch(input, init)
  } finally {
    hideGlobalLoading()
  }
}
