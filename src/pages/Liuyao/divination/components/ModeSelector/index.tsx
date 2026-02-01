import React from 'react'
import { View, Text } from '@tarojs/components'
import type { PaipanMode } from '../../types'
import './index.scss'

interface ModeSelectorProps {
  mode: PaipanMode | 'shake'
  onModeChange: (mode: PaipanMode | 'shake') => void
  isLoadingHistory: boolean
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange, isLoadingHistory }) => {
  if (isLoadingHistory) return null

  return (
    <View className="top-section">
      <View className="mode-selector">
        <Text
          className={`mode-tab ${mode === 'manual' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('manual')}
        >
          自选数据
        </Text>
        <Text
          className={`mode-tab ${mode === 'count' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('count')}
        >
          数字分析
        </Text>
        <Text
          className={`mode-tab ${mode === 'auto' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('auto')}
        >
          自动模式
        </Text>
        <Text
          className={`mode-tab ${mode === 'shake' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('shake')}
        >
          沉浸模式
        </Text>
      </View>
    </View>
  )
}

export default ModeSelector
