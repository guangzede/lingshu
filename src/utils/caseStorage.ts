import type { SavedCase } from '@/types/savedCase'

const STORAGE_KEY = 'LIUYAO_SAVED_CASES'

/**
 * 保存卦例到 localStorage
 */
export function saveCaseToStorage(caseData: SavedCase): void {
  try {
    const cases = getAllCasesFromStorage()
    // 如果ID已存在，则覆盖
    const index = cases.findIndex(c => c.id === caseData.id)
    if (index !== -1) {
      cases[index] = caseData
    } else {
      cases.push(caseData)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
  } catch (error) {
    console.error('Failed to save case to localStorage:', error)
  }
}

/**
 * 从 localStorage 获取所有卦例
 */
export function getAllCasesFromStorage(): SavedCase[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get cases from localStorage:', error)
    return []
  }
}

/**
 * 从 localStorage 获取单个卦例
 */
export function getCaseFromStorage(id: string): SavedCase | null {
  try {
    const cases = getAllCasesFromStorage()
    return cases.find(c => c.id === id) || null
  } catch (error) {
    console.error('Failed to get case from localStorage:', error)
    return null
  }
}

/**
 * 从 localStorage 删除卦例
 */
export function deleteCaseFromStorage(id: string): void {
  try {
    const cases = getAllCasesFromStorage()
    const filtered = cases.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete case from localStorage:', error)
  }
}

/**
 * 清空所有保存的卦例
 */
export function clearAllCasesFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear cases from localStorage:', error)
  }
}
