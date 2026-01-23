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
    const randomLines = Array.from({ length: 6 }, () => ({
      isYang: Math.random() > 0.5,
      isMoving: false
    }))
    randomLines[Math.floor(Math.random() * 6)].isMoving = true
    randomLines.forEach((line, i) => {
      setLineState(i, line.isYang ? (line.isMoving ? 'taiyang' : 'shaoyang') : (line.isMoving ? 'taiyin' : 'shaoyin'))
    })
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
