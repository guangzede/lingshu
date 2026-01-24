import type { SavedCase } from '@/types/savedCase'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'LIUYAO_SAVED_CASES'

/**
 * 获取存储实现（优先Taro，回退到localStorage）
 */
const getStorage = () => {
  try {
    // 检查是否在小程序环境
    if (Taro.getEnv && Taro.ENV_TYPE && Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      // 小程序环境，使用Taro API
      return {
        setItem: async (key: string, value: string) => {
          return Taro.setStorageSync(key, value)
        },
        getItem: (key: string) => {
          return Taro.getStorageSync(key)
        },
        removeItem: (key: string) => {
          return Taro.removeStorageSync(key)
        },
      }
    }
  } catch (e) {
    // 环境检测失败，回退到localStorage
  }

  // 浏览器环境，使用localStorage
  return {
    setItem: (key: string, value: string) => {
      localStorage.setItem(key, value)
    },
    getItem: (key: string) => {
      return localStorage.getItem(key) || ''
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key)
    },
  }
}

const storage = getStorage()

/**
 * 保存卦例到存储（支持小程序和浏览器）
 */
export function saveCaseToStorage(caseData: SavedCase): boolean {
  try {
    const cases = getAllCasesFromStorage()
    // 如果ID已存在，则覆盖；否则添加新记录
    const index = cases.findIndex(c => c.id === caseData.id)
    if (index !== -1) {
      cases[index] = caseData
    } else {
      cases.push(caseData)
    }
    const dataStr = JSON.stringify(cases)
    storage.setItem(STORAGE_KEY, dataStr)
    return true
  } catch (error) {
    console.error('Failed to save case to storage:', error)
    return false
  }
}

/**
 * 从存储获取所有卦例（支持小程序和浏览器）
 */
export function getAllCasesFromStorage(): SavedCase[] {
  try {
    const data = storage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to get cases from storage:', error)
    return []
  }
}

/**
 * 从存储获取单个卦例（支持小程序和浏览器）
 */
export function getCaseFromStorage(id: string): SavedCase | null {
  try {
    const cases = getAllCasesFromStorage()
    return cases.find(c => c.id === id) || null
  } catch (error) {
    console.error('Failed to get case from storage:', error)
    return null
  }
}

/**
 * 从存储删除卦例（支持小程序和浏览器）
 */
export function deleteCaseFromStorage(id: string): boolean {
  try {
    const cases = getAllCasesFromStorage()
    const filtered = cases.filter(c => c.id !== id)
    const dataStr = JSON.stringify(filtered)
    storage.setItem(STORAGE_KEY, dataStr)
    return true
  } catch (error) {
    console.error('Failed to delete case from storage:', error)
    return false
  }
}

/**
 * 清空所有保存的卦例（支持小程序和浏览器）
 */
export function clearAllCasesFromStorage(): boolean {
  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear cases from storage:', error)
    return false
  }
}
