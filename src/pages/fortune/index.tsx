import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import './index.scss'

interface FortunePageProps {
  onBack: () => void
}

const FortunePage: React.FC<FortunePageProps> = ({ onBack }) => {
  const handleGoBack = () => {
    onBack()
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

export default FortunePage
