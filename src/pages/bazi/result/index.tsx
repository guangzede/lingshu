import React from 'react'
import Taro from '@tarojs/taro'
import { useBaziStore } from '@/store/bazi'

const BaziResultPage: React.FC = () => {
  const { setActiveTab } = useBaziStore()

  React.useEffect(() => {
    setActiveTab('result')
    Taro.redirectTo({ url: '/pages/bazi/index' })
  }, [setActiveTab])

  return null
}

export default BaziResultPage
