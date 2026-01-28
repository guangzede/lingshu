import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '../../types'
import './index.scss'

interface InfoGridProps {
  result: LiuyaoResult
  dateValue: string
  timeValue: string
}

const InfoGrid: React.FC<InfoGridProps> = ({ result, dateValue, timeValue }) => {
  return (
    <View className="glass-card info-grid-card">
      <View className="card-header">
        <Text className="card-section-title">占象信息</Text>
        <Text className="card-section-guide">仅供娱乐参考</Text>
      </View>
      <View className="info-row">
          <Text>{dateValue} {timeValue}</Text>
        <Text>农历 {result.lunar.month}月{result.lunar.day}日{result.lunar.jieQi ? `（${result.lunar.jieQi}）` : ''}</Text>

      </View>

      <View className="ganzhi-row">
        <View className="ganzhi-item">
          <Text className="ganzhi-label">年</Text>
          <Text className="ganzhi-value">{result.timeGanZhi.year.stem}{result.timeGanZhi.year.branch}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">月</Text>
          <Text className="ganzhi-value">{result.timeGanZhi.month.stem}{result.timeGanZhi.month.branch}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">日</Text>
          <Text className="ganzhi-value">{result.timeGanZhi.day.stem}{result.timeGanZhi.day.branch}</Text>
        </View>
        <View className="ganzhi-item">
          <Text className="ganzhi-label">时</Text>
          <Text className="ganzhi-value">{result.timeGanZhi.hour.stem}{result.timeGanZhi.hour.branch}</Text>
        </View>
      </View>

      <View className="xunkong-row">
        <Text className="xunkong-label">旬空</Text>
        <Text className="xunkong-value">{result.xunKong[0]}{result.xunKong[1]}</Text>
      </View>

      <View className="shensha-grid">
        <View className="shensha-item"><Text className="shensha-key">天乙贵人</Text><Text className="shensha-val">{Array.isArray(result.shenSha.天乙贵人) ? result.shenSha.天乙贵人.join('、') : result.shenSha.天乙贵人}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">驿马</Text><Text className="shensha-val">{result.shenSha.驿马}</Text></View>
        <View className="shensha-item highlight-jade"><Text className="shensha-key">禄神</Text><Text className="shensha-val">{result.shenSha.禄神}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">文昌</Text><Text className="shensha-val">{result.shenSha.文昌贵人}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">将星</Text><Text className="shensha-val">{result.shenSha.将星}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">华盖</Text><Text className="shensha-val">{result.shenSha.华盖}</Text></View>
        <View className="shensha-item highlight-jade"><Text className="shensha-key">天医</Text><Text className="shensha-val">{result.shenSha.天医}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">孤辰</Text><Text className="shensha-val">{result.shenSha.孤辰}</Text></View>
        <View className="shensha-item"><Text className="shensha-key">寡宿</Text><Text className="shensha-val">{result.shenSha.寡宿}</Text></View>
        <View className="shensha-item highlight-red"><Text className="shensha-key">桃花</Text><Text className="shensha-val">{result.shenSha.桃花}</Text></View>
        <View className="shensha-item highlight-red"><Text className="shensha-key">咸池</Text><Text className="shensha-val">{result.shenSha.咸池}</Text></View>
      </View>
    </View>
  )
}

export default InfoGrid
