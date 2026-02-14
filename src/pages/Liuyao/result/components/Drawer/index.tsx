import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import './index.scss'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Drawer: React.FC<DrawerProps> = ({ open, onClose, children }) => {
  const isPcMode = typeof window !== 'undefined' && window.innerWidth >= 1024

  React.useEffect(() => {
    // 仅在移动模式下处理背景滚动锁定
    if (!isPcMode) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open, isPcMode])

  // PC 模式下始终显示，移动模式下根据 open 状态显示
  if (!isPcMode && !open) return null

  return (
    <View className="drawer-wrapper">
      {/* 背景遮罩，仅在移动模式下显示且可点击 */}
      {!isPcMode && (
        <View className="drawer-mask" onClick={onClose} />
      )}

      {/* 抽屉容器 */}
      <View className="drawer-container">
        {/* 抽屉头部 */}
        <View className="drawer-header">
          <Text className="drawer-title">📖 历史记录</Text>
          {/* 仅在移动模式下显示关闭按钮 */}
          {!isPcMode && (
            <Button className="drawer-close" onClick={onClose}>
              ✕
            </Button>
          )}
        </View>

        {/* 抽屉内容 */}
        <View className="drawer-content">
          {children}
        </View>
      </View>
    </View>
  )
}

export default Drawer
