import React from 'react'
import { View, Text, Picker } from '@tarojs/components'
import './index.scss'

interface TimeInputProps {
  dateValue: string
  timeValue: string
  todayStr: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  isVisible: boolean
}

const TimeInput: React.FC<TimeInputProps> = ({
  dateValue,
  timeValue,
  todayStr,
  onDateChange,
  onTimeChange,
  isVisible
}) => {
  if (!isVisible) return null

  return (
    <View className="glass-card datetime-card">
      <View className="card-header">
        <Text className="card-section-title">记录时间</Text>
        <Text className="card-section-guide">点击时间和日期选择</Text>
      </View>
      <View className="datetime-inputs">
        <View className="input-group">
          <Text className="input-label-elegant">日期</Text>
          <Picker mode="date" value={dateValue} end={todayStr} onChange={(e) => onDateChange(e.detail.value)}>
            <View className="value-with-underline">
              <Text className="value-text">{dateValue.replace(/-/g, '年').replace(/年(\d+)$/, '年$1月').replace(/月(\d+)$/, '月$1日')}</Text>
            </View>
          </Picker>
        </View>

        <View className="input-group">
          <Text className="input-label-elegant">时间</Text>
          <Picker mode="time" value={timeValue} onChange={(e) => onTimeChange(e.detail.value)}>
            <View className="value-with-underline">
              <Text className="value-text">{timeValue}</Text>
            </View>
          </Picker>
        </View>
      </View>
    </View>
  )
}

export default TimeInput
