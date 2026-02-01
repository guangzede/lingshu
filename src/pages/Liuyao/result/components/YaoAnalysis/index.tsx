import React from 'react'
import { View, Text } from '@tarojs/components'
import { analyzeYaoInteractions } from '@/services/liuyao'
import { analyzeYao } from '../../../hooks/useYaoAnalysis'
import type { LiuyaoResult, YaoData } from '../../../types'
import './index.scss'

interface YaoAnalysisProps {
  result: LiuyaoResult
}

const YaoAnalysis: React.FC<YaoAnalysisProps> = ({ result }) => {
  const interactions = analyzeYaoInteractions(result.yaos, result.variantYaos || result.variant.yaos)

  // 预先计算所有动爻的分析结果
  const yaoAnalyses = result.yaos.map((yao: YaoData, index: number) =>
    analyzeYao(
      yao as YaoData,
      index,
      result.yaos as YaoData[],
      result.timeGanZhi.day.stem,
      result.timeGanZhi.day.branch,
      result.timeGanZhi.month.stem,
      result.timeGanZhi.month.branch
    )
  )

  return (
    <View className="yao-analysis-section">
      <View className="yao-analysis-header">
        <Text className="yao-analysis-title">爻位动态</Text>
      </View>

      {interactions.map((interaction) => {
        const yao = result.yaos[interaction.yaoIndex] as YaoData
        const isMoving = yao?.isMoving
        const seasonStrength = yao?.seasonStrength || ''
        const changsheng = yao?.changsheng || ''
        const analysis = yaoAnalyses[interaction.yaoIndex]

        return (
          <View key={interaction.yaoIndex} className="yao-analysis-item">
            <View className="yao-analysis-item-header">
              <Text className="yao-analysis-label">
                {interaction.yaoLabel} {interaction.yaoInfo}
                {isMoving ? <Text className="moving-tag">（动爻）</Text> : null}
              </Text>
              <Text className="yao-analysis-strength">
                {seasonStrength ? (
                  <Text
                    className={
                      seasonStrength === '旺' ? 'strength-wang'
                        : seasonStrength === '相' ? 'strength-xiang'
                        : seasonStrength === '休' ? 'strength-xiu'
                        : seasonStrength === '囚' ? 'strength-qiu'
                        : seasonStrength === '死' ? 'strength-si'
                        : ''
                    }
                  >
                    {seasonStrength}
                  </Text>
                ) : ''}
                {seasonStrength && changsheng ? ' · ' : ''}
                {changsheng}
              </Text>
            </View>

            {/* 动爻分析：以当前动爻为主语 */}
            {isMoving && analysis && analysis.relations.length > 0 && (
              <Text className="yao-analysis-relations">
                {analysis.yaoBranch}{analysis.yaoWuxing}：{analysis.relations.join('，')}
              </Text>
            )}

            {/* 与变卦同位爻的关系（仅动爻显示） */}
            {isMoving && interaction.variantRelation && (
              <Text className="yao-analysis-variant">
                与变卦：{interaction.variantRelation}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

export default YaoAnalysis
