import React from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'

const menuItems = [
  { id: 'bazi', label: '八字排盘', url: '/pages/bazi/index' },
  { id: 'liuyao', label: '六爻排盘', url: '/pages/Liuyao/index?source=home' },
  // { id: 'experience', label: '体验旧版首页(暂弃用)', url: '/pages/experience/index' },
  // { id: 'luopan', label: '赛博罗盘(未完成)', url: '/pages/luopan/index' },
  // { id: 'ziwei', label: '紫微斗数(未完成)', url: '/pages/armillary/index' },
  // { id: 'armillary', label: '三维浑天仪(未完成)', url: '/pages/armillary/index' },
  // { id: 'fortune', label: '占卜卡片', url: '/pages/fortune/index' }
]

const IndexPage: React.FC = () => {
  const handleNav = (url: string) => {
    Taro.navigateTo({ url })
  }

  const [showOverlay, setShowOverlay] = React.useState(true)
  const [isVisible, setIsVisible] = React.useState(true)
  const canvasElRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (!showOverlay) return

    let cleanup: (() => void) | undefined

    const init = () => {
      const isH5 = process.env.TARO_ENV === 'h5'
      
      if (isH5) {
        // H5环境：使用传统DOM方式
        const getCanvasEl = (): HTMLCanvasElement | null => {
          // 优先使用 React ref，其次多策略兼容查询
          return (
            (canvasElRef.current as any) ||
            (document.getElementById('starfield') as HTMLCanvasElement | null) ||
            (document.querySelector('canvas#starfield') as HTMLCanvasElement | null) ||
            (document.querySelector('[canvas-id="starfield"]') as HTMLCanvasElement | null) ||
            null
          )
        }
        const rawEl = getCanvasEl()
        if (!rawEl) {
          setTimeout(init, 100)
          return
        }
        // 兼容 Taro H5 的 <taro-canvas-core> 自定义元素：从 shadowRoot 获取真实 <canvas>
        const resolveCanvas = (el: any): HTMLCanvasElement | null => {
          if (!el) return null
          if (typeof HTMLCanvasElement !== 'undefined' && el instanceof HTMLCanvasElement) return el
          const tag = (el.tagName || '').toLowerCase()
          const fromShadow: any = el.shadowRoot?.querySelector?.('canvas') || null
          const fromChildren: any = el.querySelector?.('canvas') || null
          const target: any = fromShadow || fromChildren
          return target && typeof HTMLCanvasElement !== 'undefined' && target instanceof HTMLCanvasElement ? target : null
        }

        const canvas = resolveCanvas(rawEl)
        if (!canvas) {
          console.error('[H5 Canvas] Unable to resolve inner <canvas> from element:', (rawEl as any).tagName)
          setTimeout(init, 100)
          return
        }

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

        // 极其细微的星尘效果
        const stars: any[] = []
        const maxStars = 350

        const createStar = () => {
          return {
            x: Math.random() * width,
            y: Math.random() * height,
            // 更小的半径，呈现细微星尘感
            radius: Math.random() * 0.8 + 0.3,
            // 极慢的移动速度
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            alpha: Math.random() * 0.6 + 0.2,
            fadeSpeed: (Math.random() * 0.008) + 0.002
          }
        }

        for (let i = 0; i < maxStars; i++) {
          stars.push(createStar())
        }

        // 星云区域
        const nebulae = [
          { x: width * 0.3, y: height * 0.25, radius: width * 0.25, alpha: 0.015 },
          { x: width * 0.7, y: height * 0.65, radius: width * 0.2, alpha: 0.012 }
        ]

        const raf = (canvas as any).requestAnimationFrame?.bind(canvas) || requestAnimationFrame
        const caf = (canvas as any).cancelAnimationFrame?.bind(canvas) || cancelAnimationFrame
        let frameId: number | undefined

        const render = () => {
          ctx.clearRect(0, 0, width, height)

          // 绘制极其淡薄的星云
          nebulae.forEach(neb => {
            const gradient = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius)
            gradient.addColorStop(0, `rgba(201, 173, 111, ${neb.alpha})`)
            gradient.addColorStop(0.5, `rgba(150, 170, 200, ${neb.alpha * 0.5})`)
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
            ctx.fillStyle = gradient
            ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2)
          })

          // 绘制极其细微的星尘
          stars.forEach((s) => {
            s.x += s.vx
            s.y += s.vy

            // 边界循环
            if (s.x < 0) s.x = width
            if (s.x > width) s.x = 0
            if (s.y < 0) s.y = height
            if (s.y > height) s.y = 0

            // 轻微闪烁
            s.alpha += s.fadeSpeed
            if (s.alpha > 0.8 || s.alpha < 0.2) {
              s.fadeSpeed = -s.fadeSpeed
            }

            ctx.beginPath()
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
            ctx.globalAlpha = Math.abs(s.alpha) * 0.7
            ctx.fillStyle = '#ffffff'
            ctx.fill()
            ctx.globalAlpha = 1
          })

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
          <Canvas type="2d" id="starfield" canvasId="starfield" className="star-canvas" disableScroll ref={canvasElRef as any} />
          <View className="bg-gradient" />
          <View className="bg-noise" />
          {/* 中心太极图 - 纯CSS实现 */}
          <View className="yin-yang" />
        </>
      )}

      <View className="menu-page">
        {/* 中心标题区域 */}
        <View className="center-content">
          <View className="menu-header">
            <Text className="menu-logo">灵枢</Text>
            <Text className="menu-sub">寂然不动 · 感而遂通</Text>
          </View>
        </View>

        {/* 底部幽灵按钮 */}
        <View className="bottom-actions">
          {menuItems.map((item) => (
            <Button key={item.id} className="ghost-button" onClick={() => handleNav(item.url)}>
              {item.label}
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

export default IndexPage
