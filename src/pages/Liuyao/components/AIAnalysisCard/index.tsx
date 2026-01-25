import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface AIAnalysisCardProps {
  question: string
  result: any
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ question, result }) => {
  const generateAIPrompt = () => {
    if (!result) return ''

    const sections: string[] = []

    // 1. 基本信息
    sections.push('【六爻排盘基本信息】')
    sections.push(`求测事项: ${question || '未填写'}`)
    sections.push(`占卜时间: ${result.lunar?.date || ''} ${result.timeValue || ''}`)
    sections.push(`农历: ${result.lunar?.month || ''}月${result.lunar?.day || ''}日${result.lunar?.jieQi ? `（${result.lunar.jieQi}）` : ''}`)
    sections.push('')

    // 2. 四柱干支
    sections.push('【四柱干支】')
    if (result.timeGanZhi) {
      sections.push(`年柱: ${result.timeGanZhi.year?.stem || ''}${result.timeGanZhi.year?.branch || ''}`)
      sections.push(`月柱: ${result.timeGanZhi.month?.stem || ''}${result.timeGanZhi.month?.branch || ''}`)
      sections.push(`日柱: ${result.timeGanZhi.day?.stem || ''}${result.timeGanZhi.day?.branch || ''}`)
      sections.push(`时柱: ${result.timeGanZhi.hour?.stem || ''}${result.timeGanZhi.hour?.branch || ''}`)
    }
    sections.push('')

    // 3. 神煞
    if (result.shenShas && result.shenShas.length > 0) {
      sections.push('【神煞】')
      sections.push(result.shenShas.map((s: any) => `${s.name}(${s.branch})`).join('、'))
      sections.push('')
    }

    // 4. 卦象信息
    sections.push('【卦象信息】')
    sections.push(`本卦: ${result.hex?.name || ''}`)
    sections.push(`变卦: ${result.variant?.name || '无'}`)
    sections.push(`卦宫: ${result.hex?.palace || ''} (${result.hex?.palaceCategory || ''})`)
    sections.push(`世爻: ${result.hex?.shiIndex !== undefined ? ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][result.hex.shiIndex] : ''}`)
    sections.push(`应爻: ${result.hex?.yingIndex !== undefined ? ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][result.hex.yingIndex] : ''}`)
    sections.push('')

    // 5. 六爻详细信息（包括动静）
    sections.push('【六爻详细】')
    const yaoLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
    if (result.yaos && Array.isArray(result.yaos)) {
      result.yaos.forEach((yao: any, index: number) => {
        const parts = [
          yaoLabels[index],
          yao.isMoving ? '(动爻)' : '(静爻)',
          yao.sixGod ? `${yao.sixGod}` : '',
          yao.relation ? `${yao.relation}` : '',
          yao.branch ? `${yao.branch}` : '',
          yao.stem ? `${yao.stem}` : '',
          yao.fiveElement ? `${yao.fiveElement}` : '',
          yao.seasonStrength ? `${yao.seasonStrength}` : '',
          yao.changsheng ? `${yao.changsheng}` : ''
        ]
        sections.push(parts.filter(p => p).join(' '))
        
        // 伏神信息
        if (yao.fuShen && yao.fuShen.branch) {
          sections.push(`  伏神: ${yao.fuShen.relation || ''} ${yao.fuShen.branch || ''} ${yao.fuShen.stem || ''}`)
        }
      })
    }
    sections.push('')

    // 6. 日支时支关系分析
    sections.push('【日支时支关系】')
    const dayBranch = result.timeGanZhi?.day?.branch
    const hourBranch = result.timeGanZhi?.hour?.branch
    if (dayBranch && result.yaos) {
      sections.push(`日支 ${dayBranch} 与卦爻:`)
      result.yaos.forEach((yao: any, index: number) => {
        const relations = []
        // 这里简化处理，实际需要调用 analyzeBranchRelation
        if (yao.branch) {
          sections.push(`  ${yaoLabels[index]}(${yao.branch})`)
        }
      })
    }
    if (hourBranch && result.yaos) {
      sections.push(`时支 ${hourBranch} 与卦爻:`)
      result.yaos.forEach((yao: any, index: number) => {
        if (yao.branch) {
          sections.push(`  ${yaoLabels[index]}(${yao.branch})`)
        }
      })
    }
    sections.push('')

    // 7. 爻位分析提示
    sections.push('【爻位分析要点】')
    sections.push('- 世爻应爻关系')
    sections.push('- 用神取定与旺衰')
    sections.push('- 动爻对静爻的生克制化')
    sections.push('- 日月建对各爻的影响')
    sections.push('- 六神辅助判断吉凶')
    sections.push('')

    // 8. 分析要求
    sections.push('【分析要求】')
    sections.push('请根据以上六爻排盘信息，结合传统六爻断卦原则，对求测事项进行详细分析。')
    sections.push('分析要点：')
    sections.push('1. 用神取定及旺衰判断')
    sections.push('2. 世应关系及动静分析')
    sections.push('3. 日月建的作用力')
    sections.push('4. 动爻对卦象的影响')
    sections.push('5. 综合判断吉凶及发展趋势')

    return sections.join('\n')
  }

  const handleClick = () => {
    console.log('=== 调试信息 ===')
    console.log('question prop:', question)
    console.log('result.question:', result?.question)
    
    const prompt = generateAIPrompt()
    console.log('\n=== AI分析提示词 ===')
    console.log(prompt)
    console.log('\n=== 完整排盘数据 ===')
    console.log(JSON.stringify(result, null, 2))
    
    Taro.showToast({ 
      title: '提示词已输出到控制台', 
      icon: 'none',
      duration: 2000 
    })
  }

  return (
    <View className="ai-analysis-card glass-card">
      <View className="card-header">
        <Text className="card-title">AI 分析</Text>
        <Text className="card-desc">基于卦象自动生成解读</Text>
      </View>
      <View className="card-body">
        <Text className="label">求测事项</Text>
        <Text className="content">{question || '暂无填写'}</Text>
        <Text className="label" style={{ marginTop: '12px' }}>卦象概要</Text>
        <Text className="content subtle">{result?.hex?.name ? `${result.hex.name} / ${result.variant?.name || '—'}` : '等待生成'}</Text>
      </View>
      <Button className="primary-btn" onClick={handleClick}>
        生成 AI 解读
      </Button>
    </View>
  )
}

export default AIAnalysisCard
