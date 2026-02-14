import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'

interface BottomButtonsProps {
  isLoadingHistory: boolean
  hasResult: boolean
  question: string
  aiAnalysis?: string
}

const BottomButtons: React.FC<BottomButtonsProps> = ({ isLoadingHistory, hasResult, question, aiAnalysis }) => {
  const handleSaveCase = async () => {
    const { saveCurrentCase } = useLiuyaoStore.getState()
    const doSave = async () => {
      try {
        const id = await saveCurrentCase(undefined, aiAnalysis, '保存中...')
        Taro.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
        return id
      } catch (err: any) {
        Taro.showToast({ title: err?.message || '保存失败', icon: 'none', duration: 2000 })
        return ''
      }
    }

    if (!question.trim()) {
      Taro.showModal({
        title: '提示',
        content: '求测事项为空，确认仍要保存吗？',
        confirmText: '保存',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) doSave()
        }
      })
    } else {
      doSave()
    }
  }

  const handleViewHistory = () => {
    Taro.navigateTo({ url: '/pages/LiuyaoHistory/index' })
  }

  if (isLoadingHistory) {
    return (
      <View className="bottom-buttons-container">
        <Button
          onClick={handleViewHistory}
          className="btn-view-history"
        >
          返回卦簿
        </Button>
      </View>
    )
  }

  return (
    <View className="bottom-buttons-container">
      <Button
        onClick={handleSaveCase}
        disabled={!hasResult}
        className="btn-save-case"
      >
        保存案例
      </Button>
      <Button
        onClick={handleViewHistory}
        className="btn-view-history"
      >
        历史记录
      </Button>
    </View>
  )
}

export default BottomButtons
