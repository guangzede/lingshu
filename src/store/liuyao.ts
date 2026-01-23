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
  result: any
  isLoadingHistory: boolean // 是否在编辑已加载的历史卦例
  setLineState: (idx: number, state: 'taiyang' | 'shaoyang' | 'shaoyin' | 'taiyin') => void
  toggleYang: (idx: number) => void
  toggleMoving: (idx: number) => void
  setDateValue: (v: string) => void
  setTimeValue: (v: string) => void
  setRuleSetKey: (k: string) => void
  setIsLoadingHistory: (isLoading: boolean) => void
  compute: () => void
  reset: () => void
  saveCurrentCase: (remark?: string) => string // 保存当前卦例，返回ID
  loadCase: (id: string) => boolean // 加载卦例，返回是否成功
  getSavedCases: () => SavedCaseListItem[] // 获取所有已保存的卦例列表
  deleteCase: (id: string) => void // 删除已保存的卦例
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

const defaultLines: LineInput[] = [
  { isYang: true, isMoving: false },
  { isYang: false, isMoving: false },
  { isYang: true, isMoving: false },
  { isYang: false, isMoving: false },
  { isYang: true, isMoving: false },
  { isYang: false, isMoving: false }
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
    result: null,
    isLoadingHistory: false,
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
    setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }),
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
        result: null,
        isLoadingHistory: false
      })
    },
    saveCurrentCase: (remark) => {
      const state = get()
      const id = Date.now().toString()
      const caseData: SavedCase = {
        id,
        dateValue: state.dateValue,
        timeValue: state.timeValue,
        lines: state.lines as [any, any, any, any, any, any],
        ruleSetKey: state.ruleSetKey,
        remark,
        createdAt: Date.now()
      }
      saveCaseToStorage(caseData)
      return id
    },
    loadCase: (id) => {
      const caseData = getCaseFromStorage(id)
      if (!caseData) return false
      const date = buildDate(caseData.dateValue, caseData.timeValue)
      set({
        dateValue: caseData.dateValue,
        timeValue: caseData.timeValue,
        lines: caseData.lines,
        ruleSetKey: caseData.ruleSetKey,
        date,
        isLoadingHistory: true,
        result: null
      })
      return true
    },
    getSavedCases: () => {
      const cases = getAllCasesFromStorage()
      return cases
        .map(c => ({
          id: c.id,
          dateValue: c.dateValue,
          timeValue: c.timeValue,
          remark: c.remark,
          createdAt: c.createdAt
        }))
        .sort((a, b) => b.createdAt - a.createdAt) // 按时间倒序
    },
    deleteCase: (id) => {
      deleteCaseFromStorage(id)
    }
  }
})
