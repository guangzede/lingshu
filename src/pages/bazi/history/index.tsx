import React from 'react'
import Taro from '@tarojs/taro'
import { useBaziStore } from '@/store/bazi'

const BaziHistoryPage: React.FC = () => {
  const { setActiveTab } = useBaziStore()

  React.useEffect(() => {
    setActiveTab('history')
    Taro.redirectTo({ url: '/pages/bazi/index' })
  }, [setActiveTab])

  return null
}

export default BaziHistoryPage
