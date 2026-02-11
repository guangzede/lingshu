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
import BottomButtons from './components/BottomButtons'
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
        setQuestion
    } = useLiuyaoStore((s) => s)

    // 存储 AI 分析报告
    const [currentAiAnalysis, setCurrentAiAnalysis] = React.useState<string>('')
    const [savedAiAnalysis, setSavedAiAnalysis] = React.useState<string>('')
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
    }, [])

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
    }, [result, compute])

    if (!result) {
        return null
    }

    const isLoggedIn = !!getToken()
    const redirectTarget = encodeURIComponent('/pages/Liuyao/result/index')

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
        <View className="liuyao-result-page">
            {/* 认证状态栏 */}
            <AuthStatusBar />

            {/* 决策主体卡片 */}
            <View >
                <QuestionCard value={question} onChange={setQuestion} readOnly={isLoadingHistory} />
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
                <BranchRelation result={result} />

                {/* 爻位动态分析 */}
                <YaoAnalysis result={result} />


                {/* AI 分析与人工答疑 */}
                <AIAnalysisCard
                    question={question}
                    result={result}
                    isFromHistory={isLoadingHistory}
                    savedAiAnalysis={savedAiAnalysis}
                    onAnalysisGenerated={setCurrentAiAnalysis}
                />
                <HumanQACard question={question} />
                {/* 专业分析卡片：生克制化、旺衰、特殊状态、进退神 */}
                {/* <ProfessionalAnalysisCard result={result} /> */}
            </View>

            {/* 底部按钮区域 */}
            <BottomButtons
                isLoadingHistory={isLoadingHistory}
                hasResult={!!result}
                question={question}
                aiAnalysis={currentAiAnalysis}
            />
        </View>
    )
}

export default LiuyaoResultPage
