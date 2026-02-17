import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { computeDaliuren } from '@/services/daliuren'
import { getToken } from '@/services/auth'
import { createDaliurenCase, deleteDaliurenCaseById, fetchDaliurenCaseDetail, fetchDaliurenCaseList, updateDaliurenCase } from '@/services/daliurenCases'
import type { DaliurenCase, DaliurenCaseListItem, DaliurenPillars } from '@/types/daliurenCase'
import type { Branch, Stem } from '@/types/liuyao'

export type CalendarType = 'solar' | 'lunar'
export type TimeMode = 'beijing' | 'trueSolar'
export type DaliurenTab = 'input' | 'result' | 'history'

interface DateTimeInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

interface DaliurenState {
  datetime: DateTimeInput
  calendar: CalendarType
  timeMode: TimeMode
  lunarLeap: boolean
  manualMode: boolean
  manualPillars: DaliurenPillars
  caseName: string
  caseNote: string
  subject: string
  autoSave: boolean
  currentCaseId: string | null
  result: any
  activeTab: DaliurenTab
  setActiveTab: (tab: DaliurenTab) => void
  setDatetime: (partial: Partial<DateTimeInput>) => void
  setCalendar: (v: CalendarType) => void
  setTimeMode: (v: TimeMode) => void
  setLunarLeap: (v: boolean) => void
  setManualMode: (v: boolean) => void
  setManualPillar: (key: keyof DaliurenPillars, pillar: { stem: Stem; branch: Branch }) => void
  setCaseName: (v: string) => void
  setCaseNote: (v: string) => void
  setSubject: (v: string) => void
  setAutoSave: (v: boolean) => void
  setCurrentCaseId: (v: string | null) => void
  compute: () => Promise<any | null>
  saveCurrentCase: (loadingText?: string) => Promise<string | null>
  getSavedCases: (loadingText?: string) => Promise<DaliurenCaseListItem[]>
  loadCase: (id: string, loadingText?: string) => Promise<boolean>
  deleteCase: (id: string, loadingText?: string) => Promise<boolean>
}

const defaultDateTime: DateTimeInput = {
  year: 1990,
  month: 10,
  day: 4,
  hour: 6,
  minute: 0
}

const defaultManualPillars: DaliurenPillars = {
  year: { stem: '甲', branch: '子' },
  month: { stem: '丙', branch: '寅' },
  day: { stem: '戊', branch: '辰' },
  hour: { stem: '庚', branch: '午' }
}

const pad2 = (n: number) => n.toString().padStart(2, '0')

export const useDaliurenStore = create<DaliurenState>((set, get) => ({
  datetime: defaultDateTime,
  calendar: 'solar',
  timeMode: 'beijing',
  lunarLeap: false,
  manualMode: false,
  manualPillars: defaultManualPillars,
  caseName: '',
  caseNote: '',
  subject: '',
  autoSave: true,
  currentCaseId: null,
  result: null,
  activeTab: 'input',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDatetime: (partial) => set((s) => ({ datetime: { ...s.datetime, ...partial } })),
  setCalendar: (v) => set({ calendar: v, lunarLeap: v === 'solar' ? false : get().lunarLeap }),
  setTimeMode: (v) => set({ timeMode: v }),
  setLunarLeap: (v) => set({ lunarLeap: v }),
  setManualMode: (v) => set({ manualMode: v }),
  setManualPillar: (key, pillar) => set((s) => ({ manualPillars: { ...s.manualPillars, [key]: pillar } })),
  setCaseName: (v) => set({ caseName: v }),
  setCaseNote: (v) => set({ caseNote: v }),
  setSubject: (v) => set({ subject: v }),
  setAutoSave: (v) => set({ autoSave: v }),
  setCurrentCaseId: (v) => set({ currentCaseId: v }),
  compute: async () => {
    const { datetime, calendar, lunarLeap, timeMode, manualMode, manualPillars, autoSave } = get()
    try {
      const result = await computeDaliuren({
        datetime,
        calendar,
        lunarLeap,
        timeMode,
        manualPillars: manualMode ? manualPillars : undefined
      })
      set({ result })
      if (autoSave) {
        const token = await getToken()
        if (token) await get().saveCurrentCase()
      }
      return result
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '排盘失败', icon: 'none' })
      return null
    }
  },
  saveCurrentCase: async (loadingText) => {
    const { datetime, calendar, timeMode, manualMode, manualPillars, caseName, caseNote, subject, result, currentCaseId } = get()
    const payload: Omit<DaliurenCase, 'id'> = {
      name: caseName || undefined,
      note: caseNote || undefined,
      subject: subject || undefined,
      datetime: {
        date: `${datetime.year}-${pad2(datetime.month)}-${pad2(datetime.day)}`,
        time: `${pad2(datetime.hour)}:${pad2(datetime.minute)}`
      },
      calendar,
      timeMode,
      manualMode,
      pillars: manualMode ? manualPillars : undefined,
      options: {},
      result,
      createdAt: Date.now()
    }
    try {
      let id: string
      if (currentCaseId) {
        id = await updateDaliurenCase(currentCaseId, payload, loadingText)
      } else {
        id = await createDaliurenCase(payload, loadingText)
      }
      set({ currentCaseId: id })
      return id
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '保存失败', icon: 'none' })
      return null
    }
  },
  getSavedCases: async (loadingText) => {
    try {
      const res = await fetchDaliurenCaseList(50, 0, loadingText)
      return res.records || []
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '获取记录失败', icon: 'none' })
      return []
    }
  },
  loadCase: async (id, loadingText) => {
    try {
      const detail = await fetchDaliurenCaseDetail(id, loadingText)
      const [y, m, d] = (detail.datetime?.date || '').split('-').map((v) => Number(v || 0))
      const [hh, mm] = (detail.datetime?.time || '').split(':').map((v) => Number(v || 0))
      set({
        currentCaseId: detail.id,
        caseName: detail.name || '',
        caseNote: detail.note || '',
        subject: detail.subject || '',
        calendar: detail.calendar || 'solar',
        timeMode: detail.timeMode || 'beijing',
        manualMode: Boolean(detail.manualMode),
        datetime: {
          year: y || defaultDateTime.year,
          month: m || defaultDateTime.month,
          day: d || defaultDateTime.day,
          hour: Number.isFinite(hh) ? hh : defaultDateTime.hour,
          minute: Number.isFinite(mm) ? mm : defaultDateTime.minute
        },
        manualPillars: detail.pillars || defaultManualPillars,
        result: detail.result || null,
        activeTab: 'result'
      })
      return true
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '读取失败', icon: 'none' })
      return false
    }
  },
  deleteCase: async (id, loadingText) => {
    try {
      await deleteDaliurenCaseById(id, loadingText)
      if (get().currentCaseId === id) {
        set({ currentCaseId: null })
      }
      return true
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '删除失败', icon: 'none' })
      return false
    }
  }
}))
