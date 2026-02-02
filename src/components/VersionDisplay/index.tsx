import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface VersionDisplayProps {
  showBuildTime?: boolean
  className?: string
}

/**
 * 版本信息显示组件
 * 在开发环境显示版本号，可用于验证是否有新的构建
 */
const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showBuildTime = false,
  className = ''
}) => {
  const [version, setVersion] = React.useState<string>('loading...')
  const [buildTime, setBuildTime] = React.useState<string>('')

  React.useEffect(() => {
    // 动态导入版本信息
    import('@/constants/version').then((versionModule) => {
      setVersion(versionModule.APP_VERSION)
      setBuildTime(versionModule.BUILD_TIME)
    }).catch((err) => {
      console.warn('Failed to load version info:', err)
      setVersion('unknown')
    })
  }, [])

  return (
    <View className={`version-display ${className}`}>
      <Text className="version-text">
        v{version}
      </Text>
      {showBuildTime && buildTime && (
        <Text className="build-time-text">
          Build: {buildTime}
        </Text>
      )}
    </View>
  )
}

export default VersionDisplay
