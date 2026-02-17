import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type NavKey = 'input' | 'result' | 'history'

const NAVS: Array<{ key: NavKey; label: string; url: string }> = [
  { key: 'input', label: '排盘', url: '/pages/daliuren/index' },
  { key: 'result', label: '结果', url: '/pages/daliuren/index' },
  { key: 'history', label: '记录', url: '/pages/daliuren/index' }
]

const TopNav: React.FC<{ active: NavKey; onSelect?: (key: NavKey) => void }> = ({ active, onSelect }) => {
  const handleGo = async (url: string, key: NavKey) => {
    if (key === active) return
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
    <div className="daliuren-top-nav">
      <button
        className="daliuren-home-btn"
        onClick={() => {
          try {
            Taro.reLaunch({ url: '/pages/index/index' })
          } catch (err) {
            Taro.navigateTo({ url: '/pages/index/index' })
          }
        }}
      >
        首页
      </button>
      <div className="daliuren-top-nav-inner">
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
