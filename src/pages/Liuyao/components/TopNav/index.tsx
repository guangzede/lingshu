import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type NavKey = 'home' | 'divination' | 'result' | 'history'
type ActiveNavKey = Exclude<NavKey, 'home'>

const NAVS: Array<{ key: NavKey; label: string; url: string }> = [
  { key: 'home', label: '首页', url: '/pages/index/index' },
  { key: 'divination', label: '起卦', url: '/pages/Liuyao/divination/index' },
  { key: 'result', label: '结果', url: '/pages/Liuyao/result/index' },
  { key: 'history', label: '记录', url: '/pages/LiuyaoHistory/index' }
]

const TopNav: React.FC<{ active: ActiveNavKey }> = ({ active }) => {
  const handleGo = async (url: string, key: NavKey) => {
    if (key === active) return
    if (key === 'home') {
      try {
        await Taro.reLaunch({ url })
      } catch (err) {
        await Taro.navigateTo({ url })
      }
      return
    }
    try {
      const pages = typeof Taro.getCurrentPages === 'function' ? Taro.getCurrentPages() : []
      const targetRoute = url.replace(/^\//, '')
      const index = pages.findIndex((p) => p.route === targetRoute)
      if (index >= 0) {
        const delta = pages.length - 1 - index
        if (delta > 0) {
          await Taro.navigateBack({ delta })
          return
        }
      }
      await Taro.navigateTo({ url })
    } catch (err) {
      Taro.redirectTo({ url })
    }
  }

  return (
    <div className='liuyao-top-nav'>
      <div className='liuyao-top-nav-inner'>
        {NAVS.map((item) => (
          <button
            key={item.key}
            className={`liuyao-top-tab ${item.key === active ? 'active' : ''}`}
            onClick={() => handleGo(item.url, item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TopNav
