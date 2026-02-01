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
import ProfessionalAnalysisCard from './components/ProfessionalAnalysisCard'
import QuestionCard from '../components/QuestionCard'


// 六爻排盘结果页面
const LiuyaoResultPage: React.FC = () => {
    const {
        result,
        dateValue,
        timeValue,
        question,
    isLoadingHistory,
    loadLastResult,
    saveLastResult
  } = useLiuyaoStore((s) => s)

  // 尝试从本地加载结果，如果没有则返回起卦页
  React.useEffect(() => {
    if (!result) {
      const loaded = loadLastResult()
      if (!loaded) {
        Taro.redirectTo({
          url: '/pages/Liuyao/divination/index'
        })
      }
    } else {
      // 如果有结果，保存到本地
      saveLastResult()
    }
  }, [])
    if (!result) {
        return null
    }

    // 计算五行数值（避免 useMemo 死循环）
    const counts = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 }
    const elementMap: Record<string, keyof typeof counts> = {
        '金': 'metal',
        '木': 'wood',
        '水': 'water',
        '火': 'fire',
        '土': 'earth'
    }
    result.yaos?.forEach((yao: any) => {
        const element = yao?.fiveElement
        if (element && elementMap[element]) {
            counts[elementMap[element]]++
        }
    })
    const fiveElementCounts = counts;

    return (
        <View className="liuyao-result-page">

            
            {/* 决策主体卡片 */}
            <View style={{ margin: '16px 0' }}>
              <QuestionCard value={question} onChange={() => {}}  />
            </View>

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
 {/* 五行能量分析 */}
                <FiveElementsAnalysis
                    metal={fiveElementCounts.metal}
                    wood={fiveElementCounts.wood}
                    water={fiveElementCounts.water}
                    fire={fiveElementCounts.fire}
                    earth={fiveElementCounts.earth}
                />
                {/* 日支/时支关系分析 */}
                <BranchRelation result={result} />

                {/* 爻位动态分析 */}
                <YaoAnalysis result={result} />

               
                {/* AI 分析与人工答疑 */}
                <AIAnalysisCard question={question} result={result} isFromHistory={isLoadingHistory} />
                <HumanQACard question={question} />
                {/* 专业分析卡片：生克制化、旺衰、特殊状态、进退神 */}
                <ProfessionalAnalysisCard result={result} />
            </View>

            {/* 底部按钮区域 */}
            <BottomButtons
                isLoadingHistory={isLoadingHistory}
                hasResult={!!result}
                question={question}
            />
        </View>
    )
}

export default LiuyaoResultPage
