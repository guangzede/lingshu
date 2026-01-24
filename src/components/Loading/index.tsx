import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  onFinish?: () => void
  duration?: number
}

const Loading: React.FC<LoadingProps> = ({ onFinish, duration = 500 }) => {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress)
      } else {
        // 加载完成，立即淡出
        setFadeOut(true)
        setTimeout(() => {
          onFinish?.()
        }, 300)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [duration, onFinish])

  return (
    <View className={`loading-page ${fadeOut ? 'fade-out' : ''}`}>
      <View className="loading-content">
        {/* 太极图作为Loading图标 */}
        <View className="loading-taiji">
          <View className="taiji-rotate" />
        </View>

        {/* 应用名称 */}
        <Text className="loading-title">灵枢</Text>
        <Text className="loading-subtitle">占·演·观</Text>

        {/* 进度条 */}
        <View className="progress-container">
          <View className="progress-bar" style={{ width: `${progress}%` }} />
        </View>
        <Text className="progress-text">{Math.floor(progress)}%</Text>
      </View>

      {/* 星空背景 - 简化版 */}
      <View className="loading-stars">
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </View>
    </View>
  )
}

export default Loading
