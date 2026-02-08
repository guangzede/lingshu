import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '@/pages/Liuyao/types'
import './index.scss'

interface BranchRelationProps {
  result: LiuyaoResult
}

const BranchRelation: React.FC<BranchRelationProps> = ({ result }) => {
  const dayBranch = result.branchRelations?.dayBranch
  const hourBranch = result.branchRelations?.hourBranch
  const dayRelations = result.branchRelations?.dayRelations || []
  const hourRelations = result.branchRelations?.hourRelations || []

  const labelMap: Record<number, string> = { 0: '上爻', 1: '五爻', 2: '四爻', 3: '三爻', 4: '二爻', 5: '初爻' }

  const formatRelation = (rel: any) => rel.relationText || ''

  return (
    <View className="branch-relation-section">
      <View className="branch-relation-header">
        <Text className="branch-relation-title">日支/时支关系</Text>
      </View>

      {/* 日支关系 */}
      <View className="relation-group">
        <Text className="relation-group-title">日支分析：</Text>
        {dayRelations.map((rel: any, idx: number) => {
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
        {hourRelations.map((rel: any, idx: number) => {
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
