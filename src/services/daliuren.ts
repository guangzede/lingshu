import { buildApiUrl } from './api'
import { requestWithLoading } from './request'
import type { DaliurenPillars } from '@/types/daliurenCase'

export interface DaliurenComputePayload {
  datetime: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
  }
  calendar?: 'solar' | 'lunar'
  lunarLeap?: boolean
  timeMode?: 'beijing' | 'trueSolar'
  manualPillars?: DaliurenPillars
}

export async function computeDaliuren(payload: DaliurenComputePayload) {
  const res = await requestWithLoading({
    url: buildApiUrl('/daliuren/compute'),
    method: 'POST',
    data: payload
  })
  const data = res.data as any
  if (data?.code === 200) {
    return data.data?.result ?? data.data
  }
  throw new Error(data?.message || '排盘计算失败')
}
