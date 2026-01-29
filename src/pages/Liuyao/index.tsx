import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, getCurrentInstance } from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'
import { HexagramTable } from './components/HexagramTable'
import ShakeCoins from './components/ShakeCoins'
import QuestionCard from './components/QuestionCard'
import AIAnalysisCard from './components/AIAnalysisCard'
import HumanQACard from './components/HumanQACard'
import { usePaipan } from './hooks/usePaipan'
import { useModeState } from './hooks/useModeState'

// 导入新创建的组件
import ModeSelector from './components/ModeSelector'
import TimeInput from './components/TimeInput'
import CountInput from './components/CountInput'
import YaoMatrix from './components/YaoMatrix'
import InfoGrid from './components/InfoGrid'
import BranchRelation from './components/BranchRelation'
import YaoAnalysis from './components/YaoAnalysis'
import BottomButtons from './components/BottomButtons'

// 六爻排盘页面：调用 store 管理行、时间与结果
const LiuyaoPage: React.FC = () => {
  const {
    lines,
    result,
    dateValue,
    timeValue,
    isLoadingHistory,
    question,
    setLineState,
    setDateValue,
    setTimeValue,
    setQuestion,
    setIsLoadingHistory,
    reset,
    compute
  } = useLiuyaoStore((s) => s)

  const [countNumbers, setCountNumbers] = React.useState('')
  const hasShownRef = React.useRef(false)

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

  const computeAndSave = React.useCallback(() => {
    compute()
  }, [compute])

  const { handlePaipan } = usePaipan({ mode: modeForPaipan, countNumbers, setLineState, compute: computeAndSave })

  // 首页进入时还原到默认状态（带 source=home 参数）；从历史返回时保留结果
  useDidShow(() => {
    const source = getCurrentInstance()?.router?.params?.source
    if (source === 'home') {
      if (!hasShownRef.current || !isLoadingHistory) {
        reset()
        setIsLoadingHistory(false)
      }
    }
    if (!hasShownRef.current) {
      hasShownRef.current = true
    }
  })

  return (
    <View className="liuyao-page">
      {/* 顶部：模式选择器 */}
      <ModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        isLoadingHistory={isLoadingHistory}
      />

      {/* 时间输入区域 - 仅手动模式 */}
      <TimeInput
        dateValue={dateValue}
        timeValue={timeValue}
        todayStr={todayStr}
        onDateChange={setDateValue}
        onTimeChange={setTimeValue}
        isVisible={!result && mode === 'manual'}
      />

      {/* 报数起卦输入区域 - 仅报数模式 */}
      <CountInput
        countNumbers={countNumbers}
        onCountNumbersChange={setCountNumbers}
        isVisible={mode === 'count'}
      />

      {/* 求测事项卡片 - 始终展示（无论是否加载历史） */}
      <QuestionCard value={question} onChange={setQuestion} readOnly={isLoadingHistory} />


      {/* 中部：爻位排盘卡片 - 仅手动模式 */}
      <YaoMatrix
        lines={lines}
        onLineStateChange={setLineState}
        isVisible={!isLoadingHistory && !result && mode === 'manual'}
      />

      {/* 摇卦区域 - 仅摇卦模式 */}
      {!isLoadingHistory && !result && mode === 'shake' && (
        <View className="glass-card shake-section">
          <View className="card-header">
            <Text className="card-section-title">摇卦起卦</Text>
            <Text className="card-section-guide">点击进行摇卦</Text>
          </View>
          <ShakeCoins step={shakeStep} disabled={shakeStep >= 6} onDone={handleShakeDone} />
        </View>
      )}

      {/* 排盘按钮 */}
      {!isLoadingHistory && !result && (mode === 'manual' || mode === 'count' || mode === 'auto') && (
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

      {/* 底部：结果展示（毛玻璃卡片） */}
      {result && (
        <View className="result-section">
          {/* AI 分析与人工答疑 */}
          <AIAnalysisCard question={question} result={result} isFromHistory={isLoadingHistory} />
          <HumanQACard question={question} />

          {/* 干支信息卡片 */}
          <InfoGrid result={result} dateValue={dateValue} timeValue={timeValue} />

          {/* 卦象详细分析卡片 */}
          <View className="glass-card analysis-card">
            <View className="card-header">
              <Text className="card-section-title">六爻详细分析</Text>
              <Text className="card-section-guide">本卦、变卦及爻位的详细信息</Text>
            </View>

            {/* 本卦和变卦表格 */}
            <HexagramTable
              base={result.yaos}
              variant={result.variantYaos || result.variant.yaos}
              baseHex={result.hex}
              variantHex={result.variant}
            />

            {/* 日支/时支关系分析 */}
            <BranchRelation result={result} />

            {/* 爻位动态分析 */}
            <YaoAnalysis result={result} />
          </View>
        </View>
      )}

      {/* 底部按钮区域 */}
      <BottomButtons
        isLoadingHistory={isLoadingHistory}
        hasResult={!!result}
        question={question}
      />
    </View>
  )
}

export default LiuyaoPage
