import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'
import HexagramTable from './components/HexagramTable'
import AIAnalysisCard from '@/components/AIAnalysisCard'
import HumanQACard from '@/components/HumanQACard'
import InfoGrid from './components/InfoGrid'
import BranchRelation from './components/BranchRelation'
import YaoAnalysis from './components/YaoAnalysis'
import FloatingBar from './components/FloatingBar'
import Drawer from './components/Drawer'
import HistoryList from './components/HistoryList'
import FiveElementsAnalysis from './components/FiveElementsAnalysis'
// import ProfessionalAnalysisCard from './components/ProfessionalAnalysisCard'
import QuestionCard from '../components/QuestionCard'
import { getToken } from '@/services/auth'
import AuthStatusBar from '@/components/AuthStatusBar'


// 六爻排盘结果页面
const LiuyaoResultPage: React.FC = () => {
  const {
    result,
    dateValue,
    timeValue,
    question,
    isLoadingHistory,
    compute,
    setQuestion,
    getSavedCases,
    saveCurrentCase
  } = useLiuyaoStore((s) => s)

  // 存储 AI 分析报告
  const [currentAiAnalysis, setCurrentAiAnalysis] = React.useState<string>('')
  const [savedAiAnalysis, setSavedAiAnalysis] = React.useState<string>('')

  // 抽屉状态管理
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [historyCases, setHistoryCases] = React.useState<any[]>([])

  // 检测是否在 PC 模式 (>= 1024px)
  const [isPcMode, setIsPcMode] = React.useState(false)

  // 窗口大小变化时更新模式
  React.useEffect(() => {
    const handleResize = () => {
      setIsPcMode(window.innerWidth >= 1024)
    }

    // 初始化
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 打开抽屉时加载历史卦列表
  const handleOpenDrawer = React.useCallback(async () => {
    try {
      const cases = await getSavedCases('加载中...')
      setHistoryCases(cases)
      setDrawerOpen(true)
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }, [getSavedCases])

  // PC模式下自动打开侧栏
  React.useEffect(() => {
    if (isPcMode && !drawerOpen) {
      handleOpenDrawer()
    }
  }, [isPcMode, drawerOpen, handleOpenDrawer])

  // 保存案例处理
  const handleSaveCase = React.useCallback(async () => {
    const doSave = async () => {
      try {
        await saveCurrentCase(undefined, currentAiAnalysis, '保存中...')
        Taro.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
      } catch (err: any) {
        Taro.showToast({ title: err?.message || '保存失败', icon: 'none', duration: 2000 })
      }
    }

    if (!question.trim()) {
      Taro.showModal({
        title: '提示',
        content: '求测事项为空，确认仍要保存吗？',
        confirmText: '保存',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) doSave()
        }
      })
    } else {
      doSave()
    }
  }, [question, currentAiAnalysis, saveCurrentCase])

  // 尝试从本地加载结果，如果没有则返回起卦页
  React.useEffect(() => {
    if (!result) {
      Taro.redirectTo({
        url: '/pages/Liuyao/divination/index'
      })
    } else {
      // 如果是从历史加载的，恢复 AI 分析报告
      if (isLoadingHistory && result.aiAnalysis) {
        setSavedAiAnalysis(result.aiAnalysis)
        setCurrentAiAnalysis(result.aiAnalysis)
      }
    }
  }, [result, isLoadingHistory])

  const refreshAttemptedRef = React.useRef(false)

  React.useEffect(() => {
    if (!result || !isLoadingHistory || refreshAttemptedRef.current) return
    const needsBackendRefresh =
      !result.infoGrid ||
      !result.hexagramTable ||
      !result.branchRelations ||
      !result.yaoUi
    if (!needsBackendRefresh) return
    refreshAttemptedRef.current = true
    compute()
  }, [result, isLoadingHistory, compute])

  const resolvedQuestion = question || result?.meta?.question || result?.question || ''
  const isLoggedIn = !!getToken()
  const redirectTarget = encodeURIComponent('/pages/Liuyao/result/index')

  React.useEffect(() => {
    if (!question && resolvedQuestion) {
      setQuestion(resolvedQuestion)
    }
  }, [question, resolvedQuestion, setQuestion])

  if (!result) {
    return null
  }

  // 计算五行能量（仅 base_score）
  const fiveElementCounts = {
    metal: { base: 0 },
    wood: { base: 0 },
    water: { base: 0 },
    fire: { base: 0 },
    earth: { base: 0 }
  }
  const elementMap: Record<string, keyof typeof fiveElementCounts> = {
    '金': 'metal',
    '木': 'wood',
    '水': 'water',
    '火': 'fire',
    '土': 'earth'
  }
  const energyLines = result.energyAnalysis?.lines || []
  if (energyLines.length > 0 && Array.isArray(result.yaos)) {
    energyLines.forEach((line: any) => {
      const index = (line.position || 1) - 1
      const yao = result.yaos?.[index]
      const element = yao?.fiveElement
      if (element && elementMap[element]) {
        fiveElementCounts[elementMap[element]].base += Number(line.base_score || 0)
      }
    })
  } else {
    // fallback：无能量评分时按数量统计
    result.yaos?.forEach((yao: any) => {
      const element = yao?.fiveElement
      if (element && elementMap[element]) {
        fiveElementCounts[elementMap[element]].base++
      }
    })
  }

  return (
    <View className={`liuyao-result-page ${drawerOpen ? 'has-drawer' : ''}`}>
      {/* 认证状态栏 */}
      <AuthStatusBar />

      {/* 分析内容主体 (左侧) */}
      <View className="analysis-main">
        {/* 决策主体卡片 */}
        <View>
          <QuestionCard value={resolvedQuestion} onChange={setQuestion} readOnly={isLoadingHistory} />
        </View>

        {/* 干支信息卡片 */}
        <InfoGrid result={result} />

        {/* 卦象详细分析卡片 */}
        <View className="glass-card analysis-card">
          <View className="card-header">
            <Text className="card-section-title">六爻详细分析</Text>
            <Text className="card-section-guide">本卦、变卦及爻位的详细信息</Text>
          </View>

          {/* 本卦和变卦表格 */}
          <HexagramTable result={result} />
          {/* 五行能量分析 */}
          <View className={`five-elements-wrap ${isLoggedIn ? '' : 'is-locked'}`}>
            <View className="five-elements-content">
              <FiveElementsAnalysis
                metal={fiveElementCounts.metal}
                wood={fiveElementCounts.wood}
                water={fiveElementCounts.water}
                fire={fiveElementCounts.fire}
                earth={fiveElementCounts.earth}
              />
            </View>
            {!isLoggedIn && (
              <View
                className="five-elements-mask"
                onClick={() => Taro.redirectTo({ url: `/pages/auth/index?redirect=${redirectTarget}` })}
              >
                <Text className="five-elements-mask-text">登录后解锁五行能量分析</Text>
              </View>
            )}
          </View>
          {/* 日支/时支关系分析 */}
          {/* <BranchRelation result={result} /> */}

          {/* 爻位动态分析 */}
          <YaoAnalysis result={result} />

          {/* AI 分析与人工答疑 */}
          <AIAnalysisCard
            question={resolvedQuestion}
            result={result}
            isFromHistory={isLoadingHistory}
            savedAiAnalysis={savedAiAnalysis}
            onAnalysisGenerated={setCurrentAiAnalysis}
          />
          <HumanQACard question={resolvedQuestion} />
          {/* 专业分析卡片：生克制化、旺衰、特殊状态、进退神 */}
          {/* <ProfessionalAnalysisCard result={result} /> */}
        </View>
      </View>

      {/* PC 模式下的历史侧栏 (右侧) */}
      {isPcMode && (
        <View className="history-sidebar">
          <HistoryList cases={historyCases} onClose={() => setDrawerOpen(false)} />
        </View>
      )}

      {/* 底部浮层按钮区域 (移动模式) */}
      {!isPcMode && (
        <FloatingBar
          isLoadingHistory={isLoadingHistory}
          hasResult={!!result}
          question={resolvedQuestion}
          aiAnalysis={currentAiAnalysis}
          onToggleHistory={handleOpenDrawer}
          onSaveCase={handleSaveCase}
        />
      )}

      {/* 移动模式下的侧滑历史卦抽屉 */}
      {!isPcMode && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <HistoryList cases={historyCases} onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}
    </View>
  )
}

export default LiuyaoResultPage
