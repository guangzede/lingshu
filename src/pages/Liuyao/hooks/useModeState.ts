import React from 'react'
import { useLiuyaoStore } from '@/store/liuyao'
import type { PaipanMode, LineState } from '../types'

export interface ModeStateHook {
  mode: PaipanMode | 'shake'
  setMode: (mode: PaipanMode | 'shake') => void
  shakeStep: number
  setShakeStep: (step: number) => void
  modeForPaipan: PaipanMode
  handleModeChange: (m: PaipanMode | 'shake') => void
  handleShakeDone: (heads: number) => void
}

export const useModeState = (): ModeStateHook => {
  const {
    lines,
    result,
    setLineState,
    setIsLoadingHistory,
    compute
  } = useLiuyaoStore((s) => s)

  const [mode, setMode] = React.useState<PaipanMode | 'shake'>('auto')
  const [shakeStep, setShakeStep] = React.useState(0)
  const modeStatesRef = React.useRef<Record<PaipanMode | 'shake', { lines: LineState[]; result: any }> | null>(null)

  const modeForPaipan: PaipanMode = mode === 'shake' ? 'manual' : mode

  // 初始化空行状态
  const emptyLines: LineState[] = React.useMemo(() => [
    { isYang: true, isMoving: false },
    { isYang: false, isMoving: false },
    { isYang: true, isMoving: false },
    { isYang: false, isMoving: false },
    { isYang: true, isMoving: false },
    { isYang: false, isMoving: false }
  ], [])

  // 初始化各模式独立状态容器
  React.useEffect(() => {
    if (!modeStatesRef.current) {
      const s = useLiuyaoStore.getState()
      modeStatesRef.current = {
        manual: { lines: s.lines, result: s.result },
        count: { lines: emptyLines, result: null },
        auto: { lines: emptyLines, result: null },
        shake: { lines: emptyLines, result: null }
      }
    }
  }, [emptyLines])

  // 计算并保存当前模式状态
  const computeAndSave = React.useCallback(async () => {
    await compute()
    if (modeStatesRef.current) {
      const s = useLiuyaoStore.getState()
      modeStatesRef.current[mode] = { lines: s.lines, result: s.result }
    }
  }, [compute, mode])

  // 模式切换处理
  const handleModeChange = (m: PaipanMode | 'shake') => {
    // 保存当前模式的状态
    if (modeStatesRef.current) {
      const s = useLiuyaoStore.getState()
      modeStatesRef.current[mode] = { lines: s.lines, result: s.result }
    }

    setMode(m)

    // 切换到目标模式：恢复其独立状态
    if (modeStatesRef.current) {
      const saved = modeStatesRef.current[m]
      if (saved) {
        const api = useLiuyaoStore.getState()
        api.setLines(saved.lines)
        api.setResult(saved.result || null)
      }
    }

    // 摇卦步骤根据是否已有结果简化处理
    if (m === 'shake') {
      const hasResult = !!modeStatesRef.current?.shake.result
      setShakeStep(hasResult ? 6 : 0)
    }

    if (m !== 'manual') {
      setIsLoadingHistory(false)
    }
  }

  // 应用摇卦结果
  const applyShakeResult = (heads: number, targetIndex: number) => {
    // 摇卦生成的概率与自动排盘一致：太阴12.5%、少阳37.5%、少阴37.5%、太阳12.5%
    const r = Math.random()
    let state: 'taiyin' | 'taiyang' | 'shaoyin' | 'shaoyang'
    if (r < 0.125) state = 'taiyin'
    else if (r < 0.5) state = 'shaoyang' // 0.125 + 0.375
    else if (r < 0.875) state = 'shaoyin' // 0.5 + 0.375
    else state = 'taiyang' // 0.875 + 0.125
    setLineState(targetIndex, state)
  }

  // 摇卦完成处理
  const handleShakeDone = (heads: number) => {
    if (shakeStep >= 6) return
    applyShakeResult(heads, shakeStep)
    const nextStep = shakeStep + 1
    setShakeStep(nextStep)
    if (nextStep >= 6) {
      setTimeout(() => {
        compute()
      }, 50)
    }
  }

  return {
    mode,
    setMode,
    shakeStep,
    setShakeStep,
    modeForPaipan,
    handleModeChange,
    handleShakeDone
  }
}
