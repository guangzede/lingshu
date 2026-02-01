import React from 'react'
import Taro from '@tarojs/taro'

// 六爻页面重定向到起卦页
const LiuyaoPage: React.FC = () => {
  React.useEffect(() => {
    Taro.redirectTo({
      url: '/pages/Liuyao/divination/index'
    })
  }, [])

  return null
}

export default LiuyaoPage
