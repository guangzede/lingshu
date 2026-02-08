import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '../../types'
import './index.scss'

interface InfoGridProps {
  result: LiuyaoResult
}

const InfoGrid: React.FC<InfoGridProps> = ({ result }) => {
  const info = result.infoGrid
  if (!info) return null
  return (
    <View className="glass-card info-grid-card">
      <View className="card-header">
        <Text className="card-section-title">占象信息</Text>
        <Text className="card-section-guide">仅供娱乐参考</Text>
      </View>
      <View className="info-row">
        <Text>{info.dateText}</Text>
        <Text>{info.lunarText}</Text>

      </View>

      <View className="ganzhi-row">
        <View className="ganzhi-item">
          <Text className="ganzhi-label">年</Text>
          <Text className="ganzhi-value">{info.ganzhi.year}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">月</Text>
          <Text className="ganzhi-value">{info.ganzhi.month}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">日</Text>
          <Text className="ganzhi-value">{info.ganzhi.day}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">时</Text>
          <Text className="ganzhi-value">{info.ganzhi.hour}</Text>
        </View>
      </View>

      <View className="xunkong-row">
        <Text className="xunkong-label">旬空</Text>
        <Text className="xunkong-value">{info.xunKongText}</Text>
      </View>

      <View className="shensha-grid">
        {info.shenShaItems.map((item) => (
          <View key={item.label} className={`shensha-item${item.highlight ? ` highlight-${item.highlight}` : ''}`}>
            <Text className="shensha-key">{item.label}</Text>
            <Text className="shensha-val">{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default InfoGrid
