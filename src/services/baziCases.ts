import { buildApiUrl } from './api'
import { requestWithAuth } from './auth'
import type { BaziCase, BaziCaseListItem } from '@/types/baziCase'

interface CaseListResponse {
  count: number
  limit: number
  offset: number
  records: BaziCaseListItem[]
}

function unwrapResponse<T>(res: any): T {
  if (!res) throw new Error('请求失败')
  if (res.code === 200) return res.data as T
  throw new Error(res.message || '请求失败')
}

export async function createBaziCase(payload: Omit<BaziCase, 'id'>, loadingText?: string): Promise<string> {
  const res = await requestWithAuth({
    url: buildApiUrl('/bazi/cases'),
    method: 'POST',
    data: payload
  }, loadingText)
  const data = unwrapResponse<{ id: string }>(res)
  return String(data.id)
}

export async function updateBaziCase(id: string, payload: Omit<BaziCase, 'id'>, loadingText?: string): Promise<string> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/bazi/cases/${id}`),
    method: 'PUT',
    data: payload
  }, loadingText)
  const data = unwrapResponse<{ id: string }>(res)
  return String(data.id)
}

export async function fetchBaziCaseList(limit = 50, offset = 0, loadingText?: string): Promise<CaseListResponse> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/bazi/cases?limit=${limit}&offset=${offset}`),
    method: 'GET'
  }, loadingText)
  return unwrapResponse<CaseListResponse>(res)
}

export async function fetchBaziCaseDetail(id: string, loadingText?: string): Promise<BaziCase> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/bazi/cases/${id}`),
    method: 'GET'
  }, loadingText)
  return unwrapResponse<BaziCase>(res)
}

export async function deleteBaziCaseById(id: string, loadingText?: string): Promise<void> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/bazi/cases/${id}`),
    method: 'DELETE'
  }, loadingText)
  unwrapResponse(res)
}
