import { create } from 'zustand'
import { computeAll } from '@/services/liuyao'
import type { Yao } from '@/types/liuyao'
import { saveCaseToStorage, getAllCasesFromStorage, getCaseFromStorage, deleteCaseFromStorage } from '@/utils/caseStorage'
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
  compute: () => void
  reset: () => void
  saveCurrentCase: (remark?: string) => string // 保存当前卦例，返回ID
  loadCase: (id: string) => boolean // 加载卦例，返回是否成功
  getSavedCases: () => SavedCaseListItem[] // 获取所有已保存的卦例列表
  deleteCase: (id: string) => void // 删除已保存的卦例
  saveLastResult: () => void // 保存最近一次排盘结果到本地
  loadLastResult: () => boolean // 加载最近一次排盘结果，返回是否成功
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
    setLines: (lines) => set({ lines }),
    setLineState: (idx, state) => set((current) => {
      const next = [...current.lines]
      const mapping: Record<typeof state, LineInput> = {
        taiyang: { isYang: true, isMoving: true },
        shaoyang: { isYang: true, isMoving: false },
        shaoyin: { isYang: false, isMoving: false },
        taiyin: { isYang: false, isMoving: true }
      }
      next[idx] = mapping[state]
      return { lines: next }
    }),
    toggleYang: (idx) => set((state) => {
      const next = [...state.lines]
      next[idx] = { ...next[idx], isYang: !next[idx].isYang }
      return { lines: next }
    }),
    toggleMoving: (idx) => set((state) => {
      const next = [...state.lines]
      next[idx] = { ...next[idx], isMoving: !next[idx].isMoving }
      return { lines: next }
    }),
    setDateValue: (v) => set((state) => ({
      dateValue: v,
      date: buildDate(v, state.timeValue)
    })),
    setTimeValue: (v) => set((state) => ({
      timeValue: v,
      date: buildDate(state.dateValue, v)
    })),
    setRuleSetKey: (k) => set({ ruleSetKey: k }),
    setQuestion: (q) => set({ question: q }),
    setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }),
    setResult: (r) => set({ result: r }),
    compute: () => {
      const state = get()
      const result = computeAll(state.lines, { ruleSetKey: state.ruleSetKey, date: state.date })
      set({ result })
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
        isLoadingHistory: false
      })
    },
    saveCurrentCase: (remark) => {
      const state = get()
      const computed = state.result || computeAll(state.lines, { ruleSetKey: state.ruleSetKey, date: state.date })
      const id = Date.now().toString()
      const caseData: SavedCase = {
        id,
        dateValue: state.dateValue,
        timeValue: state.timeValue,
        lines: state.lines as [any, any, any, any, any, any],
        ruleSetKey: state.ruleSetKey,
        question: state.question,
        remark,
        createdAt: Date.now(),
        baseHexName: computed?.hex?.name,
        variantHexName: computed?.variant?.name
      }
      saveCaseToStorage(caseData)
      return id
    },
    loadCase: (id) => {
      const caseData = getCaseFromStorage(id)
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

      try {
        const date = buildDate(caseData.dateValue, caseData.timeValue)
        const computed = computeAll(caseData.lines as any, { ruleSetKey: caseData.ruleSetKey, date })
        set({
          dateValue: caseData.dateValue,
          timeValue: caseData.timeValue,
          lines: caseData.lines,
          ruleSetKey: caseData.ruleSetKey,
          date,
          isLoadingHistory: true,
          question: caseData.question || '',
          result: computed
        })
        return true
      } catch (err) {
        console.error('Failed to load case', err)
        return false
      }
    },
    getSavedCases: () => {
      const cases = getAllCasesFromStorage()
      return cases
        .map(c => {
          let baseHexName = c.baseHexName
          let variantHexName = c.variantHexName
          if (!baseHexName || !variantHexName) {
            try {
              const date = buildDate(c.dateValue, c.timeValue)
              const computed = computeAll(c.lines as any, { ruleSetKey: c.ruleSetKey, date })
              baseHexName = computed?.hex?.name
              variantHexName = computed?.variant?.name
            } catch (err) {
              console.error('Failed to compute hex names for history item', err)
            }
          }

          return {
            id: c.id,
            dateValue: c.dateValue,
            timeValue: c.timeValue,
            question: c.question || '',
            remark: c.remark,
            createdAt: c.createdAt,
            baseHexName,
            variantHexName
          }
        })
        .sort((a, b) => b.createdAt - a.createdAt) // 按时间倒序
    },
    deleteCase: (id) => {
      deleteCaseFromStorage(id)
    },
    saveLastResult: () => {
      const state = get()
      if (!state.result) return
      
      const lastResult = {
        dateValue: state.dateValue,
        timeValue: state.timeValue,
        lines: state.lines,
        ruleSetKey: state.ruleSetKey,
        question: state.question,
        result: state.result,
        isLoadingHistory: state.isLoadingHistory,
        timestamp: Date.now()
      }
      
      try {
        localStorage.setItem('liuyao_last_result', JSON.stringify(lastResult))
      } catch (err) {
        console.error('Failed to save last result', err)
      }
    },
    loadLastResult: () => {
      try {
        const saved = localStorage.getItem('liuyao_last_result')
        if (!saved) return false
        
        const lastResult = JSON.parse(saved)
        if (!lastResult || !lastResult.result) return false
        
        // 检查是否过期（24小时）
        const now = Date.now()
        const age = now - (lastResult.timestamp || 0)
        if (age > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('liuyao_last_result')
          return false
        }
        
        set({
          dateValue: lastResult.dateValue,
          timeValue: lastResult.timeValue,
          lines: lastResult.lines,
          ruleSetKey: lastResult.ruleSetKey,
          question: lastResult.question || '',
          result: lastResult.result,
          isLoadingHistory: lastResult.isLoadingHistory || false,
          date: buildDate(lastResult.dateValue, lastResult.timeValue)
        })
        
        return true
      } catch (err) {
        console.error('Failed to load last result', err)
        return false
      }
    }
  }
})
