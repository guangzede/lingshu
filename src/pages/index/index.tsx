import React from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'

const menuItems = [
  { label: '体验旧版首页', url: '/pages/experience/index' },
  { label: '赛博罗盘', url: '/pages/luopan/index' },
  { label: '六爻排盘', url: '/pages/Liuyao/index' },
  { label: '三维浑天仪', url: '/pages/armillary/index' },
  { label: '占卜卡片', url: '/pages/fortune/index' }
]

const IndexPage: React.FC = () => {
  const handleNav = (url: string) => {
    Taro.navigateTo({ url })
  }

  const [showOverlay, setShowOverlay] = React.useState(true)

  React.useEffect(() => {
    if (!showOverlay) return

    let cleanup: (() => void) | undefined

    const init = () => {
      const query = Taro.createSelectorQuery()
      query.select('#starfield').fields({ node: true, size: true }).exec((res) => {
        const data = res?.[0]
        if (!data || !data.node) return

        const canvas = data.node as any
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const sysInfo = Taro.getSystemInfoSync()
        const dpr = sysInfo.pixelRatio || 1
        const width = data.width || sysInfo.windowWidth
        const height = data.height || sysInfo.windowHeight
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const cx = width / 2
        const cy = height / 2
        const maxDist = Math.max(width, height) * 0.78

        const createStar = () => {
          const angle = Math.random() * Math.PI * 2
          const speed = 0.45 + Math.random() * 0.65
          const depth = Math.random() * 1.6 + 0.6
          return {
            x: cx + (Math.random() * 8 - 4),
            y: cy + (Math.random() * 8 - 4),
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            z: depth,
            size: Math.random() * 1.2 + 0.5
          }
        }

        const stars = new Array(1000).fill(0).map(createStar)

        const raf = (canvas as any).requestAnimationFrame?.bind(canvas) || requestAnimationFrame
        const caf = (canvas as any).cancelAnimationFrame?.bind(canvas) || cancelAnimationFrame
        let frameId: number | undefined

        const render = () => {
          ctx.clearRect(0, 0, width, height)
          stars.forEach((s) => {
            s.x += s.dx * s.z
            s.y += s.dy * s.z

            const dx = s.x - cx
            const dy = s.y - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > maxDist) {
              const reset = createStar()
              s.x = reset.x
              s.y = reset.y
              s.dx = reset.dx
              s.dy = reset.dy
              s.z = reset.z
              s.size = reset.size
            }

            const tail = Math.min(10, 5 * s.z)
            const alpha = 0.3 + Math.random() * 0.25
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.lineWidth = 0.5 * s.z
            ctx.beginPath()
            ctx.moveTo(s.x, s.y)
            ctx.lineTo(s.x - s.dx * tail, s.y - s.dy * tail)
            ctx.stroke()
          })
          frameId = raf ? raf(render) : undefined
        }

        frameId = raf ? raf(render) : undefined

        cleanup = () => {
          if (frameId !== undefined && caf) caf(frameId)
        }
      })
    }

    nextTick(init)

    return () => {
      if (cleanup) cleanup()
    }
  }, [showOverlay])

  return (
    <View className="index-page">
      {showOverlay && (
        <>
          <Canvas type="2d" id="starfield" canvasId="starfield" className="star-canvas" disableScroll />
          <View className="bg-gradient" />
          <View className="bg-noise" />
          <View className="yin-yang" />
        </>
      )}

      <Button className="overlay-toggle" size="mini" onClick={() => setShowOverlay((v) => !v)}>
        {showOverlay ? '关闭蒙层' : '开启蒙层'}
      </Button>

      <View className="menu-page">
        <View className="menu-header">
          <Text className="menu-logo">灵枢</Text>
          <Text className="menu-sub">占·演·观</Text>
        </View>
        <View className="menu-list">
          {menuItems.map((item) => (
            <Button key={item.url} className="menu-button" onClick={() => handleNav(item.url)}>
              {item.label}
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

export default IndexPage
