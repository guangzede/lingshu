import { buildApiUrl } from './api'
import { requestWithAuth } from './auth'
import type { DaliurenCase, DaliurenCaseListItem } from '@/types/daliurenCase'

interface CaseListResponse {
  count: number
  limit: number
  offset: number
  records: DaliurenCaseListItem[]
}

function unwrapResponse<T>(res: any): T {
  if (!res) throw new Error('请求失败')
  if (res.code === 200) return res.data as T
  throw new Error(res.message || '请求失败')
}

export async function createDaliurenCase(payload: Omit<DaliurenCase, 'id'>, loadingText?: string): Promise<string> {
  const res = await requestWithAuth({
    url: buildApiUrl('/daliuren/cases'),
    method: 'POST',
    data: payload
  }, loadingText)
  const data = unwrapResponse<{ id: string }>(res)
  return String(data.id)
}

export async function updateDaliurenCase(id: string, payload: Omit<DaliurenCase, 'id'>, loadingText?: string): Promise<string> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/daliuren/cases/${id}`),
    method: 'PUT',
    data: payload
  }, loadingText)
  const data = unwrapResponse<{ id: string }>(res)
  return String(data.id)
}

export async function fetchDaliurenCaseList(limit = 50, offset = 0, loadingText?: string): Promise<CaseListResponse> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/daliuren/cases?limit=${limit}&offset=${offset}`),
    method: 'GET'
  }, loadingText)
  return unwrapResponse<CaseListResponse>(res)
}

export async function fetchDaliurenCaseDetail(id: string, loadingText?: string): Promise<DaliurenCase> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/daliuren/cases/${id}`),
    method: 'GET'
  }, loadingText)
  return unwrapResponse<DaliurenCase>(res)
}

export async function deleteDaliurenCaseById(id: string, loadingText?: string): Promise<void> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/daliuren/cases/${id}`),
    method: 'DELETE'
  }, loadingText)
  unwrapResponse(res)
}
