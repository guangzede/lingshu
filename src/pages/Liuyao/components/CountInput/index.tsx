import React from 'react'
import { View, Text, Input } from '@tarojs/components'
import './index.scss'

interface CountInputProps {
  countNumbers: string
  onCountNumbersChange: (value: string) => void
  isVisible: boolean
}

const CountInput: React.FC<CountInputProps> = ({
  countNumbers,
  onCountNumbersChange,
  isVisible
}) => {
  if (!isVisible) return null

  return (
    <View className="input-area">
      <View className="glass-card count-input-card">
        <View className="card-header">
          <Text className="card-section-title">报数起卦</Text>
          <Text className="card-section-guide">根据数字起卦</Text>
        </View>
        <Input
          className="number-input-elegant"
          type="number"
          value={countNumbers}
          placeholder="输入任意长度数字（梅花易数）"
          style={{ height: '52px', lineHeight: '26px' }}
          onInput={(e) => onCountNumbersChange(e.detail.value)}
        />
      </View>
    </View>
  )
}

export default CountInput
