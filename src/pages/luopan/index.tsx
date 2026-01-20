import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import CyberLuopan from '@/components/CyberLuopan'
import THEME from '@/constants/theme'
import './index.scss'

const LuopanPage: React.FC = () => {
  const [isComputing, setIsComputing] = useState(false)
  const [animationState, setAnimationState] = useState<'idle' | 'flyIn' | 'rotating'>('idle')

  const handleFlyIn = () => {
    setAnimationState('flyIn')
  }

  const handleRotate = () => {
    setAnimationState('rotating')
  }

  const handleStart = () => {
    setIsComputing(true)
    setTimeout(() => {
      setIsComputing(false)
    }, 3000)
  }

  return (
    <View className="luopan-page">
      {/* 3D 罗盘场景 */}
      <View className="canvas-container">
        <Canvas
          camera={{ position: [0, 15, 0], fov: 60 }}
          style={{
            background: THEME.DarkBg,
            width: '100%',
            height: '100%'
          }}
        >
          {/* 光源 */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 5, 5]} intensity={1.5} color={THEME.Gold} />
          <pointLight position={[0, -3, 3]} intensity={0.8} color={THEME.NeonCyan} />

          {/* 罗盘组件 */}
          <CyberLuopan isComputing={isComputing} animationState={animationState} />

          {/* 拖拽旋转控制器 */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            minDistance={8}
            maxDistance={20}
            zoomSpeed={0.5}
            rotateSpeed={0.8}
          />
        </Canvas>
      </View>

      {/* 控制面板 */}
      <View className="control-panel" style={{ display: 'flex' }}>
        <Text className="title">赛博罗盘</Text>
        <Text className="subtitle">机械环枢 · 磁悬浮流转</Text>

        <View className="button-group">
          <Button
            className="control-button"
            onClick={handleFlyIn}
            disabled={animationState !== 'idle'}
          >
            飞入
          </Button>

          <Button
            className="control-button"
            onClick={handleRotate}
            disabled={animationState !== 'flyIn'}
          >
            旋转
          </Button>

          <Button
            className="control-button"
            onClick={handleStart}
            disabled={animationState !== 'rotating' || isComputing}
          >
            {isComputing ? '运转中' : '启动演算'}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default LuopanPage
