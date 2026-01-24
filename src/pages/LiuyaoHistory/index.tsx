import React from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import THEME from '@/constants/theme'
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
      // 数据完整则返回上一页（Liuyao）以免增加页面栈
      Taro.navigateBack({ delta: 1 })
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
      <View style={{ padding: '15px', borderBottom: `1px solid #555` }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: THEME.Gold }}>保存的卦例</Text>
        <Text style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>共 {cases.length} 个卦例</Text>
      </View>

      {cases.length === 0 ? (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Text style={{ color: '#999', fontSize: '14px' }}>暂无保存的卦例</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ height: 'calc(100vh - 120px)' }}>
          <View style={{ padding: '10px' }}>
            {cases.map((item, idx) => (
              <View
                key={item.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1a'
                }}
              >
                {/* 基本信息 */}
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {idx + 1}. {item.question || '未填写求测事项'}
                  </Text>
                  <Text style={{ fontSize: '11px', color: '#999' }}>
                    {formatDate(item.dateValue, item.timeValue)}
                  </Text>
                </View>

                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <Text style={{ fontSize: '12px', color: '#bbb' }}>
                    本卦：{item.baseHexName || '—'}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#bbb' }}>
                    变卦：{item.variantHexName || '—'}
                  </Text>
                </View>

                {/* 备注（如果有） */}
                {item.remark && (
                  <Text style={{ fontSize: '12px', color: '#bbb', marginBottom: '10px' }}>
                    备注：{item.remark}
                  </Text>
                )}

                {/* 按钮组 */}
                <View style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    size="mini"
                    onClick={() => handleLoadCase(item.id)}
                    style={{
                      flex: 1,
                      backgroundColor: THEME.Gold,
                      color: '#000',
                      fontSize: '12px'
                    }}
                  >
                    加载
                  </Button>
                  <Button
                    size="mini"
                    onClick={() => handleDeleteCase(item.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#ff6b6b',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 底部返回按钮 */}
      <View style={{ padding: '15px', borderTop: '1px solid #555', backgroundColor: '#1a1a1a' }}>
        <Button
          onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}
          style={{ width: '100%', backgroundColor: '#666', color: '#fff' }}
        >
          返回
        </Button>
      </View>
    </View>
  )
}

export default LiuyaoHistoryPage
