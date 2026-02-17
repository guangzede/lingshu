import type { Branch, Stem } from './liuyao'

export interface DaliurenPillar {
  stem: Stem
  branch: Branch
}

export interface DaliurenPillars {
  year: DaliurenPillar
  month: DaliurenPillar
  day: DaliurenPillar
  hour: DaliurenPillar
}

export interface DaliurenCase {
  id: string
  name?: string
  note?: string
  subject?: string
  datetime: {
    date: string
    time: string
  }
  calendar?: 'solar' | 'lunar'
  timeMode?: 'beijing' | 'trueSolar'
  manualMode?: boolean
  pillars?: DaliurenPillars | null
  options?: any
  result?: any
  createdAt: number
}

export interface DaliurenCaseListItem {
  id: string
  name?: string
  subject?: string
  eventDate?: string
  eventTime?: string
  createdAt: number
  note?: string
}
