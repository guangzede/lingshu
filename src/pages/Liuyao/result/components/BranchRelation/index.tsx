import React from 'react'
import { View, Text } from '@tarojs/components'
import { analyzeBranchRelation } from '@/services/liuyao'
import type { LiuyaoResult } from '@/pages/Liuyao/types'
import './index.scss'

interface BranchRelationProps {
  result: LiuyaoResult
}

const BranchRelation: React.FC<BranchRelationProps> = ({ result }) => {
  const dayBranch = result.timeGanZhi.day.branch
  const hourBranch = result.timeGanZhi.hour.branch
  const hexBranches = result.yaos
    .map((y: any) => y.branch)
    .filter(Boolean) as string[]

  const { dayRelations, hourRelations } = analyzeBranchRelation(dayBranch as any, hourBranch as any, hexBranches as any)

  const labelMap: Record<number, string> = { 0: '初爻', 1: '二爻', 2: '三爻', 3: '四爻', 4: '五爻', 5: '上爻' }

  const formatRelation = (rel: any) => {
    const relations: string[] = []
    if (rel.isClash) relations.push(`六冲`)
    if (rel.isHarmony) relations.push(`六合`)
    if (rel.isTriple) relations.push(`三合`)
    if (rel.isPunish) relations.push(`三刑`)
    return relations.join('、')
  }

  return (
    <View className="branch-relation-section">
      <View className="branch-relation-header">
        <Text className="branch-relation-title">日支/时支关系</Text>
      </View>

      {/* 日支关系 */}
      <View className="relation-group">
        <Text className="relation-group-title">日支分析：</Text>
        {dayRelations.map((rel, idx) => {
          if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
          const relationStr = formatRelation(rel)
          return (
            <Text key={idx} className="relation-item">
              ({dayBranch})({rel.branch}) {relationStr} · {labelMap[idx]}
            </Text>
          )
        })}
      </View>

      {/* 时支关系 */}
      <View className="relation-group">
        <Text className="relation-group-title">时支分析：</Text>
        {hourRelations.map((rel, idx) => {
          if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
          const relationStr = formatRelation(rel)
          return (
            <Text key={idx} className="relation-item">
              ({hourBranch})({rel.branch}) {relationStr} · {labelMap[idx]}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

export default BranchRelation
