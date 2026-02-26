import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type NavKey = 'home' | 'input' | 'result' | 'history'
type ActiveNavKey = Exclude<NavKey, 'home'>

const NAVS: Array<{ key: NavKey; label: string; url: string }> = [
  { key: 'home', label: '首页', url: '/pages/index/index' },
  { key: 'input', label: '排盘', url: '/pages/daliuren/index' },
  { key: 'result', label: '结果', url: '/pages/daliuren/index' },
  { key: 'history', label: '记录', url: '/pages/daliuren/index' }
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
      await Taro.navigateTo({ url })
    } catch (err) {
      Taro.redirectTo({ url })
    }
  }

  return (
    <div className='daliuren-top-nav'>
      <div className='daliuren-top-nav-inner'>
        {NAVS.map((item) => (
          <button
            key={item.key}
            className={`daliuren-top-tab ${item.key === active ? 'active' : ''}`}
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
