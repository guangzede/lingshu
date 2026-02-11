import Taro from '@tarojs/taro';
import { buildApiUrl } from './api';

export interface DivinationComputePayload {
  lines: Array<{ isYang: boolean; isMoving: boolean }>;
  dateValue?: string;
  timeValue?: string;
  ruleSetKey?: string;
  question?: string;
  manualMode?: boolean;
}

export async function computeDivination(payload: DivinationComputePayload) {
  const res = await Taro.request({
    url: buildApiUrl('/divination/compute'),
    method: 'POST',
    data: payload,
  });

  const data = res.data;
  if (data?.code === 200) {
    return data.data?.result ?? data.data;
  }
  throw new Error(data?.message || '排盘计算失败');
}
