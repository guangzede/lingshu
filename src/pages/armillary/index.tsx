import React, { Suspense, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
// 使用相对路径，避免别名未配置导致的解析失败
const ArmillaryLazy = React.lazy(() => import('../../components/ArmillarySphere'))
import './index.scss'

const ArmillaryPage: React.FC = () => {
  const isH5 = useMemo(() => process.env.TARO_ENV === 'h5', [])

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (!isH5) {
    return (
      <View className="armillary-page">
        <View className="info">
          <Text className="title">浑天仪</Text>
          <Text className="desc">该效果仅在 H5 端展示</Text>
          <Button className="back-button" onClick={handleBack}>
            返回首页
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="armillary-page">
      <View className="canvas-wrapper">
        <Suspense fallback={<Text>加载中...</Text>}>
          <ArmillaryLazy width="100%" height="100%" />
        </Suspense>
      </View>
      <View className="info">
        <Text className="title">浑天仪</Text>
        <Text className="desc">赛博道教 · 星河环轨</Text>
        <Button className="back-button" onClick={handleBack}>
          返回首页
        </Button>
      </View>
    </View>
  )
}

export default ArmillaryPage
