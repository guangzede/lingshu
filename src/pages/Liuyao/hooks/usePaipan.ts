import { useCallback } from 'react'
const TRIGRAM_MAP: Record<number, [boolean, boolean, boolean]> = {
  1: [true, true, true],
  2: [true, true, false],
  3: [true, false, true],
  4: [true, false, false],
  5: [false, true, true],
  6: [false, true, false],
  7: [false, false, true],
  8: [false, false, false]
}

interface UsePaipanParams {
  mode: 'manual' | 'count' | 'auto'
  countNumbers: string
  setLineState: (index: number, state: 'taiyang' | 'shaoyang' | 'shaoyin' | 'taiyin') => void
  compute: () => Promise<any | null>
}

export const usePaipan = ({ mode, countNumbers, setLineState, compute }: UsePaipanParams) => {
  // 梅花易数报数起卦
  const applyCountMethod = useCallback(() => {
    if (!countNumbers || countNumbers.length < 2) return

    let upperNum: number
    let lowerNum: number
    let movingLineNum: number

    // 如果是三位数，使用先天八卦数法
    if (countNumbers.length === 3) {
      const digits = countNumbers.split('').map(d => parseInt(d, 10))
      upperNum = digits[0] || 8  // 第一位数为上卦（如果为0则取8）
      lowerNum = digits[1] || 8  // 第二位数为下卦（如果为0则取8）
      movingLineNum = (digits[2] % 6) || 6  // 第三位数整除6取余数为动爻
    } else {
      // 原有逻辑：非三位数时按照梅花易数方法
      const digits = countNumbers.split('').map(d => parseInt(d, 10))
      const total = digits.reduce((sum, n) => sum + n, 0)

      upperNum = total % 8 || 8
      lowerNum = countNumbers.length % 8 || 8
      movingLineNum = total % 6 || 6
    }

    const upperTrigram = TRIGRAM_MAP[upperNum]
    const lowerTrigram = TRIGRAM_MAP[lowerNum]

    // 设置六爻（初爻为第1爻，上爻为第6爻）
    // 索引反向映射：初爻(1)→索引5，二爻(2)→索引4，三爻(3)→索引3
    lowerTrigram.forEach((isYang, i) => {
      const yaoNum = i + 1  // 爻序：初爻(1)、二爻(2)、三爻(3)
      const stateIndex = 5 - i
      if (yaoNum === movingLineNum) {
        setLineState(stateIndex, isYang ? 'taiyang' : 'taiyin')
      } else {
        setLineState(stateIndex, isYang ? 'shaoyang' : 'shaoyin')
      }
    })
    // 四爻(4)→索引2，五爻(5)→索引1，上爻(6)→索引0
    upperTrigram.forEach((isYang, i) => {
      const yaoNum = i + 4  // 爻序：四爻(4)、五爻(5)、上爻(6)
      const stateIndex = 2 - i
      if (yaoNum === movingLineNum) {
        setLineState(stateIndex, isYang ? 'taiyang' : 'taiyin')
      } else {
        setLineState(stateIndex, isYang ? 'shaoyang' : 'shaoyin')
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
  const handlePaipan = useCallback(async () => {
    if (mode === 'auto') {
      applyAutoMethod()
      await new Promise(resolve => setTimeout(resolve, 0))
      await compute()
    } else if (mode === 'count') {
      applyCountMethod()
      await new Promise(resolve => setTimeout(resolve, 0))
      await compute()
    } else {
      await compute()
    }
  }, [mode, applyAutoMethod, applyCountMethod, compute])

  return {
    applyCountMethod,
    applyAutoMethod,
    handlePaipan
  }
}
