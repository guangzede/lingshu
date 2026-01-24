import React from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'

const menuItems = [
  { id: 'liuyao', label: '六爻排盘', url: '/pages/Liuyao/index?source=home' },
  { id: 'experience', label: '体验旧版首页(暂弃用)', url: '/pages/experience/index' },
  { id: 'luopan', label: '赛博罗盘(未完成)', url: '/pages/luopan/index' },
  { id: 'ziwei', label: '紫微斗数(未完成)', url: '/pages/armillary/index' },
  { id: 'armillary', label: '三维浑天仪(未完成)', url: '/pages/armillary/index' },
  // { id: 'fortune', label: '占卜卡片', url: '/pages/fortune/index' }
]

const IndexPage: React.FC = () => {
  const handleNav = (url: string) => {
    Taro.navigateTo({ url })
  }

  const [showOverlay, setShowOverlay] = React.useState(true)
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (!showOverlay) return

    let cleanup: (() => void) | undefined

    const init = () => {
      const isH5 = process.env.TARO_ENV === 'h5'
      
      if (isH5) {
        // H5环境：使用传统DOM方式
        const canvasEl = document.getElementById('starfield')
        if (!canvasEl) {
          setTimeout(init, 100)
          return
        }
        
        // 确保是Canvas元素
        if (!(canvasEl instanceof HTMLCanvasElement)) {
          console.error('[H5 Canvas] Element is not a canvas:', canvasEl.tagName)
          return
        }
        
        const canvas = canvasEl
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('[H5 Canvas] Failed to get 2d context')
          return
        }

        // H5窗口尺寸与DPR
        const dpr = window.devicePixelRatio || 1
        const width = window.innerWidth || document.documentElement.clientWidth || 375
        const height = window.innerHeight || document.documentElement.clientHeight || 667
        
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(dpr, dpr)

        initStarfield(canvas, ctx, width, height)
      } else {
        // 小程序环境：使用Taro标准API
        const query = Taro.createSelectorQuery()
        query.select('#starfield').fields({ node: true, size: true }).exec((res: any) => {
          const data = res?.[0]
          if (!data || !data.node) {
            setTimeout(init, 100)
            return
          }

          const canvas = data.node as any
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // Weapp窗口尺寸与DPR（优先使用新API，兼容旧API）
          const win = (Taro as any).getWindowInfo ? (Taro as any).getWindowInfo() : null
          const dpr = win?.pixelRatio || 1
          const width = data.width || win?.windowWidth || 375
          const height = data.height || win?.windowHeight || 667
          canvas.width = width * dpr
          canvas.height = height * dpr
          ctx.scale(dpr, dpr)

          initStarfield(canvas, ctx, width, height)
        })
      }
    }
    
    const initStarfield = (canvas: any, ctx: CanvasRenderingContext2D, width: number, height: number) => {

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
            ctx.globalAlpha = Math.abs(s.alpha)
            ctx.fillStyle = '#ffffff'
            ctx.fill()
            ctx.globalAlpha = 1
          })

          // 添加连线逻辑：距离近的星星连线
          ctx.lineWidth = 0.3
          ctx.strokeStyle = '#ffffff'
          for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
              const dx = stars[i].x - stars[j].x
              const dy = stars[i].y - stars[j].y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 60) {
                ctx.beginPath()
                ctx.moveTo(stars[i].x, stars[i].y)
                ctx.lineTo(stars[j].x, stars[j].y)
                ctx.globalAlpha = 0.15
                ctx.stroke()
                ctx.globalAlpha = 1
              }
            }
          }
        frameId = raf ? raf(render) : undefined
      }

      // 启动动画循环并提供清理函数
      render()
      cleanup = () => {
        if (frameId !== undefined && caf) caf(frameId)
      }
      
    }

    nextTick(init)

    return () => {
      if (cleanup) cleanup()
    }
  }, [showOverlay])

  return (
    <View className={`index-page ${isVisible ? 'visible' : ''}`}>
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
            <Button key={item.id} className="menu-button" onClick={() => handleNav(item.url)}>
              {item.label}
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

export default IndexPage
