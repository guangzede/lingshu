import React, { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import '../HumanQACard/index.scss'

interface ModalPayload {
  image?: string
}

const ModalPortal: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [payload, setPayload] = useState<ModalPayload | null>(null)

  useEffect(() => {
    const open = (p: ModalPayload = {}) => {
      setPayload(p)
      setVisible(true)
      try {
        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
      } catch (err) {}
    }
    const close = () => {
      setVisible(false)
      setPayload(null)
      try {
        if (typeof document !== 'undefined') document.body.style.overflow = ''
      } catch (err) {}
    }

    Taro.eventCenter.on('openQRModal', open)
    Taro.eventCenter.on('closeQRModal', close)

    return () => {
      Taro.eventCenter.off('openQRModal', open)
      Taro.eventCenter.off('closeQRModal', close)
    }
  }, [])

  if (!visible) return null

  return (
    <View className="qrcode-modal" onClick={() => Taro.eventCenter.trigger('closeQRModal')}>
      <View className="qrcode-content" onClick={(e: any) => e?.stopPropagation?.()}>
        <View className="qrcode-header">
          <Text className="qrcode-title">共同学习</Text>
          <Text className="qrcode-close" onClick={() => Taro.eventCenter.trigger('closeQRModal')}>✕</Text>
        </View>
        {payload?.image && (
          <Image className="qrcode-image" src={payload.image} mode="widthFix" showMenuByLongpress />
        )}
        <Text className="qrcode-tip">长按识别二维码或保存图片</Text>
      </View>
    </View>
  )
}

export default ModalPortal
