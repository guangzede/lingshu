import Taro from '@tarojs/taro'
import { buildApiUrl } from './api'
import { requestWithLoading } from './request'

export interface StockSuggestion {
  code: string
  symbol: string
  name: string
  market: 'CN' | 'US' | 'HK' | 'UNKNOWN'
}

export interface StockPredictionResult {
  stock: {
    symbol: string
    code: string
    name: string
    market: 'CN' | 'US' | 'HK' | 'UNKNOWN'
    currentPrice: number
    prevClose: number
    change: number
    changePct: number
    timestamp?: string
  }
  dayGanZhi: string
  direction: 'up' | 'down'
  upProbability: number
  downProbability: number
  confidence: number
  expectedMovePct: number
  expectedRangePct: [number, number]
  factors: {
    baseTrend: number
    momentum: number
    volatilityPenalty: number
    volumeBias: number
    ganZhiBias: number
  }
  signals: string[]
  samples: number
}

export interface StockBoardItem {
  code: string
  name: string
  price: number
  change: number
  changePct: number
  turnoverRate?: number
}

export interface MarketIndexSnapshot {
  code: string
  name: string
  current: number
  change: number
  changePct: number
}

export interface StockMarketOverview {
  indices: MarketIndexSnapshot[]
  breadth: {
    up: number
    down: number
    flat: number
  }
  gainers: StockBoardItem[]
  losers: StockBoardItem[]
  updatedAt: string
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

function unwrapResponse<T>(raw: any): T {
  const res = raw as ApiEnvelope<T>
  if (res?.code === 200) return res.data
  throw new Error(res?.message || '请求失败')
}

export async function fetchStockSuggestions(keyword: string) {
  const trimmed = keyword.trim()
  if (!trimmed || trimmed.length < 2) return []
  const res = await Taro.request({
    url: buildApiUrl(`/stock/suggest?keyword=${encodeURIComponent(trimmed)}`),
    method: 'GET'
  })
  const data = unwrapResponse<{ list: StockSuggestion[] }>(res.data)
  return data.list || []
}

export async function fetchTodayGanZhi() {
  const res = await Taro.request({
    url: buildApiUrl('/stock/today-ganzhi'),
    method: 'GET'
  })
  return unwrapResponse<{ date: string; dayGanZhi: string }>(res.data)
}

export async function fetchStockMarketOverview(limit = 6) {
  const safeLimit = Math.max(3, Math.min(limit, 12))
  const res = await Taro.request({
    url: buildApiUrl(`/stock/market-overview?limit=${safeLimit}`),
    method: 'GET'
  })
  return unwrapResponse<{ overview: StockMarketOverview }>(res.data).overview
}

export async function predictStockByGanZhi(payload: { stockName: string; dayGanZhi: string }) {
  const res = await requestWithLoading({
    url: buildApiUrl('/stock/predict'),
    method: 'POST',
    data: payload
  }, '正在推演涨跌概率...')

  return unwrapResponse<{
    result: StockPredictionResult
    source: {
      search: string
      kline: string
      quote: string
    }
    crawledAt: string
  }>(res.data)
}
