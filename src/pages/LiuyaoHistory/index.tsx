import React from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'

interface HistoryItem {
  id: string
  dateValue: string
  timeValue: string
  question: string
  remark?: string
  createdAt: number
  baseHexName?: string
  variantHexName?: string
}

const LiuyaoHistoryPage: React.FC = () => {
  const { getSavedCases, loadCase, deleteCase } = useLiuyaoStore((s) => s)
  const [cases, setCases] = React.useState<HistoryItem[]>([])

  const loadCases = React.useCallback(() => {
    const saved = getSavedCases()
    setCases(saved)
  }, [getSavedCases])

  React.useEffect(() => {
    // 首次进入页面加载数据
    loadCases()
  }, [loadCases])

  // 监听页面显示事件（小程序前台切换/返回该页时触发）
  useDidShow(() => {
    loadCases()
  })

  const handleLoadCase = (id: string) => {
    const success = loadCase(id)
    if (success) {
      // 加载成功后跳转到结果页
      Taro.navigateTo({ 
        url: '/pages/Liuyao/result/index'
      })
    } else {
      // 校验异常才提示
      Taro.showModal({
        title: '加载失败',
        content: '保存的卦例数据不完整或已损坏，无法加载。',
        showCancel: false
      })
    }
  }

  const handleDeleteCase = (id: string) => {
    Taro.showModal({
      title: '删除确认',
      content: '确定要删除这个卦例吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          deleteCase(id)
          setCases(cases.filter(c => c.id !== id))
          Taro.showToast({ title: '删除成功', icon: 'success', duration: 1000 })
        }
      }
    })
  }

  const formatDate = (dateStr: string, timeStr: string) => {
    return `${dateStr} ${timeStr}`
  }

  return (
    <View className="liuyao-history-page">
      <View className="history-header">
        <Text className="history-title">复盘</Text>
        <Text className="history-count">共 {cases.length} 条锦囊</Text>
      </View>

      {cases.length === 0 ? (
        <View className="history-empty">
          <Text className="empty-text">暂无保存的卦例</Text>
        </View>
      ) : (
        <ScrollView scrollY className="history-content">
          <View className="history-list">
            {cases.map((item, idx) => (
              <View key={item.id} className="case-card">
                {/* 卦例标题和时间 */}
                <View className="case-header">
                  <Text className="case-number-title">
                    {idx + 1}. {item.question || '未记录您的想法'}
                  </Text>
                  <Text className="case-time">
                    {formatDate(item.dateValue, item.timeValue)}
                  </Text>
                </View>

                {/* 卦象信息 */}
                <View className="hexagram-info">
                  <View className="hexagram-item">
                    <Text className="hexagram-label">本卦</Text>
                    <Text className="hexagram-name">{item.baseHexName || '—'}</Text>
                  </View>
                  <View className="hexagram-item">
                    <Text className="hexagram-label">变卦</Text>
                    <Text className="hexagram-name">{item.variantHexName || '—'}</Text>
                  </View>
                </View>

                {/* 备注 */}
                {item.remark && (
                  <View className="remark-section">
                    <Text className="remark-label">备注</Text>
                    <Text className="remark-text">{item.remark}</Text>
                  </View>
                )}

                {/* 操作按钮 */}
                <View className="case-actions">
                  <Button className="btn-load" onClick={() => handleLoadCase(item.id)}>
                    加载
                  </Button>
                  <Button className="btn-delete" onClick={() => handleDeleteCase(item.id)}>
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 底部返回按钮 */}
      <View className="history-footer">
        <Button className="btn-back" onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
          返回
        </Button>
      </View>
    </View>
  )
}

export default LiuyaoHistoryPage
