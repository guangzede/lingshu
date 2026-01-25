import { useCallback } from 'react'
import { TRIGRAM_MAP } from '../constants/yaoConstants'

interface UsePaipanParams {
  mode: 'manual' | 'count' | 'auto'
  countNumbers: string
  setLineState: (index: number, state: 'taiyang' | 'shaoyang' | 'shaoyin' | 'taiyin') => void
  compute: () => void
}

export const usePaipan = ({ mode, countNumbers, setLineState, compute }: UsePaipanParams) => {
  // 梅花易数报数起卦
  const applyCountMethod = useCallback(() => {
    if (!countNumbers || countNumbers.length < 2) return

    const digits = countNumbers.split('').map(d => parseInt(d, 10))
    const total = digits.reduce((sum, n) => sum + n, 0)

    const upperNum = total % 8 || 8
    const lowerNum = countNumbers.length % 8 || 8
    const movingLineNum = total % 6 || 6

    const upperTrigram = TRIGRAM_MAP[upperNum]
    const lowerTrigram = TRIGRAM_MAP[lowerNum]

    // 设置六爻
    lowerTrigram.forEach((isYang, i) => {
      if (i === movingLineNum - 1) {
        setLineState(i, isYang ? 'taiyang' : 'taiyin')
      } else {
        setLineState(i, isYang ? 'shaoyang' : 'shaoyin')
      }
    })
    upperTrigram.forEach((isYang, i) => {
      const idx = i + 3
      if (idx === movingLineNum - 1) {
        setLineState(idx, isYang ? 'taiyang' : 'taiyin')
      } else {
        setLineState(idx, isYang ? 'shaoyang' : 'shaoyin')
      }
    })
  }, [countNumbers, setLineState])

  // 自动排盘
  const applyAutoMethod = useCallback(() => {
    // 每一爻独立生成：太阴12.5%、少阳37.5%、少阴37.5%、太阳12.5%
    const pickState = (): 'taiyin' | 'taiyang' | 'shaoyin' | 'shaoyang' => {
      const r = Math.random()
      if (r < 0.125) return 'taiyin'
      if (r < 0.5) return 'shaoyang' // 0.125 + 0.375
      if (r < 0.875) return 'shaoyin' // 0.5 + 0.375
      return 'taiyang' // 0.875 + 0.125
    }
    for (let i = 0; i < 6; i++) {
      setLineState(i, pickState())
    }
  }, [setLineState])

  // 统一的排盘处理
  const handlePaipan = useCallback(() => {
    if (mode === 'auto') {
      applyAutoMethod()
      setTimeout(() => compute(), 0)
    } else if (mode === 'count') {
      applyCountMethod()
      setTimeout(() => compute(), 0)
    } else {
      compute()
    }
  }, [mode, applyAutoMethod, applyCountMethod, compute])

  return {
    applyCountMethod,
    applyAutoMethod,
    handlePaipan
  }
}
