import React from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'

const menuItems = [
  { label: '六爻排盘', url: '/pages/Liuyao/index' },
  { label: '体验旧版首页(暂弃用)', url: '/pages/experience/index' },
  { label: '赛博罗盘(未完成)', url: '/pages/luopan/index' },
  { label: '紫微斗数(未完成)', url: '/pages/armillary/index' },
  { label: '三维浑天仪(未完成)', url: '/pages/armillary/index' },
  // { label: '占卜卡片', url: '/pages/fortune/index' }
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
      query.select('#starfield').fields({ node: true, size: true }).exec((res: any) => {
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

        const stars: any[] = []
        const maxStars = 200

        const createStar = () => {
          return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random(),
            fadeSpeed: (Math.random() * 0.02) + 0.005
          }
        }

        for (let i = 0; i < maxStars; i++) {
          stars.push(createStar())
        }

        const raf = (canvas as any).requestAnimationFrame?.bind(canvas) || requestAnimationFrame
        const caf = (canvas as any).cancelAnimationFrame?.bind(canvas) || cancelAnimationFrame
        let frameId: number | undefined

        const render = () => {
          ctx.clearRect(0, 0, width, height)

          stars.forEach((s) => {
            s.x += s.vx
            s.y += s.vy

            // 简单的边界反弹/循环
            if (s.x < 0) s.x = width
            if (s.x > width) s.x = 0
            if (s.y < 0) s.y = height
            if (s.y > height) s.y = 0

            // 闪烁效果
            s.alpha += s.fadeSpeed
            if (s.alpha > 1 || s.alpha < 0) {
              s.fadeSpeed = -s.fadeSpeed
            }

            ctx.beginPath()
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`
            ctx.fill()
          })

          // 添加连线逻辑：距离近的星星连线
          ctx.lineWidth = 0.3
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
          for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
              const dx = stars[i].x - stars[j].x
              const dy = stars[i].y - stars[j].y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 60) {
                ctx.beginPath()
                ctx.moveTo(stars[i].x, stars[i].y)
                ctx.lineTo(stars[j].x, stars[j].y)
                ctx.stroke()
              }
            }
          }

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

      <Button className="overlay-toggle" size="mini" onClick={() => setShowOverlay((v: boolean) => !v)}>
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
