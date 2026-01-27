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
          手动输入
        </Text>
        <Text
          className={`mode-tab ${mode === 'count' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('count')}
        >
          报数起卦
        </Text>
        <Text
          className={`mode-tab ${mode === 'auto' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('auto')}
        >
          自动排盘
        </Text>
        <Text
          className={`mode-tab ${mode === 'shake' ? 'mode-tab-active' : ''}`}
          onClick={() => onModeChange('shake')}
        >
          摇卦
        </Text>
      </View>
    </View>
  )
}

export default ModeSelector
