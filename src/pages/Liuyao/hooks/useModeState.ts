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
  handleShakeDone: (yaoValue: 6 | 7 | 8 | 9) => void
}

export const useModeState = (): ModeStateHook => {
  const {
    setLineState,
    setIsLoadingHistory
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
  const applyShakeResult = (yaoValue: 6 | 7 | 8 | 9, targetIndex: number) => {
    // 三枚铜钱定爻（正面记2，反面记3）：
    // 6=太阴(动)；7=少阳(静)；8=少阴(静)；9=太阳(动)
    let state: 'taiyin' | 'taiyang' | 'shaoyin' | 'shaoyang'
    if (yaoValue === 6) state = 'taiyin'
    else if (yaoValue === 7) state = 'shaoyang'
    else if (yaoValue === 8) state = 'shaoyin'
    else state = 'taiyang'
    setLineState(targetIndex, state)
  }

  // 摇卦完成处理
  const handleShakeDone = (yaoValue: 6 | 7 | 8 | 9) => {
    if (shakeStep >= 6) return
    // 摇卦应按“自下而上”写入：第1次=初爻(index 5)，第6次=上爻(index 0)
    const targetIndex = 5 - shakeStep
    applyShakeResult(yaoValue, targetIndex)
    const nextStep = shakeStep + 1
    setShakeStep(nextStep)
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
