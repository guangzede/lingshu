import React from 'react'
import { ScrollView, View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBaziStore } from '@/store/bazi'
import type { BaziCaseListItem } from '@/types/baziCase'
import './index.scss'

const HistoryPanel: React.FC = () => {
  const { getSavedCases, loadCase, deleteCase, setActiveTab } = useBaziStore((s) => s)
  const [cases, setCases] = React.useState<BaziCaseListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const loadCases = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const saved = await getSavedCases('加载中...')
      setCases(saved)
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '加载失败', icon: 'none', duration: 2000 })
    } finally {
      setIsLoading(false)
    }
  }, [getSavedCases])

  React.useEffect(() => {
    loadCases()
  }, [loadCases])

  const handleLoadCase = async (id: string) => {
    const success = await loadCase(id, '加载中...')
    if (success) {
      setActiveTab('result')
    } else {
      Taro.showModal({
        title: '加载失败',
        content: '保存的排盘数据不完整或已损坏，无法加载。',
        showCancel: false
      })
    }
  }

  const handleDeleteCase = (id: string) => {
    Taro.showModal({
      title: '删除确认',
      content: '确定要删除这个排盘记录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          const ok = await deleteCase(id, '删除中...')
          if (ok) {
            setCases(cases.filter(c => c.id !== id))
            Taro.showToast({ title: '删除成功', icon: 'success', duration: 1000 })
          } else {
            Taro.showToast({ title: '删除失败', icon: 'none', duration: 2000 })
          }
        }
      }
    })
  }

  const formatDate = (dateStr?: string, timeStr?: string) => {
    if (!dateStr && !timeStr) return '手动四柱'
    return `${dateStr || '--'} ${timeStr || '--'}`
  }

  return (
    <View className="bazi-history-panel">
      <View className="history-header">
        <Text className="history-title">排盘记录</Text>
        <Text className="history-count">共 {cases.length} 条记录</Text>
      </View>

      {isLoading ? (
        <View className="history-empty">
          <Text className="empty-text">加载中...</Text>
        </View>
      ) : cases.length === 0 ? (
        <View className="history-empty">
          <Text className="empty-text">暂无保存的排盘记录</Text>
        </View>
      ) : (
        <ScrollView scrollY className="history-content">
          <View className="history-list">
            {cases.map((item, idx) => (
              <View key={item.id} className="case-card">
                <View className="case-header">
                  <Text className="case-number-title">
                    {idx + 1}. {item.name || '未命名排盘'}
                  </Text>
                  <Text className="case-time">
                    {formatDate(item.birthDate, item.birthTime)}
                  </Text>
                </View>

                {item.note && (
                  <View className="remark-section">
                    <Text className="remark-label">备注</Text>
                    <Text className="remark-text">{item.note}</Text>
                  </View>
                )}

                <View className="case-actions">
                  <Button className="btn-load" onClick={() => handleLoadCase(item.id)}>
                    查看
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

      <View className="history-footer">
        <Button className="btn-back" onClick={() => setActiveTab('input')}>
          返回
        </Button>
      </View>
    </View>
  )
}

export default HistoryPanel
