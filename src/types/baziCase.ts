import type { Branch, Stem } from './liuyao'

export interface BaziPillar {
  stem: Stem
  branch: Branch
}

export interface BaziPillars {
  year: BaziPillar
  month: BaziPillar
  day: BaziPillar
  hour: BaziPillar
}

export interface BaziCase {
  id: string
  name?: string
  note?: string
  birth?: {
    date?: string
    time?: string
    calendar?: 'solar' | 'lunar'
    timeMode?: 'beijing' | 'trueSolar'
  }
  gender?: 'male' | 'female'
  manualMode?: boolean
  pillars: BaziPillars
  options?: any
  result?: any
  createdAt: number
}

export interface BaziCaseListItem {
  id: string
  name?: string
  birthDate?: string
  birthTime?: string
  createdAt: number
  note?: string
}
