import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '../../../types'
import './index.scss'

interface YaoAnalysisProps {
  result: LiuyaoResult
}

type TagLike = { code?: string; label: string; type?: string; description?: string }

const YaoAnalysis: React.FC<YaoAnalysisProps> = ({ result }) => {
  const yaoUi = result.yaoUi || []
  const [expandedTags, setExpandedTags] = React.useState<Record<string, boolean>>({})

  const handleTagClick = (tagKey: string, hasDescription: boolean) => {
    if (!hasDescription) return
    setExpandedTags(prev => ({
      ...prev,
      [tagKey]: !prev[tagKey]
    }))
  }

  return (
    <View className="yao-analysis-section">
      <View className="yao-analysis-header">
        <Text className="yao-analysis-title">爻位动态</Text>
      </View>

      {yaoUi.map((item: any) => {
        const isMoving = item.isMoving
        const seasonStrength = item.seasonStrength || ''
        const changsheng = item.changsheng || ''
        const fiveElement = item.fiveElement || ''
        const analysis = item.relations?.length ? item : null
        const energyLine = item.energy
        const wuxingClass = item.fiveElementClass || ''
        const strengthClass = item.seasonStrengthClass || ''
        const analysisTags = Array.isArray(item.tags) ? item.tags : []
        const tagMap: Map<string, TagLike> = new Map()

          ;[...analysisTags].forEach((tag: any) => {
            if (!tag || !tag.label) return
            const code = tag.code || tag.label
            if (typeof code === 'string' && code.startsWith('YAO_POSITION_')) return
            const key = `${code}-${tag.label}`
            if (!tagMap.has(key)) {
              tagMap.set(key, tag)
            }
          })

        const mergedTags = Array.from(tagMap.values())

        return (
          <View key={item.yaoIndex} className="yao-analysis-item">
            <View className="yao-analysis-item-header">
              <Text className="yao-analysis-label">
                {item.yaoLabel} {item.yaoInfo}
                {isMoving ? <Text className="moving-tag">（动爻）</Text> : null}
                {fiveElement ? (
                  <Text className={`wuxing-tag ${wuxingClass}`}>五行·{fiveElement}</Text>
                ) : null}
              </Text>
              <Text className="yao-analysis-strength">
                {seasonStrength ? (
                  <Text className={strengthClass}>{seasonStrength}</Text>
                ) : ''}
                {seasonStrength && changsheng ? ' · ' : ''}
                {changsheng}
              </Text>
            </View>

            {/* 动爻分析：以当前动爻为主语 */}
            {isMoving && analysis && analysis.relations.length > 0 && (
              <Text className="yao-analysis-relations">
                {item.yaoBranch || ''}{item.yaoWuxing || ''}：{analysis.relations.join('，')}
              </Text>
            )}

            {/* 与变卦同位爻的关系（仅动爻显示） */}
            {isMoving && item.variantRelation && (
              <Text className="yao-analysis-variant">与变卦：{item.variantRelation}</Text>
            )}

            {energyLine && (
              <View className="yao-analysis-energy">
                <Text className="yao-analysis-energy-score">
                  初始分：{energyLine.baseScore} | 最终分：{energyLine.finalScore}（{energyLine.level}）
                </Text>
              </View>
            )}

            {mergedTags.length > 0 && (
              <View className="yao-analysis-tags">
                {mergedTags.map((tag: any) => (
                  <View
                    key={`${tag.code || tag.label}-${tag.label}`}
                    className={`yao-tag-item yao-tag-${tag.type || 'neutral'}`}
                    onClick={() => handleTagClick(`${item.yaoIndex}-${tag.code || tag.label}`, !!tag.description)}
                  >
                    <Text className="yao-tag-label">{tag.label}</Text>
                    {tag.description && expandedTags[`${item.yaoIndex}-${tag.code || tag.label}`] && (
                      <Text className="yao-tag-desc">{tag.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

export default YaoAnalysis
