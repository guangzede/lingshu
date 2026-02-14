import React from 'react'
import { View, Button, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'

interface FloatingBarProps {
  isLoadingHistory: boolean
  hasResult: boolean
  question: string
  aiAnalysis?: string
  onToggleHistory: () => void
  onSaveCase: () => void
}

const FloatingBar: React.FC<FloatingBarProps> = ({
  isLoadingHistory,
  hasResult,
  question,
  onToggleHistory,
  onSaveCase
}) => {
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  const handleNewDivination = () => {
    // ✅ 获取store实例并调用resetAllState
    const store = useLiuyaoStore.getState()
    store.resetAllState()
    Taro.redirectTo({ url: '/pages/Liuyao/divination/index' })
  }

  return (
    <View className="floating-bar">
      <Button
        className="floating-btn btn-back"
        onClick={handleGoBack}
      >
        <Text className="btn-icon">⬅</Text>
        <Text className="btn-label">返回</Text>
      </Button>

      <Button
        className="floating-btn btn-new"
        onClick={handleNewDivination}
      >
        <Text className="btn-icon">🔄</Text>
        <Text className="btn-label">新占卜</Text>
      </Button>

      <Button
        className="floating-btn btn-history"
        onClick={onToggleHistory}
      >
        <Text className="btn-icon">📚</Text>
        <Text className="btn-label">历史</Text>
      </Button>

      <Button
        className="floating-btn btn-save"
        disabled={!hasResult}
        onClick={onSaveCase}
      >
        <Text className="btn-icon">💾</Text>
        <Text className="btn-label">保存</Text>
      </Button>
    </View>
  )
}

export default FloatingBar
