import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface ResponsiveLayoutProps {
  columns?: number
  gap?: number
  className?: string
  children?: React.ReactNode
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ columns = 2, gap = 12, className = '', children }) => {
  const style = {
    ['--cols' as any]: columns,
    ['--gap' as any]: `${gap}px`
  }
  return (
    <View className={`responsive-layout ${className}`} style={style as any}>
      {children}
    </View>
  )
}

export default ResponsiveLayout
