import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'

interface HistoryListProps {
  cases: Array<{
    id: string
    dateValue: string
    timeValue: string
    question: string
    remark?: string
    createdAt: number
    baseHexName?: string
    variantHexName?: string
  }>
  onClose: () => void
}

const HistoryList: React.FC<HistoryListProps> = ({ cases, onClose }) => {
  const { loadCase, deleteCase, compute } = useLiuyaoStore((s) => s)
  const [loading, setLoading] = React.useState(false)

  const handleLoadCase = async (id: string) => {
    setLoading(true)
    const success = await loadCase(id, '加载中...')

    if (success) {
      // 加载成功后刷新计算（可选，如果需要重新算AI分析）
      await compute()
      Taro.showToast({ title: '加载成功', icon: 'success', duration: 1000 })
      onClose() // 关闭抽屉
    } else {
      Taro.showModal({
        title: '加载失败',
        content: '保存的卦例数据不完整或已损坏，无法加载。',
        showCancel: false
      })
    }
    setLoading(false)
  }

  const handleDeleteCase = (id: string, question: string) => {
    Taro.showModal({
      title: '删除确认',
      content: `确定要删除"${question}"吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          const ok = await deleteCase(id, '删除中...')
          if (ok) {
            Taro.showToast({ title: '删除成功', icon: 'success', duration: 1000 })
            // 需要重新加载列表，这里触发父组件刷新
            window.location.reload() // 简单方案，后续可优化
          } else {
            Taro.showToast({ title: '删除失败', icon: 'none', duration: 1000 })
          }
        }
      }
    })
  }

  if (cases.length === 0) {
    return (
      <View className='history-list'>
        <View className='history-empty'>
          <Text className='empty-icon'>📭</Text>
          <Text className='empty-text'>暂无历史记录</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='history-list'>
      {cases.map((caseItem) => {
        const createdDate = new Date(caseItem.createdAt)
        const dateStr = createdDate.toLocaleDateString('zh-CN')
        const timeStr = createdDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

        return (
          <View key={caseItem.id} className='history-item'>
            <View className='history-item-main' onClick={() => handleLoadCase(caseItem.id)}>
              <View className='history-item-header'>
                <Text className='history-date'>{dateStr} {timeStr}</Text>
                <Text className='history-hexagram'>
                  {caseItem.baseHexName && caseItem.variantHexName
                    ? `${caseItem.baseHexName}→${caseItem.variantHexName}`
                    : '卦象'}
                </Text>
              </View>
              <Text className='history-question' numberOfLines={2}>
                {caseItem.question || '(无求测事项)'}
              </Text>
              {caseItem.remark && (
                <Text className='history-remark' numberOfLines={1}>
                  💬 {caseItem.remark}
                </Text>
              )}
            </View>

            <Button
              className='history-item-delete'
              onClick={() => handleDeleteCase(caseItem.id, caseItem.question)}
              disabled={loading}
            >
              🗑️
            </Button>
          </View>
        )
      })}
    </View>
  )
}

export default HistoryList
