import React from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import { Lunar } from 'lunar-javascript'
import {
  fetchStockSuggestions,
  fetchTodayGanZhi,
  predictStockByGanZhi,
  type StockPredictionResult,
  type StockSuggestion
} from '@/services/stock'
import './index.scss'

const formatProb = (value: number) => `${(value * 100).toFixed(1)}%`
const formatPct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
const formatFactor = (value: number) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
const HISTORY_KEY = 'stock_prediction_history_v1'
const HISTORY_MAX = 8
const HOT_STOCKS = [
  { name: '贵州茅台', code: '600519' },
  { name: '宁德时代', code: '300750' },
  { name: '比亚迪', code: '002594' },
  { name: '中芯国际', code: '688981' },
  { name: '中国平安', code: '601318' }
]

interface PredictionHistoryItem {
  id: string
  stockName: string
  stockCode: string
  dayGanZhi: string
  upProbability: number
  direction: 'up' | 'down'
  createdAt: string
}

const factorLabels: Record<keyof StockPredictionResult['factors'], string> = {
  baseTrend: '基础趋势',
  momentum: '动量',
  volatilityPenalty: '波动惩罚',
  volumeBias: '量能偏置',
  ganZhiBias: '干支偏置'
}

function safeStockName(name: string, fallback: string): string {
  if (!name) return fallback
  return /�/.test(name) ? fallback : name
}

const StockPage: React.FC = () => {
  const [stockName, setStockName] = React.useState('')
  const [dayGanZhi, setDayGanZhi] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<StockSuggestion[]>([])
  const [isSuggesting, setIsSuggesting] = React.useState(false)
  const [isPredicting, setIsPredicting] = React.useState(false)
  const [result, setResult] = React.useState<StockPredictionResult | null>(null)
  const [crawledAt, setCrawledAt] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [history, setHistory] = React.useState<PredictionHistoryItem[]>([])

  React.useEffect(() => {
    try {
      const localGanZhi = Lunar.fromDate(new Date()).getDayInGanZhi()
      if (localGanZhi) {
        setDayGanZhi(localGanZhi)
      }
    } catch {
      // ignore
    }
    fetchTodayGanZhi()
      .then((res) => {
        if (res.dayGanZhi) setDayGanZhi(res.dayGanZhi)
      })
      .catch(() => {
        // ignore
      })

    const cached = Taro.getStorageSync(HISTORY_KEY)
    if (Array.isArray(cached)) {
      setHistory(cached.slice(0, HISTORY_MAX))
    }
  }, [])

  React.useEffect(() => {
    const keyword = stockName.trim()
    if (keyword.length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setIsSuggesting(true)
      try {
        const list = await fetchStockSuggestions(keyword)
        if (!cancelled) setSuggestions(list)
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setIsSuggesting(false)
      }
    }, 260)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [stockName])

  const handlePredict = async () => {
    const stock = stockName.trim()
    const ganzhi = dayGanZhi.trim()
    if (!stock) {
      Taro.showToast({ title: '请输入股票名称或代码', icon: 'none' })
      return
    }
    if (ganzhi.length < 2) {
      Taro.showToast({ title: '请输入有效干支，如甲子', icon: 'none' })
      return
    }

    setErrorMsg('')
    setIsPredicting(true)
    try {
      const res = await predictStockByGanZhi({
        stockName: stock,
        dayGanZhi: ganzhi
      })
      const normalizedResult: StockPredictionResult = {
        ...res.result,
        stock: {
          ...res.result.stock,
          name: safeStockName(res.result.stock.name, stock)
        }
      }
      setResult(normalizedResult)
      setCrawledAt(res.crawledAt)
      setSuggestions([])
      const nextItem: PredictionHistoryItem = {
        id: `${Date.now()}-${normalizedResult.stock.code}`,
        stockName: normalizedResult.stock.name,
        stockCode: normalizedResult.stock.code,
        dayGanZhi: normalizedResult.dayGanZhi,
        upProbability: normalizedResult.upProbability,
        direction: normalizedResult.direction,
        createdAt: new Date().toISOString()
      }
      setHistory((prev) => {
        const merged = [nextItem, ...prev.filter((item) => item.stockCode !== nextItem.stockCode)].slice(0, HISTORY_MAX)
        Taro.setStorageSync(HISTORY_KEY, merged)
        return merged
      })
    } catch (err: any) {
      setErrorMsg(err?.message || '预测失败，请稍后重试')
      setResult(null)
    } finally {
      setIsPredicting(false)
    }
  }

  return (
    <View className='stock-page'>
      <View className='stock-header'>
        <Text className='stock-title'>干支股势推演</Text>
        <Text className='stock-subtitle'>输入股票名 + 当日干支，计算涨跌概率</Text>
      </View>

      <View className='stock-card hero-card'>
        <View className='hero-top'>
          <View className='hero-main'>
            <Text className='hero-kicker'>量化趋势 × 干支偏置</Text>
            <Text className='hero-desc'>结合180日行情样本、动量和波动，给出当日概率推演。</Text>
          </View>
          <View className='hero-ganzhi'>
            <Text className='hero-ganzhi-label'>今日干支</Text>
            <Text className='hero-ganzhi-value'>{dayGanZhi || '--'}</Text>
          </View>
        </View>

        <View className='hero-metrics'>
          <View className='hero-metric-item'>
            <Text className='hero-metric-label'>样本周期</Text>
            <Text className='hero-metric-value'>180日</Text>
          </View>
          <View className='hero-metric-item'>
            <Text className='hero-metric-label'>覆盖市场</Text>
            <Text className='hero-metric-value'>沪深北A股</Text>
          </View>
          <View className='hero-metric-item'>
            <Text className='hero-metric-label'>输出内容</Text>
            <Text className='hero-metric-value'>涨跌概率</Text>
          </View>
        </View>

      </View>

      <View className='stock-card form-card'>
        <View className='field-row'>
          <Text className='field-label'>股票名称</Text>
          <Input
            className='field-input'
            type='text'
            value={stockName}
            placeholder='例如：贵州茅台 / 600519'
            onInput={(e) => setStockName(e.detail.value)}
          />
        </View>

        <View className='quick-fill-block'>
          <Text className='quick-fill-label'>热门A股快捷填充</Text>
          <View className='quick-fill-row'>
            {HOT_STOCKS.map((item) => (
              <View
                key={item.code}
                className='quick-fill-chip'
                onClick={() => setStockName(item.name)}
              >
                <Text className='quick-fill-name'>{item.name}</Text>
                <Text className='quick-fill-code'>{item.code}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='field-row'>
          <Text className='field-label'>当日干支</Text>
          <Input
            className='field-input'
            type='text'
            value={dayGanZhi}
            maxlength={4}
            placeholder='例如：甲子'
            onInput={(e) => setDayGanZhi(e.detail.value)}
          />
        </View>

        {suggestions.length > 0 && (
          <ScrollView className='suggestion-list' scrollY>
            {suggestions.map((item) => (
              <View
                key={`${item.symbol}-${item.code}`}
                className='suggestion-item'
                onClick={() => {
                  setStockName(item.name)
                  setSuggestions([])
                }}
              >
                <Text className='suggestion-name'>{item.name}</Text>
                <Text className='suggestion-meta'>{item.code}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View className='form-actions'>
          <Text className='hint-text'>{isSuggesting ? '正在匹配股票...' : '支持输入股票名称或代码（A股）'}</Text>
          <Button
            className='predict-btn'
            loading={isPredicting}
            disabled={isPredicting}
            onClick={handlePredict}
          >
            开始推演
          </Button>
        </View>
      </View>

      <View className='stock-card steps-card'>
        <View className='step-item'>
          <Text className='step-index'>1</Text>
          <Text className='step-text'>输入股票名称或代码</Text>
        </View>
        <View className='step-item'>
          <Text className='step-index'>2</Text>
          <Text className='step-text'>确认当日干支</Text>
        </View>
        <View className='step-item'>
          <Text className='step-index'>3</Text>
          <Text className='step-text'>查看涨跌概率与信号</Text>
        </View>
      </View>

      {errorMsg ? (
        <View className='stock-card error-card'>
          <Text className='error-text'>{errorMsg}</Text>
        </View>
      ) : null}

      {history.length > 0 ? (
        <View className='stock-card history-card'>
          <Text className='section-title'>最近推演</Text>
          {history.map((item) => (
            <View
              key={item.id}
              className='history-item'
              onClick={() => {
                setStockName(item.stockName)
                setDayGanZhi(item.dayGanZhi)
              }}
            >
              <View>
                <Text className='history-name'>{`${item.stockName} (${item.stockCode})`}</Text>
                <Text className='history-meta'>{`干支：${item.dayGanZhi} · 上涨：${formatProb(item.upProbability)}`}</Text>
              </View>
              <Text className={`history-direction ${item.direction === 'up' ? 'up' : 'down'}`}>
                {item.direction === 'up' ? '偏涨' : '偏跌'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {result ? (
        <View className='stock-card result-card'>
          <View className='result-header'>
            <View>
              <Text className='stock-name'>{result.stock.name}</Text>
              <Text className='stock-code'>{`${result.stock.symbol.toUpperCase()} · ${result.stock.code}`}</Text>
            </View>
            <View className={`direction-tag ${result.direction === 'up' ? 'up' : 'down'}`}>
              <Text>{result.direction === 'up' ? '偏涨' : '偏跌'}</Text>
            </View>
          </View>

          <View className='quote-row'>
            <Text className='quote-price'>{result.stock.currentPrice.toFixed(2)}</Text>
            <Text className={`quote-change ${result.stock.change >= 0 ? 'up' : 'down'}`}>
              {`${formatPct(result.stock.change)} (${formatPct(result.stock.changePct)})`}
            </Text>
          </View>

          <View className='prob-section'>
            <View className='prob-row'>
              <Text>上涨概率</Text>
              <Text>{formatProb(result.upProbability)}</Text>
            </View>
            <View className='prob-bar'>
              <View
                className='prob-fill up'
                style={{ width: `${(result.upProbability * 100).toFixed(2)}%` }}
              />
            </View>

            <View className='prob-row'>
              <Text>下跌概率</Text>
              <Text>{formatProb(result.downProbability)}</Text>
            </View>
            <View className='prob-bar'>
              <View
                className='prob-fill down'
                style={{ width: `${(result.downProbability * 100).toFixed(2)}%` }}
              />
            </View>
          </View>

          <View className='metrics-grid'>
            <View className='metric-item'>
              <Text className='metric-label'>置信度</Text>
              <Text className='metric-value'>{`${result.confidence}%`}</Text>
            </View>
            <View className='metric-item'>
              <Text className='metric-label'>预期波动</Text>
              <Text className='metric-value'>{formatPct(result.expectedMovePct)}</Text>
            </View>
            <View className='metric-item'>
              <Text className='metric-label'>预测区间</Text>
              <Text className='metric-value'>{`${formatPct(result.expectedRangePct[0])} ~ ${formatPct(result.expectedRangePct[1])}`}</Text>
            </View>
            <View className='metric-item'>
              <Text className='metric-label'>样本数</Text>
              <Text className='metric-value'>{`${result.samples}日`}</Text>
            </View>
          </View>

          <View className='factor-list'>
            {(Object.keys(result.factors) as Array<keyof StockPredictionResult['factors']>).map((key) => (
              <View className='factor-chip' key={key}>
                <Text className='factor-name'>{factorLabels[key]}</Text>
                <Text className='factor-value'>{formatFactor(result.factors[key])}</Text>
              </View>
            ))}
          </View>

          <View className='signal-list'>
            <Text className='section-title'>推演信号</Text>
            {result.signals.map((signal, index) => (
              <View className='signal-item' key={`${index}-${signal}`}>
                <Text className='signal-dot'>•</Text>
                <Text className='signal-text'>{signal}</Text>
              </View>
            ))}
          </View>

          <Text className='crawled-time'>{`数据抓取时间：${crawledAt || '--'}`}</Text>
        </View>
      ) : null}

      {!result && (
        <View className='stock-card notice-card'>
          <Text className='notice-title'>使用说明</Text>
          <Text className='notice-text'>该功能为概率推演，仅供研究参考，不构成投资建议。</Text>
        </View>
      )}
    </View>
  )
}

export default StockPage
