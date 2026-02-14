import { buildApiUrl } from './api'
import { requestWithLoading } from './request'
import { requestWithAuth } from './auth'
import type { BaziPillars } from '@/types/baziCase'

export interface BaziComputePayload {
  pillars: BaziPillars
  gender?: 'male' | 'female'
  directionRule?: 'year' | 'day'
  luckStart?: {
    startAge?: number
    startYear?: number
    isForward?: boolean
  }
  options?: {
    daYunCount?: number
    liuNianCount?: number
    currentYear?: number
  }
  birth?: {
    date?: string
    time?: string
    calendar?: 'solar' | 'lunar'
    timeMode?: 'beijing' | 'trueSolar'
  }
}

export async function computeBazi(payload: BaziComputePayload) {
  const res = await requestWithLoading({
    url: buildApiUrl('/bazi/compute'),
    method: 'POST',
    data: payload
  })

  const data = res.data as any
  if (data?.code === 200) {
    return data.data?.result ?? data.data
  }
  throw new Error(data?.message || '排盘计算失败')
}

function unwrapResponse<T>(res: any): T {
  if (!res) throw new Error('请求失败')
  if (res.code === 200) return res.data as T
  throw new Error(res.message || '请求失败')
}

export async function fetchBaziAiReport(payload: BaziComputePayload, loadingText?: string) {
  const res = await requestWithAuth({
    url: buildApiUrl('/bazi/ai-report'),
    method: 'POST',
    data: payload
  }, loadingText)
  return unwrapResponse<{
    year: number
    ganZhi: string
    yearElement: string
    yearTenGod: string
    isUnlocked: boolean
    report: string
    preview: string
  }>(res)
}
