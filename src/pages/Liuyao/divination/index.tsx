import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import { initH5FadeInOnce } from '@/utils/h5Fade'
import './index.scss'
import ShakeCoins from './components/ShakeCoins'
import QuestionCard from '../components/QuestionCard'
import { usePaipan } from '../hooks/usePaipan'
import { useModeState } from '../hooks/useModeState'

// 导入组件
import ModeSelector from './components/ModeSelector'
import TimeInput from './components/TimeInput'
import CountInput from './components/CountInput'
import YaoMatrix from './components/YaoMatrix'

// 六爻起卦页面
const LiuyaoDivinationPage: React.FC = () => {
  const {
    lines,
    dateValue,
    timeValue,
    question,
    setLineState,
    setDateValue,
    setTimeValue,
    setQuestion,
    resetLines,
    compute
  } = useLiuyaoStore((s) => s)

  const [countNumbers, setCountNumbers] = React.useState('')
  const [isComputing, setIsComputing] = React.useState(false)

  // 使用模式状态管理 hook
  const {
    mode,
    shakeStep,
    modeForPaipan,
    handleModeChange,
    handleShakeDone
  } = useModeState()

  const todayStr = React.useMemo(() => {
    const now = new Date()
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const computeAndSave = React.useCallback(async () => {
    setIsComputing(true)
    const result = await compute()
    if (!result) {
      Taro.showToast({ title: '排盘失败，请重试', icon: 'none' })
      setIsComputing(false)
      return
    }
    setIsComputing(false)
    Taro.navigateTo({
      url: '/pages/Liuyao/result/index'
    })
  }, [compute])

  const { handlePaipan } = usePaipan({ mode: modeForPaipan, countNumbers, setLineState, compute: computeAndSave })

  // 页面首次加载时重置爻位（保留求测事项）
  React.useEffect(() => {
    initH5FadeInOnce()
    resetLines()
  }, [])

  return (
    <View className="liuyao-divination-page">
      {/* 顶部：模式选择器 */}
      <ModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        isLoadingHistory={false}
      />

      {/* 时间输入区域 - 仅手动模式 */}
      <TimeInput
        dateValue={dateValue}
        timeValue={timeValue}
        todayStr={todayStr}
        onDateChange={setDateValue}
        onTimeChange={setTimeValue}
        isVisible={mode === 'manual'}
      />

      {/* 报数起卦输入区域 - 仅报数模式 */}
      <CountInput
        countNumbers={countNumbers}
        onCountNumbersChange={setCountNumbers}
        isVisible={mode === 'count'}
      />

      {/* 求测事项卡片 - 始终展示 */}
      <QuestionCard value={question} onChange={setQuestion} readOnly={false} />

      {/* 中部：爻位排盘卡片 - 仅手动模式 */}
      <YaoMatrix
        lines={lines}
        onLineStateChange={setLineState}
        isVisible={mode === 'manual'}
      />

      {/* 摇卦区域 - 仅摇卦模式 */}
      {mode === 'shake' && (
        <View className="glass-card shake-section">
          <View className="card-header">
            <Text className="card-section-title">摇卦起卦</Text>
            <Text className="card-section-guide">点击进行摇卦</Text>
          </View>
          <ShakeCoins step={shakeStep} disabled={shakeStep >= 6} onDone={handleShakeDone} />
        </View>
      )}

      {/* 排盘按钮 */}
      {(mode === 'manual' || mode === 'count' || mode === 'auto') && (
        <View className="divinate-button-container">
          <View
            className="divinate-button"
            onClick={handlePaipan}
          >
            <Text className="divinate-text">开始推演</Text>
            <View className="energy-flow" />
          </View>
        </View>
      )}

      {isComputing && (
        <View className="divination-loading">
          <View className="divination-loading-card">
            <Text className="divination-loading-title">正在排盘</Text>
            <Text className="divination-loading-desc">天机推演中...</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default LiuyaoDivinationPage
