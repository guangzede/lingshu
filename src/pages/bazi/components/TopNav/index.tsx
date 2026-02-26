import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type NavKey = 'home' | 'input' | 'result' | 'history'
type ActiveNavKey = Exclude<NavKey, 'home'>

const NAVS: Array<{ key: NavKey; label: string; url: string }> = [
  { key: 'home', label: '首页', url: '/pages/index/index' },
  { key: 'input', label: '排盘', url: '/pages/bazi/index' },
  { key: 'result', label: '结果', url: '/pages/bazi/result/index' },
  { key: 'history', label: '记录', url: '/pages/bazi/history/index' }
]

const TopNav: React.FC<{ active: ActiveNavKey; onSelect?: (key: ActiveNavKey) => void }> = ({ active, onSelect }) => {
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
    if (onSelect) {
      onSelect(key)
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
    <div className='bazi-top-nav'>
      <div className='bazi-top-nav-inner'>
        {NAVS.map((item) => (
          <button
            key={item.key}
            className={`bazi-top-tab ${item.key === active ? 'active' : ''}`}
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
