import { buildApiUrl } from './api';
import { requestWithAuth } from './auth';
import type { SavedCase, SavedCaseListItem } from '@/types/savedCase';

interface CaseListResponse {
  count: number;
  limit: number;
  offset: number;
  records: SavedCaseListItem[];
}

function unwrapResponse<T>(res: any): T {
  if (!res) throw new Error('请求失败');
  if (res.code === 200) return res.data as T;
  throw new Error(res.message || '请求失败');
}

export async function createCase(payload: Omit<SavedCase, 'id'>): Promise<string> {
  const res = await requestWithAuth({
    url: buildApiUrl('/cases'),
    method: 'POST',
    data: payload
  });
  const data = unwrapResponse<{ id: string }>(res);
  return String(data.id);
}

export async function fetchCaseList(limit = 50, offset = 0): Promise<CaseListResponse> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/cases?limit=${limit}&offset=${offset}`),
    method: 'GET'
  });
  return unwrapResponse<CaseListResponse>(res);
}

export async function fetchCaseDetail(id: string): Promise<SavedCase> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/cases/${id}`),
    method: 'GET'
  });
  return unwrapResponse<SavedCase>(res);
}

export async function deleteCaseById(id: string): Promise<void> {
  const res = await requestWithAuth({
    url: buildApiUrl(`/cases/${id}`),
    method: 'DELETE'
  });
  unwrapResponse(res);
}
