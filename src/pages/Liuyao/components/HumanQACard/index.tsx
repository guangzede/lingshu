import React, { useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import qrcodeImg from './qrcode.jpg'

interface HumanQACardProps {
  question: string
}

const HumanQACard: React.FC<HumanQACardProps> = ({ question }) => {
  const [showQRCode, setShowQRCode] = useState(false)

  const handleConsult = () => {
    Taro.setClipboardData({
      data: '530070136',
      success: () => {
        Taro.showToast({
          title: '微信号已复制到剪贴板。\n请前往微信“添加朋友”粘贴搜索。',
          icon: 'none',
          duration: 2500
        })
        setShowQRCode(true)
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
          <Text className="card-title">专属咨询通道</Text>
          <Text className="card-desc">针对当前盘面，提供定制化的人工解读服务。</Text>
        </View>
        <View className="card-body">
          <Text className="label">此刻想法</Text>
          <Text className="content">{question || '暂无填写'}</Text>
          <Text className="tips">注：咨询内容仅供学术探讨或娱乐化参考。</Text>
        </View>
        <Button className="primary-btn" onClick={handleConsult}>
          预约人工咨询
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
              src={qrcodeImg}
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
