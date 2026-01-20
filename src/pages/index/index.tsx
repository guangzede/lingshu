import React, { useMemo, useState, Suspense } from 'react'
import { View, Text, Button } from '@tarojs/components'
import MosaicTransition from '../../components/MosaicTransition'
import FortunePage from '../fortune'
import THEME from '../../constants/theme'
import './index.scss'

// 懒加载浑天仪组件（仅 H5 环境）
const ArmillaryLazy = React.lazy(() => import('../../components/ArmillarySphere'))

const IndexPage: React.FC = () => {
  const [showTransition, setShowTransition] = useState(false)
  const [showFortune, setShowFortune] = useState(false)

  const transitionDuration = 900
  const isH5 = useMemo(() => process.env.TARO_ENV === 'h5', [])

  const handleNavigate = () => {
    if (showTransition) return
    setShowTransition(true)
    setTimeout(() => {
      setShowFortune(true)
    }, transitionDuration * 0.6)
  }

  const handleBack = () => {
    if (showTransition) return
    setShowTransition(true)
    setTimeout(() => {
      setShowFortune(false)
    }, transitionDuration * 0.6)
  }

  const overlay = useMemo(
    () =>
      showTransition ? (
        <MosaicTransition
          duration={transitionDuration}
          onFinish={() => setShowTransition(false)}
        />
      ) : null,
    [showTransition, transitionDuration]
  )

  return (
    <View className="index-page">
      {/* 背景噪点层 */}
      <View className="bg-noise" />
      <View className="bg-gradient" />

      {/* 浑天仪 3D 场景 - 仅 H5 */}
      {isH5 && (
        <View className="armillary-container">
          <Suspense fallback={<View />}>
            <ArmillaryLazy width="100%" height="100%" />
          </Suspense>
        </View>
      )}

      {overlay}

      {showFortune ? (
        <FortunePage onBack={handleBack} />
      ) : (
        <>
          {/* 顶部标题区 */}
          <View className="header">
            <Text className="logo">灵枢</Text>
            <Text className="tagline">CYBER · DIVINATION · SYSTEM</Text>
          </View>

          {/* 底部玻璃拟态操作面板 */}
          <View className="control-panel">
            <View className="panel-inner">
              <Text className="panel-title">时空界面已就绪</Text>
              <Text className="panel-subtitle">准备启动命理演算引擎</Text>

              <Button
                className="launch-button"
                onClick={handleNavigate}
                hoverClass="launch-button-hover"
              >
                <Text className="button-text">启动时空</Text>
                <Text className="button-icon">⚡</Text>
              </Button>

              <View className="info-grid">
                <View className="info-item">
                  <Text className="info-label">量子态</Text>
                  <Text className="info-value">稳定</Text>
                </View>
                <View className="info-item">
                  <Text className="info-label">灵能指数</Text>
                  <Text className="info-value">99.7%</Text>
                </View>
                <View className="info-item">
                  <Text className="info-label">道法版本</Text>
                  <Text className="info-value">v4.2.0</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

export default IndexPage
