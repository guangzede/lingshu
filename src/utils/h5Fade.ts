const runtimeEnv = typeof process !== 'undefined' ? (runtimeEnv as any) : {};
import Taro from '@tarojs/taro'

interface H5FadeOptions {
  duration?: number
  background?: string
}

const DEFAULT_DURATION = 280
const DEFAULT_BACKGROUND = '#050510'
const H5_FADE_STORAGE_KEY = 'h5_fade_in'

const ensureOverlay = (duration: number, background: string) => {
  if (typeof document === 'undefined') return null

  let overlay = document.querySelector<HTMLDivElement>('.h5-fade-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'h5-fade-overlay'
    document.body.appendChild(overlay)
  }

  overlay.style.setProperty('--h5-fade-duration', `${duration}ms`)
  overlay.style.background = background
  return overlay
}

export const navigateWithH5Fade = (url: string, options: H5FadeOptions = {}) => {
  const isH5 = (runtimeEnv as any).TARO_ENV === 'h5'
  if (!isH5) {
    Taro.navigateTo({ url })
    return
  }

  const duration = options.duration ?? DEFAULT_DURATION
  const background = options.background ?? DEFAULT_BACKGROUND
  const overlay = ensureOverlay(duration, background)

  if (!overlay) {
    Taro.navigateTo({ url })
    return
  }

  requestAnimationFrame(() => {
    overlay.classList.add('is-active')
    setTimeout(() => {
      try {
        sessionStorage.setItem(
          H5_FADE_STORAGE_KEY,
          JSON.stringify({ duration, background })
        )
      } catch (err) {
        console.warn('[H5 Fade] Failed to set storage', err)
      }
      Taro.navigateTo({ url })
    }, duration)
  })

  setTimeout(() => {
    overlay.classList.remove('is-active')
    overlay.remove()
  }, duration * 2 + 120)
}

export const initH5FadeInOnce = (options: H5FadeOptions = {}) => {
  const isH5 = (runtimeEnv as any).TARO_ENV === 'h5'
  if (!isH5 || typeof document === 'undefined') return

  let duration = options.duration ?? DEFAULT_DURATION
  let background = options.background ?? DEFAULT_BACKGROUND

  try {
    const stored = sessionStorage.getItem(H5_FADE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      duration = parsed?.duration ?? duration
      background = parsed?.background ?? background
      sessionStorage.removeItem(H5_FADE_STORAGE_KEY)
    } else {
      return
    }
  } catch (err) {
    console.warn('[H5 Fade] Failed to read storage', err)
    return
  }

  const overlay = ensureOverlay(duration, background)
  if (!overlay) return

  overlay.classList.add('is-active')

  requestAnimationFrame(() => {
    overlay.classList.remove('is-active')
  })

  setTimeout(() => {
    overlay.remove()
  }, duration + 120)
}
