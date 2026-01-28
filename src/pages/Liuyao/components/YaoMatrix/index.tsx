import React from 'react'
import { View, Text } from '@tarojs/components'
import { YAO_LABEL_ORDER } from '../../constants/yaoConstants'
import type { LineState } from '../../types'
import './index.scss'

interface YaoMatrixProps {
  lines: LineState[]
  onLineStateChange: (index: number, state: 'shaoyang' | 'taiyang' | 'shaoyin' | 'taiyin') => void
  isVisible: boolean
}

const YaoMatrix: React.FC<YaoMatrixProps> = ({
  lines,
  onLineStateChange,
  isVisible
}) => {
  if (!isVisible) return null

  const getYaoState = (line: LineState) => {
    if (line.isYang && !line.isMoving) return '少阳'
    if (line.isYang && line.isMoving) return '太阳'
    if (!line.isYang && !line.isMoving) return '少阴'
    if (!line.isYang && line.isMoving) return '太阴'
    return ''
  }

  const handleYaoClick = (realIndex: number, line: LineState) => {
    // 循环切换：少阳 → 太阳 → 少阴 → 太阴 → 少阳
    if (line.isYang && !line.isMoving) onLineStateChange(realIndex, 'taiyang')
    else if (line.isYang && line.isMoving) onLineStateChange(realIndex, 'shaoyin')
    else if (!line.isYang && !line.isMoving) onLineStateChange(realIndex, 'taiyin')
    else onLineStateChange(realIndex, 'shaoyang')
  }

  return (
    <View className="glass-card yao-matrix-section">
      <View className="card-header">
        <Text className="card-section-title">六爻模型</Text>
        <Text className="card-section-guide">点击条目切换阴阳状态</Text>
      </View>
      {YAO_LABEL_ORDER.map((label, displayIndex) => {
        const realIndex = lines.length - 1 - displayIndex
        const l = lines[realIndex] || { isYang: false, isMoving: false }
        const isMoving = l.isMoving

        return (
          <View key={label} className="yao-row">
            <Text className="yao-label-elegant">{label}（{getYaoState(l)}）</Text>

            <View
              className={`yao-symbol ${l.isYang ? 'yang' : 'yin'} ${isMoving ? 'moving' : ''} clickable`}
              onClick={() => handleYaoClick(realIndex, l)}
            >
              {l.isYang ? (
                <View className="yang-line">
                  <View className="line-segment full" />
                </View>
              ) : (
                <View className="yin-line">
                  <View className="line-segment left" />
                  <View className="line-segment right" />
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default YaoMatrix
