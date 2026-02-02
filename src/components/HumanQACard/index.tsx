import React, { useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'


interface HumanQACardProps {
  question: string
}

const HumanQACard: React.FC<HumanQACardProps> = ({ question }) => {
  const [showQRCode, setShowQRCode] = useState(false)

  const handleConsult = () => {
    setShowQRCode(true)
    Taro.setClipboardData({
      data: '530070136',
      success: () => {
        Taro.showToast({
          title: '微信号已复制到剪贴板。\n请前往微信“添加朋友”粘贴搜索。',
          icon: 'none',
          duration: 2500
        })
      }
    })
  }

  const handleClose = () => {
    setShowQRCode(false)
  }

  const handleContentClick = (e: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
  }

  return (
    <>
      <View className="human-qa-card glass-card">
        <View className="card-header">
          <Text className="card-title">深度咨询</Text>
          <Text className="card-desc">针对当前盘面，共同探讨易学文化。</Text>
        </View>
        <View className="card-body">
          <Text className="content">{question || '暂无填写'}</Text>
          <Text className="tips">注：咨询内容仅供学术探讨或娱乐化参考。</Text>
        </View>
        <Button className="primary-btn" onClick={handleConsult}>
          预约咨询服务
        </Button>
      </View>

      {/* 二维码弹窗 */}
      {showQRCode && (
        <View className="qrcode-modal" onClick={handleClose}>
          <View className="qrcode-content" onClick={handleContentClick}>
            <View className="qrcode-header">
              <Text className="qrcode-title">共同学习</Text>
              <Text className="qrcode-close" onClick={handleClose}>✕</Text>
            </View>
            <Image
              className="qrcode-image"
              src={require('./qrcode.jpg')}
              mode="widthFix"
              showMenuByLongpress
            />
            <Text className="qrcode-tip">长按识别二维码或保存图片</Text>
          </View>
        </View>
      )}
    </>
  )
}

export default HumanQACard
