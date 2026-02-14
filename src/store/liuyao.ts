import { create } from 'zustand'
import { computeDivination } from '@/services/divination'
import { createCase, fetchCaseDetail, fetchCaseList, deleteCaseById } from '@/services/cases'
import type { SavedCase, SavedCaseListItem } from '@/types/savedCase'

export interface LineInput { isYang: boolean; isMoving: boolean }

interface LiuyaoState {
  lines: LineInput[]
  date: Date
  dateValue: string // YYYY-MM-DD，用于 Picker
  timeValue: string // HH:mm，用于 Picker
  ruleSetKey: string
  question: string // 求测事项
  result: any
  isLoadingHistory: boolean // 是否在编辑已加载的历史卦例
  manualMode: boolean // QuestionCard 的手动输入模式状态
  setLines: (lines: LineInput[]) => void
  setLineState: (idx: number, state: 'taiyang' | 'shaoyang' | 'shaoyin' | 'taiyin') => void
  toggleYang: (idx: number) => void
  toggleMoving: (idx: number) => void
  setDateValue: (v: string) => void
  setTimeValue: (v: string) => void
  setRuleSetKey: (k: string) => void
  setQuestion: (q: string) => void
  setIsLoadingHistory: (isLoading: boolean) => void
  setResult: (r: any) => void
  setManualMode: (v: boolean) => void
  compute: () => Promise<any | null>
  reset: () => void
  resetLines: () => void // 仅重置爻位，不重置求测事项
  saveCurrentCase: (remark?: string, aiAnalysis?: string, loadingText?: string) => Promise<string> // 保存当前卦例，返回ID
  loadCase: (id: string, loadingText?: string) => Promise<boolean> // 加载卦例，返回是否成功
  getSavedCases: (loadingText?: string) => Promise<SavedCaseListItem[]> // 获取所有已保存的卦例列表
  deleteCase: (id: string, loadingText?: string) => Promise<boolean> // 删除已保存的卦例
  resetAllState: () => void // 完全清空所有状态（用于"新占卜"）
}

// 将 Date 格式化为 YYYY-MM-DD 与 HH:mm，便于小程序 Picker 使用
function formatDateParts(d: Date) {
  const pad = (n: number) => `${n}`.padStart(2, '0')
  const dateValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const timeValue = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return { dateValue, timeValue }
}

function buildDate(dateValue: string, timeValue: string): Date {
  return new Date(`${dateValue}T${timeValue}:00`)
}

// 地天泰卦：上卦为地（坤卦，三个阴爻），下卦为天（乾卦，三个阳爻）
const defaultLines: LineInput[] = [
  { isYang: false, isMoving: false }, // 上六（阴）
  { isYang: false, isMoving: false }, // 六五（阴）
  { isYang: false, isMoving: false }, // 六四（阴）
  { isYang: true, isMoving: false },  // 九三（阳）
  { isYang: true, isMoving: false },  // 九二（阳）
  { isYang: true, isMoving: false }   // 初九（阳）
]

export const useLiuyaoStore = create<LiuyaoState>((set, get) => {
  const now = new Date()
  const { dateValue, timeValue } = formatDateParts(now)
  return {
    lines: defaultLines,
    date: now,
    dateValue,
    timeValue,
    ruleSetKey: 'jingfang-basic',
    question: '',
    result: null,
    isLoadingHistory: false,
    manualMode: false,
    setLines: (lines) => set({ lines }),
    setLineState: (idx, state) => {
      set((s) => {
        const next = [...s.lines]
        let isYang = false
        let isMoving = false
        switch (state) {
          case 'taiyang':
            isYang = true
            isMoving = true
            break
          case 'shaoyang':
            isYang = true
            isMoving = false
            break
          case 'shaoyin':
            isYang = false
            isMoving = false
            break
          case 'taiyin':
            isYang = false
            isMoving = true
            break
        }
        next[idx] = { isYang, isMoving }
        return { lines: next }
      })
    },
    toggleYang: (idx) => {
      set((s) => {
        const next = [...s.lines]
        const current = next[idx]
        next[idx] = { ...current, isYang: !current.isYang }
        return { lines: next }
      })
    },
    toggleMoving: (idx) => {
      set((s) => {
        const next = [...s.lines]
        const current = next[idx]
        next[idx] = { ...current, isMoving: !current.isMoving }
        return { lines: next }
      })
    },
    setDateValue: (v) => {
      set({ dateValue: v, date: buildDate(v, get().timeValue) })
    },
    setTimeValue: (v) => {
      set({ timeValue: v, date: buildDate(get().dateValue, v) })
    },
    setRuleSetKey: (k) => set({ ruleSetKey: k }),
    setQuestion: (q) => set({ question: q }),
    setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }),
    setResult: (r) => set({ result: r }),
    setManualMode: (v) => set({ manualMode: v }),
    compute: async () => {
      const state = get()
      try {
        const result = await computeDivination({
          lines: state.lines,
          dateValue: state.dateValue,
          timeValue: state.timeValue,
          ruleSetKey: state.ruleSetKey,
          question: state.question,
          manualMode: state.manualMode
        })
        set({ result })
        return result
      } catch (err) {
        console.error('Failed to compute divination', err)
        set({ result: null })
        return null
      }
    },
    reset: () => {
      const fresh = new Date()
      const parts = formatDateParts(fresh)
      set({
        lines: defaultLines,
        date: fresh,
        dateValue: parts.dateValue,
        timeValue: parts.timeValue,
        ruleSetKey: 'jingfang-basic',
        question: '',
        result: null,
        isLoadingHistory: false,
        manualMode: false
      })
    },
    resetLines: () => {
      // 仅重置爻位和日期，不重置求测事项
      const fresh = new Date()
      const parts = formatDateParts(fresh)
      set({
        lines: defaultLines,
        date: fresh,
        dateValue: parts.dateValue,
        timeValue: parts.timeValue,
        ruleSetKey: 'jingfang-basic',
        result: null,
        isLoadingHistory: false,
        manualMode: false
        // 保留 question 不变
      })
    },
    saveCurrentCase: async (remark, aiAnalysis, loadingText) => {
      const state = get()
      const computed = state.result
      const caseData: Omit<SavedCase, 'id'> = {
        dateValue: state.dateValue,
        timeValue: state.timeValue,
        lines: state.lines as [any, any, any, any, any, any],
        ruleSetKey: state.ruleSetKey,
        question: state.question,
        manualMode: state.manualMode,
        remark,
        createdAt: Date.now(),
        baseHexName: computed?.hex?.name,
        variantHexName: computed?.variant?.name,
        result: computed,
        aiAnalysis
      }
      const id = await createCase(caseData, loadingText)
      return id
    },
    loadCase: async (id, loadingText) => {
      let caseData: SavedCase | null = null
      try {
        caseData = await fetchCaseDetail(id, loadingText)
      } catch (err) {
        console.error('Failed to fetch case detail:', err)
        return false
      }
      // 基础校验：存在性与结构完整
      if (!caseData) return false
      const hasDate = !!caseData.dateValue && !!caseData.timeValue
      const hasLines = Array.isArray(caseData.lines) && caseData.lines.length === 6
      const hasRule = !!caseData.ruleSetKey
      if (!hasDate || !hasLines || !hasRule) return false

      // 逐项校验爻结构
      for (let i = 0; i < 6; i++) {
        const l: any = caseData.lines[i]
        if (typeof l?.isYang !== 'boolean' || typeof l?.isMoving !== 'boolean') {
          return false
        }
      }

      const date = buildDate(caseData.dateValue, caseData.timeValue)
      set({
        dateValue: caseData.dateValue,
        timeValue: caseData.timeValue,
        lines: caseData.lines,
        ruleSetKey: caseData.ruleSetKey,
        date,
        isLoadingHistory: true,
        manualMode: caseData.manualMode || false,
        question: caseData.question || '',
        result: {
          ...(caseData.result || {}),
          aiAnalysis: caseData.aiAnalysis
        }
      })
      return true
    },
    getSavedCases: async (loadingText) => {
      const data = await fetchCaseList(50, 0, loadingText)
      return data.records
    },
    deleteCase: async (id, loadingText) => {
      try {
        await deleteCaseById(id, loadingText)
        return true
      } catch (err) {
        console.error('Failed to delete case:', err)
        return false
      }
    },
    resetAllState: () => {
      // 完全清空所有状态（用于"新占卜"时）
      const fresh = new Date()
      const parts = formatDateParts(fresh)
      set({
        lines: defaultLines,
        date: fresh,
        dateValue: parts.dateValue,
        timeValue: parts.timeValue,
        ruleSetKey: 'jingfang-basic',
        question: '',
        result: null,
        isLoadingHistory: false,
        manualMode: false
      })
    }
  }
})
