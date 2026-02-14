import { create } from 'zustand'
import { Lunar, Solar } from 'lunar-javascript'
import Taro from '@tarojs/taro'
import { computeBazi } from '@/services/bazi'
import { createBaziCase, deleteBaziCaseById, fetchBaziCaseDetail, fetchBaziCaseList, updateBaziCase } from '@/services/baziCases'
import type { BaziCase, BaziCaseListItem, BaziPillars } from '@/types/baziCase'
import type { Branch, Stem } from '@/types/liuyao'

export type CalendarType = 'solar' | 'lunar'
export type TimeMode = 'beijing' | 'trueSolar'
export type ViewMode = 'basic' | 'pro'
export type DirectionRule = 'year' | 'day'
export type BaziTab = 'input' | 'result' | 'history'

interface BirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

interface BaziState {
  birth: BirthInput
  calendar: CalendarType
  timeMode: TimeMode
  lunarLeap: boolean
  gender: 'male' | 'female'
  viewMode: ViewMode
  manualMode: boolean
  directionRule: DirectionRule
  manualPillars: BaziPillars
  manualStartAge?: number
  manualStartYear?: number
  caseName: string
  caseNote: string
  currentCaseId: string | null
  result: any
  setBirth: (partial: Partial<BirthInput>) => void
  setCalendar: (v: CalendarType) => void
  setTimeMode: (v: TimeMode) => void
  setLunarLeap: (v: boolean) => void
  setGender: (v: 'male' | 'female') => void
  setViewMode: (v: ViewMode) => void
  setManualMode: (v: boolean) => void
  setDirectionRule: (v: DirectionRule) => void
  setManualPillar: (key: keyof BaziPillars, pillar: { stem: Stem; branch: Branch }) => void
  setManualStartAge: (v?: number) => void
  setManualStartYear: (v?: number) => void
  setCaseName: (v: string) => void
  setCaseNote: (v: string) => void
  setCurrentCaseId: (v: string | null) => void
  compute: () => Promise<any | null>
  saveCurrentCase: (loadingText?: string) => Promise<string | null>
  getSavedCases: (loadingText?: string) => Promise<BaziCaseListItem[]>
  loadCase: (id: string, loadingText?: string) => Promise<boolean>
  deleteCase: (id: string, loadingText?: string) => Promise<boolean>
  selectedDaYunIndex: number
  setSelectedDaYunIndex: (index: number) => void
  activeTab: BaziTab
  setActiveTab: (tab: BaziTab) => void
}

const defaultBirth: BirthInput = {
  year: 1990,
  month: 10,
  day: 4,
  hour: 6,
  minute: 0
}

const defaultManualPillars: BaziPillars = {
  year: { stem: '甲', branch: '子' },
  month: { stem: '丙', branch: '寅' },
  day: { stem: '戊', branch: '辰' },
  hour: { stem: '庚', branch: '午' }
}

function equationOfTime(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const day = Math.floor(diff / 86400000)
  const B = (2 * Math.PI * (day - 81)) / 364
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

function applyTrueSolarTime(solar: any): any {
  const date = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), 0)
  const eot = equationOfTime(date)
  const adjusted = new Date(date.getTime() + eot * 60000)
  return Solar.fromDate(adjusted)
}

function buildSolarFromInput(birth: BirthInput, calendar: CalendarType, timeMode: TimeMode, lunarLeap: boolean) {
  const lunarMonth = lunarLeap ? -birth.month : birth.month
  let solar = calendar === 'solar'
    ? Solar.fromYmdHms(birth.year, birth.month, birth.day, birth.hour, birth.minute, 0)
    : Lunar.fromYmdHms(birth.year, lunarMonth, birth.day, birth.hour, birth.minute, 0).getSolar()

  if (timeMode === 'trueSolar') {
    solar = applyTrueSolarTime(solar)
  }
  return solar
}

function computePillars(birth: BirthInput, calendar: CalendarType, timeMode: TimeMode, lunarLeap: boolean) {
  const solar = buildSolarFromInput(birth, calendar, timeMode, lunarLeap)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()
  eightChar.setSect(2)

  return {
    pillars: {
      year: { stem: eightChar.getYearGan() as Stem, branch: eightChar.getYearZhi() as Branch },
      month: { stem: eightChar.getMonthGan() as Stem, branch: eightChar.getMonthZhi() as Branch },
      day: { stem: eightChar.getDayGan() as Stem, branch: eightChar.getDayZhi() as Branch },
      hour: { stem: eightChar.getTimeGan() as Stem, branch: eightChar.getTimeZhi() as Branch }
    },
    solar,
    lunar,
    eightChar
  }
}

function calcYunStart(lunar: any, forward: boolean, sect: number) {
  const prev = lunar.getPrevJie()
  const next = lunar.getNextJie()
  const current = lunar.getSolar()
  const start = forward ? current : prev.getSolar()
  const end = forward ? next.getSolar() : current

  let year = 0
  let month = 0
  let day = 0
  let hour = 0

  if (sect === 2) {
    let minutes = end.subtractMinute(start)
    year = Math.floor(minutes / 4320)
    minutes -= year * 4320
    month = Math.floor(minutes / 360)
    minutes -= month * 360
    day = Math.floor(minutes / 12)
    minutes -= day * 12
    hour = minutes * 2
  }

  let startSolar = current.nextYear(year)
  startSolar = startSolar.nextMonth(month)
  startSolar = startSolar.next(day)
  startSolar = startSolar.nextHour(hour)

  const startAge = Number((year + month / 12 + day / 360 + hour / 4320).toFixed(2))

  return {
    startYear: startSolar.getYear(),
    startMonth: month,
    startDay: day,
    startHour: hour,
    startAge,
    startSolar
  }
}

export const useBaziStore = create<BaziState>((set, get) => ({
  birth: defaultBirth,
  calendar: 'solar',
  timeMode: 'beijing',
  lunarLeap: false,
  gender: 'male',
  viewMode: 'basic',
  manualMode: false,
  directionRule: 'year',
  manualPillars: defaultManualPillars,
  manualStartAge: undefined,
  manualStartYear: undefined,
  caseName: '',
  caseNote: '',
  currentCaseId: null,
  result: null,
  selectedDaYunIndex: 0,
  setSelectedDaYunIndex: (index) => set({ selectedDaYunIndex: index }),
  activeTab: 'input',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setBirth: (partial) => set((s) => ({ birth: { ...s.birth, ...partial } })),
  setCalendar: (v) => set({ calendar: v, lunarLeap: v === 'solar' ? false : get().lunarLeap }),
  setTimeMode: (v) => set({ timeMode: v }),
  setLunarLeap: (v) => set({ lunarLeap: v }),
  setGender: (v) => set({ gender: v }),
  setViewMode: (v) => set({ viewMode: v }),
  setManualMode: (v) => set({ manualMode: v }),
  setDirectionRule: (v) => set({ directionRule: v }),
  setManualPillar: (key, pillar) => set((s) => ({ manualPillars: { ...s.manualPillars, [key]: pillar } })),
  setManualStartAge: (v) => set({ manualStartAge: v }),
  setManualStartYear: (v) => set({ manualStartYear: v }),
  setCaseName: (v) => set({ caseName: v }),
  setCaseNote: (v) => set({ caseNote: v }),
  setCurrentCaseId: (v) => set({ currentCaseId: v }),
  compute: async () => {
    const state = get()
    try {
      let pillars: BaziPillars
      let birthMeta: any = state.manualMode ? undefined : {
        date: `${state.birth.year}-${String(state.birth.month).padStart(2, '0')}-${String(state.birth.day).padStart(2, '0')}`,
        time: `${String(state.birth.hour).padStart(2, '0')}:${String(state.birth.minute).padStart(2, '0')}`,
        calendar: state.calendar,
        timeMode: state.timeMode
      }

      let luckStart: any = {}
      let isForward = true

      let extra: any = undefined

      if (state.manualMode) {
        pillars = state.manualPillars
        const stemForRule = state.directionRule === 'year' ? pillars.year.stem : pillars.day.stem
        const yangStems: Stem[] = ['甲', '丙', '戊', '庚', '壬']
        const isYang = yangStems.includes(stemForRule)
        const isMale = state.gender === 'male'
        isForward = (isYang && isMale) || (!isYang && !isMale)
        if (state.manualStartAge !== undefined) luckStart.startAge = state.manualStartAge
        if (state.manualStartYear !== undefined) luckStart.startYear = state.manualStartYear
      } else {
        const computed = computePillars(state.birth, state.calendar, state.timeMode, state.lunarLeap)
        pillars = computed.pillars
        const lunar = computed.lunar
        const eightChar = computed.eightChar
        const isMale = state.gender === 'male'
        const yang = state.directionRule === 'year'
          ? (lunar.getYearGanIndexExact() % 2 === 0)
          : (eightChar.getDayGanIndex() % 2 === 0)
        isForward = (yang && isMale) || (!yang && !isMale)
        const yunStart = calcYunStart(lunar, isForward, 2)
        luckStart.startAge = yunStart.startAge
        luckStart.startYear = yunStart.startYear
        extra = {
          mingGong: eightChar.getMingGong(),
          mingGongNaYin: eightChar.getMingGongNaYin(),
          shenGong: eightChar.getShenGong(),
          shenGongNaYin: eightChar.getShenGongNaYin(),
          taiYuan: eightChar.getTaiYuan(),
          taiYuanNaYin: eightChar.getTaiYuanNaYin(),
          taiXi: eightChar.getTaiXi(),
          taiXiNaYin: eightChar.getTaiXiNaYin()
        }
      }

      luckStart.isForward = isForward

      const result = await computeBazi({
        pillars,
        gender: state.gender,
        directionRule: state.directionRule,
        luckStart,
        options: { daYunCount: 10, liuNianCount: 10, currentYear: new Date().getFullYear() },
        birth: birthMeta
      })

      const merged = extra ? { ...result, extra } : result
      const currentYear = new Date().getFullYear()
      const currentIndex = merged.luck?.daYun?.findIndex((dy: any) => dy.startYear && dy.endYear && currentYear >= dy.startYear && currentYear <= dy.endYear)
      set({ result: merged, selectedDaYunIndex: currentIndex >= 0 ? currentIndex : 0 })
      return merged
    } catch (err: any) {
      console.error('Failed to compute bazi', err)
      Taro.showToast({ title: err?.message || '排盘失败', icon: 'none' })
      set({ result: null })
      return null
    }
  },
  saveCurrentCase: async (loadingText) => {
    const state = get()
    if (!state.result) return null
    const caseData: Omit<BaziCase, 'id'> = {
      name: state.caseName || undefined,
      note: state.caseNote || undefined,
      birth: state.manualMode ? undefined : {
        date: `${state.birth.year}-${String(state.birth.month).padStart(2, '0')}-${String(state.birth.day).padStart(2, '0')}`,
        time: `${String(state.birth.hour).padStart(2, '0')}:${String(state.birth.minute).padStart(2, '0')}`,
        calendar: state.calendar,
        timeMode: state.timeMode
      },
      gender: state.gender,
      manualMode: state.manualMode,
      pillars: state.manualMode ? state.manualPillars : state.result?.pillars ? {
        year: { stem: state.result.pillars.year.stem, branch: state.result.pillars.year.branch },
        month: { stem: state.result.pillars.month.stem, branch: state.result.pillars.month.branch },
        day: { stem: state.result.pillars.day.stem, branch: state.result.pillars.day.branch },
        hour: { stem: state.result.pillars.hour.stem, branch: state.result.pillars.hour.branch }
      } : state.manualPillars,
      options: {
        directionRule: state.directionRule,
        startAge: state.result?.luck?.startAge,
        startYear: state.result?.luck?.startYear,
        isForward: state.result?.luck?.direction === 'forward',
        lunarLeap: state.lunarLeap
      },
      result: state.result,
      createdAt: Date.now()
    }
    try {
      if (state.currentCaseId) {
        const id = await updateBaziCase(state.currentCaseId, caseData, loadingText)
        Taro.showToast({ title: '已更新', icon: 'success' })
        set({ currentCaseId: id })
        return id
      }
      const id = await createBaziCase(caseData, loadingText)
      Taro.showToast({ title: '已保存', icon: 'success' })
      set({ currentCaseId: id })
      return id
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '保存失败', icon: 'none' })
      return null
    }
  },
  getSavedCases: async (loadingText) => {
    try {
      const res = await fetchBaziCaseList(50, 0, loadingText)
      return res.records
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '加载失败', icon: 'none' })
      return []
    }
  },
  loadCase: async (id, loadingText) => {
    try {
      const detail = await fetchBaziCaseDetail(id, loadingText)
      if (!detail) return false
      const currentYear = new Date().getFullYear()
      const defaultDaYunIndex = detail.result?.luck?.daYun
        ? Math.max(0, detail.result.luck.daYun.findIndex((dy: any) => dy.startYear && dy.endYear && currentYear >= dy.startYear && currentYear <= dy.endYear))
        : 0
      set({
        caseName: detail.name || '',
        caseNote: detail.note || '',
        currentCaseId: detail.id || null,
        manualMode: !!detail.manualMode,
        result: detail.result || null,
        gender: detail.gender || 'male',
        directionRule: detail.options?.directionRule || 'year',
        selectedDaYunIndex: defaultDaYunIndex
      })
      if (detail.birth?.date) {
        const [y, m, d] = detail.birth.date.split('-').map((v) => Number(v))
        const [hh, mm] = (detail.birth.time || '0:0').split(':').map((v) => Number(v))
        set((s) => ({
          birth: { ...s.birth, year: y, month: m, day: d, hour: hh, minute: mm },
          calendar: detail.birth?.calendar || 'solar',
          timeMode: detail.birth?.timeMode || 'beijing'
        }))
      }
      if (detail.pillars) {
        set({ manualPillars: detail.pillars })
      }
      if (detail.options) {
        set({
          manualStartAge: detail.options.startAge,
          manualStartYear: detail.options.startYear,
          lunarLeap: detail.birth?.calendar === 'lunar' ? !!detail.options.lunarLeap : false
        })
      }
      return true
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '读取失败', icon: 'none' })
      return false
    }
  },
  deleteCase: async (id, loadingText) => {
    try {
      await deleteBaziCaseById(id, loadingText)
      set((s) => ({ currentCaseId: s.currentCaseId === id ? null : s.currentCaseId }))
      return true
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '删除失败', icon: 'none' })
      return false
    }
  }
}))
