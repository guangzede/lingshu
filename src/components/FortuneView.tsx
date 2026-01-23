import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './FortuneView.scss'

interface FortuneViewProps {
  onBack?: () => void
}

const FortuneView: React.FC<FortuneViewProps> = ({ onBack }) => {
  const handleGoBack = () => {
    if (onBack) {
      onBack()
    } else {
      Taro.navigateBack({ delta: 1 })
    }
  }

  return (
    <View className="fortune-page">
      <View className="container">
        <Text className="title">占卜结果</Text>
        <View className="result-box">
          <Text className="result-text">这是占卜结果</Text>
        </View>
        <Button className="back-button" onClick={handleGoBack}>
          返回
        </Button>
      </View>
    </View>
  )
}

export default FortuneView
