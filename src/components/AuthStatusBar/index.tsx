import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getToken, getStoredUserInfo } from '@/services/auth'
import './index.scss'

/**
 * 认证状态栏组件
 * 未登录时显示固定条形，已登录时显示用户信息
 */
const AuthStatusBar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [username, setUsername] = React.useState('')

  React.useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const token = getToken()
    if (token) {
      setIsLoggedIn(true)
      const userInfo = getStoredUserInfo()
      setUsername(userInfo?.nickname || userInfo?.username || '用户')
    } else {
      setIsLoggedIn(false)
    }
  }

  // 监听登录状态变化
  React.useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus()
    }

    // 页面显示时检查登录状态（处理登录后返回的情况）
    const handlePageShow = () => {
      checkAuthStatus()
    }
    
    Taro.eventCenter.on('authStatusChange', handleAuthChange)
    Taro.eventCenter.on('pageShow', handlePageShow)

    return () => {
      Taro.eventCenter.off('authStatusChange', handleAuthChange)
      Taro.eventCenter.off('pageShow', handlePageShow)
    }
  }, [])

  const handleNavigate = () => {
    if (!isLoggedIn) {
      // 未登录：跳转到登录页
      Taro.navigateTo({
        url: '/pages/auth/index'
      })
    } else {
      // 已登录：跳转到个人资料页
      Taro.navigateTo({
        url: '/pages/profile/index'
      })
    }
  }

  return (
    <>
      <View 
        className={`auth-status-bar ${!isLoggedIn ? 'unfixed' : 'logged-in'}`}
        onClick={handleNavigate}
      >
        {!isLoggedIn ? (
          <View className="auth-status-content">
            <Text className="auth-status-text">未登录 · 点击登录</Text>
          </View>
        ) : (
          <View className="auth-status-content logged-content">
            <View className="user-info">
              <Text className="username-text">{username}</Text>
              <Text className="go-to-text">已登录</Text>
            </View>
            <View className="arrow-icon">›</View>
          </View>
        )}
      </View>
      {/* 未登录时添加占位符，防止内容被 fixed 组件遮挡 */}
      {!isLoggedIn && <View className="auth-status-spacer" />}
    </>
  )
}

export default AuthStatusBar
