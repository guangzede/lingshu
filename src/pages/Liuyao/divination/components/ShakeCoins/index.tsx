import React from 'react'
import { View, Button, Canvas, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface ShakeCoinsProps {
  step: number
  disabled?: boolean
  onDone: (heads: number) => void
}

interface CoinState {
  x: number
  y: number
  vx: number
  vy: number
  angleZ: number // 绕屏幕法线的旋转（左右旋）
  angleX: number // 上下翻转
  angleY: number // 左右翻转
  spinZ: number
  spinX: number
  spinY: number
  tilt: number
  radius: number
}

// Canvas 版乾隆通宝：带内方孔、高光阴影、金属文字，含抛掷与轻度碰撞
export const ShakeCoins: React.FC<ShakeCoinsProps> = ({ step, disabled, onDone }) => {
  const canvasId = React.useMemo(() => 'shake-canvas', [])
  const canvasRef = React.useRef<any>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const frameRef = React.useRef<number | null>(null)
  const rafFnRef = React.useRef<((cb: FrameRequestCallback) => number) | null>(null)
  const cafFnRef = React.useRef<((id: number) => void) | null>(null)
  const sizeRef = React.useRef<{ w: number; h: number }>({ w: 320, h: 220 })
  const [isShaking, setIsShaking] = React.useState(false)
  const [initError, setInitError] = React.useState<string | null>(null)
  const [hasPanicked, setHasPanicked] = React.useState(false)
  const lastResult = React.useRef<number | null>(null)

  const coinStates = React.useRef<CoinState[]>([])

  // 增强 3D 场景感，让画面更像真实桌面俯视效果
  const planeSkew = 0.22
  const planeScaleY = 0.85
  const cameraPitch = 0.32

  // 初始化 canvas - 统一使用 Taro selectorQuery（H5/Weapp）
  React.useEffect(() => {
    const init = async () => {
      try {
        const query = Taro.createSelectorQuery()
        const data = await new Promise<any>((resolve, reject) => {
          query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res: any) => {
            const d = res?.[0]
            if (d && d.node) resolve(d)
            else reject(new Error('canvas node not found'))
          })
        })

        const canvas = data.node as any
        canvasRef.current = canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Failed to get 2D context')

        const win = (Taro as any).getWindowInfo ? (Taro as any).getWindowInfo() : null
        const dpr = win?.pixelRatio || 1
        const w = data.width || win?.windowWidth || 320
        const h = data.height || 220
        sizeRef.current = { w, h }

        // 优化Canvas尺寸设置，确保高清显示
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
        if (canvas?.style) {
          canvas.style.width = `${w}px`
          canvas.style.height = `${h}px`
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)

        ctxRef.current = ctx
        rafFnRef.current = (canvas as any).requestAnimationFrame?.bind(canvas) || (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(globalThis) : null)
        cafFnRef.current = (canvas as any).cancelAnimationFrame?.bind(canvas) || (typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame.bind(globalThis) : null)
        sizeRef.current = { w, h }

        // 初始化时绘制三个静态平铺的金币
        const radius = Math.min(w, h) * 0.18
        const centerY = h * 0.5
        const spacing = radius * 2.4
        const startX = w * 0.5 - spacing

        const initialCoins: CoinState[] = [
          { x: startX, y: centerY, vx: 0, vy: 0, angleZ: 0, angleX: 0, angleY: 0, spinZ: 0, spinX: 0, spinY: 0, tilt: 0, radius },
          { x: startX + spacing, y: centerY, vx: 0, vy: 0, angleZ: 0, angleX: 0, angleY: 0, spinZ: 0, spinX: 0, spinY: 0, tilt: 0, radius },
          { x: startX + spacing * 2, y: centerY, vx: 0, vy: 0, angleZ: 0, angleX: 0, angleY: 0, spinZ: 0, spinX: 0, spinY: 0, tilt: 0, radius }
        ]
        coinStates.current = initialCoins

        // 绘制背景
        ctx.clearRect(0, 0, w, h)
        const bg = ctx.createLinearGradient(0, 0, 0, h)
        bg.addColorStop(0, '#0c1118')
        bg.addColorStop(0.55, '#0b0d10')
        bg.addColorStop(1, '#08090c')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // 绘制桌面纹理，增强真实感
        ctx.save()
        ctx.globalAlpha = 0.05
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * w
          const y = Math.random() * h
          const size = Math.random() * 3 + 1
          ctx.fillRect(x, y, size, size)
        }
        ctx.restore()

        // 绘制三个静态金币
        for (const coin of initialCoins) {
          drawCoin(ctx, coin, true)
        }

        setInitError(null)
        console.log('[ShakeCoins] canvas initialized', w, h, dpr)
      } catch (error) {
        console.error('Canvas init error:', error)
        setInitError(`初始化失败: ${error instanceof Error ? error.message : String(error)}`)
        // 延迟重试，最多尝试3次
        if (!init.retryCount) init.retryCount = 0
        if (init.retryCount < 3) {
          init.retryCount++
          setTimeout(() => {
            init()
          }, 500)
        }
      }
    }

    if (!disabled) {
      init()
    }

    return () => {
      // 更彻底的清理，防止内存泄漏
      if (frameRef.current !== null && cafFnRef.current) {
        try { cafFnRef.current(frameRef.current) } catch {}
      }
      frameRef.current = null
      ctxRef.current = null
      rafFnRef.current = null
      cafFnRef.current = null
    }
  }, [canvasId, disabled])

  const drawMetalText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, rotate: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotate)
    // 金币文字使用强对比的金色渐变，增加质感
    const grad = ctx.createLinearGradient(-12, -12, 14, 16)
    grad.addColorStop(0, '#fffacd') // 浅亮金色
    grad.addColorStop(0.25, '#ffed4e') // 高光金色
    grad.addColorStop(0.5, '#ffd700') // 标准金色
    grad.addColorStop(0.75, '#daa520') // 深金色
    grad.addColorStop(1, '#b8860b') // 更深的金色
    ctx.fillStyle = grad
    // 增强描边：深棕色 + 更粗的线宽实现高对比
    ctx.strokeStyle = 'rgba(101,50,15,0.85)'
    ctx.lineWidth = 2.1
    ctx.font = '900 18px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 增强阴影营造质感
    ctx.shadowColor = 'rgba(0,0,0,0.72)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2.5
    ctx.fillText(text, 0, 0)
    ctx.strokeText(text, 0, 0)
    // 额外的内层高光营造浮雕质感
    ctx.shadowColor = 'rgba(255,255,255,0.35)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = -0.8
    ctx.shadowOffsetY = -0.8
    ctx.globalAlpha = 0.4
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }

  const drawCoin = (ctx: CanvasRenderingContext2D, coin: CoinState, frontFace: boolean) => {
    const { x, y, angleZ, angleX, angleY, tilt, radius } = coin
    ctx.save()

    // 透视倾斜 & 双轴翻转（不镜像文字，仅用缩放表示透视）
    const rawScaleX = Math.cos(angleY)
    const viewAngleX = angleX + cameraPitch // 让 coin 默认略微俯卧在桌面
    const scaleX = Math.max(0.12, Math.abs(rawScaleX))
    const scaleY = Math.max(0.12, Math.abs(Math.cos(viewAngleX))) * 0.82
    const faceRatio = Math.max(0, Math.abs(rawScaleX) * Math.abs(Math.cos(viewAngleX))) // 1 正视，0 侧视
    const edgeFactor = 1 - faceRatio
    ctx.translate(x, y)
    ctx.rotate(tilt)
    ctx.scale(scaleX, scaleY)
    ctx.rotate(angleZ * 0.04)

    const r = radius
    const hole = r * 0.32

    // 厚度（侧边）- 更真实的金币边缘效果
    if (edgeFactor > 0.08) {
      const h = r * 0.35 * edgeFactor
      const gradSide = ctx.createLinearGradient(0, -h, 0, h)
      gradSide.addColorStop(0, 'rgba(255,223,120,0.9)')
      gradSide.addColorStop(0.3, 'rgba(255,193,7,0.95)')
      gradSide.addColorStop(0.5, 'rgba(184,134,11,0.98)')
      gradSide.addColorStop(0.7, 'rgba(255,193,7,0.95)')
      gradSide.addColorStop(1, 'rgba(255,223,120,0.9)')
      ctx.fillStyle = gradSide
      ctx.beginPath()
      const rr = r * 0.96
      ctx.moveTo(-rr, -h)
      ctx.lineTo(rr, -h)
      ctx.quadraticCurveTo(rr + 4, 0, rr, h)
      ctx.lineTo(-rr, h)
      ctx.quadraticCurveTo(-rr - 4, 0, -rr, -h)
      ctx.closePath()
      ctx.fill()

      // 侧边高光，增强金属质感
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.beginPath()
      ctx.moveTo(-rr + 2, -h + 1)
      ctx.lineTo(rr - 2, -h + 1)
      ctx.lineTo(rr - 4, -h + 3)
      ctx.lineTo(-rr + 4, -h + 3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    // 外圈 - 更真实的金币色彩和光泽
    const ringGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r)
    ringGrad.addColorStop(0, '#ffed4e') // 亮金色高光
    ringGrad.addColorStop(0.2, '#ffd700') // 标准金色
    ringGrad.addColorStop(0.4, '#ffc107') // 稍暗金色
    ringGrad.addColorStop(0.6, '#daa520') // 深金色
    ringGrad.addColorStop(0.8, '#b8860b') // 暗金色
    ringGrad.addColorStop(1, '#8b6914') // 更深的金色
    ctx.fillStyle = ringGrad
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 外圈高光带 - 增强金属感
    const rimGrad = ctx.createRadialGradient(r * 0.15, -r * 0.2, r * 0.15, 0, 0, r * 1.1)
    rimGrad.addColorStop(0, 'rgba(255,255,255,0.55)')
    rimGrad.addColorStop(0.2, 'rgba(255,250,200,0.4)')
    rimGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)')
    rimGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rimGrad
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2)
    ctx.fill()

    // 内圈厚度
    ctx.lineWidth = r * 0.12
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.stroke()

    // 方孔：切除（保持清晰）
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.rect(-hole, -hole, hole * 2, hole * 2)
    ctx.fill()
    ctx.restore()

    // 方孔边缘微光 - 更真实的金属边缘
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 240, 180, 0.9)'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.strokeRect(-hole, -hole, hole * 2, hole * 2)

    // 方孔内阴影
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(-hole + 1, -hole + 1, hole * 2 - 2, hole * 2 - 2)
    ctx.restore()

    // 主高光（强化金属质感）
    const shine = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r * 0.95)
    shine.addColorStop(0, 'rgba(255,255,255,0.6)')
    shine.addColorStop(0.2, 'rgba(255,245,200,0.3)')
    shine.addColorStop(0.5, 'rgba(255,255,255,0.1)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 次高光，增加金币表面的细节
    const secondaryShine = ctx.createRadialGradient(r * 0.3, r * 0.3, r * 0.05, r * 0.3, r * 0.3, r * 0.6)
    secondaryShine.addColorStop(0, 'rgba(255,255,255,0.3)')
    secondaryShine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = secondaryShine
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 移除暗角效果，避免金币上出现黑色阴影

    // 金币纹理，增加表面细节
    ctx.save()
    ctx.globalAlpha = 0.15
    for (let i = 0; i < 150; i++) {
      const rr = Math.random() * r * 0.95
      const theta = Math.random() * Math.PI * 2
      const px = Math.cos(theta) * rr
      const py = Math.sin(theta) * rr
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(139,69,19,0.5)'
      ctx.beginPath()
      ctx.arc(px, py, Math.random() * 1.2 + 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // 文字：正面"福"、"禄"，反面"财"、"运"
    if (frontFace) {
      drawMetalText(ctx, '福', 0, -r * 0.62, 0)
      drawMetalText(ctx, '禄', 0, r * 0.62, 0)
      drawMetalText(ctx, '财', -r * 0.62, 0, -Math.PI / 2)
      drawMetalText(ctx, '运', r * 0.62, 0, Math.PI / 2)
    } else {
      drawMetalText(ctx, '恭', -r * 0.55, 0, -Math.PI / 2)
      drawMetalText(ctx, '喜', r * 0.55, 0, Math.PI / 2)
    }

    ctx.restore()
  }

  const startShake = React.useCallback(() => {
    if (isShaking || disabled) return

    // 如果已经是第6次且有保存的结果，直接排盘
    if (step >= 6 && lastResult.current !== null) {
      setHasPanicked(true)
      onDone(lastResult.current)
      lastResult.current = null
      return
    }

    const ctx = ctxRef.current
    if (!ctx) return

    setIsShaking(true)

    const { w, h } = sizeRef.current
    const baseY = h * 0.72
    const radius = 46

    const projectToTable = (px: number, py: number) => ({
      px,
      py: py * planeScaleY - (px - w * 0.5) * planeSkew
    })

    // 初始化三枚金币的初始状态，增强真实感和多样性
    const randSpin = () => 12 + Math.random() * 15 // 更随机的旋转速度
    const states: CoinState[] = [
      {
        x: w * (0.3 + Math.random() * 0.04), // 随机初始位置
        y: baseY,
        vx: (Math.random() - 0.5) * 200, // 更随机的水平速度
        vy: -250 - Math.random() * 150, // 更随机的垂直速度
        angleZ: Math.random() * Math.PI * 2,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        spinZ: randSpin() * (Math.random() > 0.5 ? 1 : -1), // 随机旋转方向
        spinX: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        spinY: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        tilt: (Math.random() - 0.5) * 1.0, // 更大的初始倾斜角度
        radius
      },
      {
        x: w * (0.48 + Math.random() * 0.04),
        y: baseY,
        vx: (Math.random() - 0.5) * 200,
        vy: -280 - Math.random() * 150,
        angleZ: Math.random() * Math.PI * 2,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        spinZ: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        spinX: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        spinY: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        tilt: (Math.random() - 0.5) * 1.0,
        radius
      },
      {
        x: w * (0.66 + Math.random() * 0.04),
        y: baseY,
        vx: (Math.random() - 0.5) * 200,
        vy: -230 - Math.random() * 150,
        angleZ: Math.random() * Math.PI * 2,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        spinZ: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        spinX: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        spinY: randSpin() * (Math.random() > 0.5 ? 1 : -1),
        tilt: (Math.random() - 0.5) * 1.0,
        radius
      }
    ]
    coinStates.current = states

    const gravity = 800 // px/s^2，增强重力，使金币更快回落，更符合真实物理效果
    const floorY = baseY
    const safeNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now()
    const startTime = safeNow()
    const duration = 1500 // 增加动画持续时间，让金币有足够的时间完成抛出、旋转和落地的完整过程

    const render = () => {
      const now = safeNow()
      const dt = Math.min(0.03, (now - (render as any).last || 0) / 1000)
      ;(render as any).last = now

      ctx.clearRect(0, 0, w, h)
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#0c1118')
      bg.addColorStop(0.55, '#0b0d10')
      bg.addColorStop(1, '#08090c')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      const tableSheen = ctx.createLinearGradient(0, h * 0.55, 0, h)
      tableSheen.addColorStop(0, 'rgba(255,255,255,0.04)')
      tableSheen.addColorStop(1, 'rgba(255,255,255,0.01)')
      ctx.fillStyle = tableSheen
      ctx.fillRect(0, h * 0.55, w, h * 0.45)

      // 更新物理：重力、反弹、简单碰撞
      for (const c of coinStates.current) {
        // 应用重力
        c.vy += gravity * dt

        // 更新位置
        c.x += c.vx * dt
        c.y += c.vy * dt

        // 更新旋转
        c.angleZ += c.spinZ * dt
        c.angleX += c.spinX * dt
        c.angleY += c.spinY * dt

        // 动态阻尼：根据金币状态调整阻尼系数
        const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy)
        const spinSpeed = Math.sqrt(c.spinZ * c.spinZ + c.spinX * c.spinX + c.spinY * c.spinY)

        // 速度越快，阻尼越小，使金币在高速运动时更流畅
        // 增加阻尼系数，加快稳定速度
        const velocityDamping = Math.max(0.94, 1 - speed * 0.0008)
        const spinDamping = Math.max(0.95, 1 - spinSpeed * 0.0015)

        c.vx *= velocityDamping
        c.vy *= velocityDamping
        c.spinZ *= spinDamping
        c.spinX *= spinDamping
        c.spinY *= spinDamping

        // 角度吸附：当旋转速度较慢时，引导角度向最近的π整数倍靠拢
        const PI = Math.PI
        const spinThreshold = 3.0 // 当旋转速度低于此值时开始吸附
        const snapStrength = 0.4 // 更强的吸附强度，加快稳定速度

        // X轴吸附
        if (Math.abs(c.spinX) < spinThreshold) {
          const targetX = Math.round(c.angleX / PI) * PI
          const diffX = targetX - c.angleX
          // 添加一个引导力，让角度向目标靠拢
          c.spinX += diffX * snapStrength
          c.spinX *= 0.8 // 更强的阻尼，加快稳定速度
        }

        // Y轴吸附
        if (Math.abs(c.spinY) < spinThreshold) {
          const targetY = Math.round(c.angleY / PI) * PI
          const diffY = targetY - c.angleY
          c.spinY += diffY * snapStrength
          c.spinY *= 0.8
        }

        // 边界水平碰撞 - 增加摩擦效果
        if (c.x < c.radius) {
          c.x = c.radius
          c.vx = -c.vx * 0.65
          // 碰撞时增加旋转阻尼
          c.spinZ *= 0.8
          c.spinX *= 0.8
        }
        if (c.x > w - c.radius) {
          c.x = w - c.radius
          c.vx = -c.vx * 0.65
          // 碰撞时增加旋转阻尼
          c.spinZ *= 0.8
          c.spinX *= 0.8
        }

        // 地面反弹 - 动态调整反弹系数
        if (c.y > floorY) {
          // 确保金币不会陷入地面
          c.y = floorY

          // 根据下落速度调整反弹系数
          const impactSpeed = Math.abs(c.vy)
          const bounceFactor = Math.max(0.3, 0.5 - impactSpeed * 0.0005)

          c.vy = -c.vy * bounceFactor

          // 落地时增加旋转阻尼
          c.spinZ *= 0.8
          c.spinX *= 0.8
          c.spinY *= 0.8

          // 落地时增加水平速度阻尼
          c.vx *= 0.9
        }
      }

      // 碰撞分离（改进版）
      for (let i = 0; i < coinStates.current.length; i++) {
        for (let j = i + 1; j < coinStates.current.length; j++) {
          const a = coinStates.current[i]
          const b = coinStates.current[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const minDist = a.radius + b.radius - 8
          if (dist < minDist) {
            // 碰撞法线
            const nx = dx / dist
            const ny = dy / dist

            // 分离重叠部分
            const overlap = (minDist - dist) * 0.55
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap

            // 计算相对速度
            const relativeVelocityX = b.vx - a.vx
            const relativeVelocityY = b.vy - a.vy

            // 计算相对速度在碰撞法线方向上的分量
            const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny

            // 如果金币正在相互远离，就不处理碰撞
            if (velocityAlongNormal > 0) continue

            // 碰撞弹性系数
            const restitution = 0.6

            // 计算碰撞冲量
            const impulse = -(1 + restitution) * velocityAlongNormal / 2

            // 应用冲量到金币速度
            a.vx -= impulse * nx
            a.vy -= impulse * ny
            b.vx += impulse * nx
            b.vy += impulse * ny

            // 碰撞时增加旋转
            const spinImpulse = impulse * 0.05
            a.spinZ += spinImpulse * ny
            a.spinX += spinImpulse * nx
            b.spinZ -= spinImpulse * ny
            b.spinX -= spinImpulse * nx

            // 碰撞阻尼
            a.vx *= 0.9
            a.vy *= 0.9
            b.vx *= 0.9
            b.vy *= 0.9
          }
        }
      }

      // 绘制
      coinStates.current.forEach((c) => {
        const frontFace = Math.cos(c.angleY) >= 0
        const { px, py } = projectToTable(c.x, c.y)
        drawCoin(ctx, { ...c, x: px, y: py }, frontFace)
        // 投影阴影贴合桌面透视，更真实的阴影效果
        ctx.save()
        // 使用金币的实际位置计算阴影位置
        const { px: coinPx, py: coinPy } = projectToTable(c.x, c.y)
        const { px: sx, py: sy } = projectToTable(c.x, floorY + 2)
        const shadowScale = 1 - Math.abs(Math.cos(c.angleX + cameraPitch)) * 0.15
        const shadowWidth = c.radius * 1.35 * shadowScale
        const shadowHeight = c.radius * 0.3 * shadowScale
        const shadowAlpha = Math.max(0.15, 0.4 - Math.abs(c.vy) * 0.0005) // 阴影透明度随高度变化

        // 更真实的阴影渐变
        const shadowGrad = ctx.createRadialGradient(sx, sy, shadowHeight * 0.1, sx, sy, shadowWidth)
        shadowGrad.addColorStop(0, `rgba(0,0,0,${shadowAlpha * 1.2})`)
        shadowGrad.addColorStop(0.3, `rgba(0,0,0,${shadowAlpha})`)
        shadowGrad.addColorStop(0.7, `rgba(0,0,0,${shadowAlpha * 0.5})`)
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = shadowGrad
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        // 阴影位置基于金币的实际位置，不添加额外偏移
        ctx.ellipse(sx, sy, shadowWidth, shadowHeight, -planeSkew * 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      const elapsed = now - startTime
      const settling = coinStates.current.every(c =>
        Math.abs(c.vy) < 25 &&
        Math.abs(c.vx) < 12 &&
        Math.abs(c.spinX) < 0.2 &&
        Math.abs(c.spinY) < 0.2 &&
        c.y >= floorY - 1
      )

      if (elapsed < duration || !settling) {
        frameRef.current = rafFnRef.current ? rafFnRef.current(render) : null
      } else {
        // 最终稳定状态：平滑对齐到π的整数倍
        const PI = Math.PI
        coinStates.current.forEach((c) => {
          // 平滑对齐角度
          c.angleX = Math.round(c.angleX / PI) * PI
          c.angleY = Math.round(c.angleY / PI) * PI
          c.angleZ = Math.round(c.angleZ / (PI / 2)) * (PI / 2) // 对齐到90度

          // 重置状态
          c.tilt = 0
          c.spinX = 0
          c.spinY = 0
          c.spinZ = 0
          c.vx = 0
          c.vy = 0

          // 确保金币在地面上
          c.y = floorY

          // 确保金币在边界内
          c.x = Math.max(c.radius, Math.min(w - c.radius, c.x))
        })

        // 计算结果
        const heads = coinStates.current.filter(c => Math.cos(c.angleY) >= 0).length
        setIsShaking(false)

        // 如果是第6次，直接排盘
        if (step >= 6) {
          setHasPanicked(true)
          onDone(heads)
        } else {
          onDone(heads)
        }
      }
    }

    frameRef.current = rafFnRef.current ? rafFnRef.current(render) : null
  }, [disabled, isShaking, onDone, step])

  // 设备摇一摇触发
  React.useEffect(() => {
    let last = 0
    const threshold = 1.6 // g 值阈值
    const cooldown = 900
    const handler = (res: any) => {
      if (disabled || isShaking) return
      const g = Math.sqrt(res.x * res.x + res.y * res.y + res.z * res.z)
      const now = Date.now()
      if (g > threshold && now - last > cooldown) {
        last = now
        startShake()
      }
    }
    const canAccel = typeof (Taro as any).onAccelerometerChange === 'function'
    if (!canAccel) return

    try {
      // @ts-ignore taro typing may differ by端
      Taro.startAccelerometer?.({ interval: 'game' })
    } catch (e) { /* ignore */ }

    // @ts-ignore
    Taro.onAccelerometerChange(handler)

    return () => {
      // @ts-ignore
      Taro.offAccelerometerChange?.(handler)
      try {
        // @ts-ignore
        Taro.stopAccelerometer?.()
      } catch (e) { /* ignore */ }
    }
  }, [disabled, isShaking, startShake])

  return (
    <View className="shake-section">
      <Text style={{
        color: 'rgba(201, 173, 111, 0.75)',
        fontSize: '22px',
        fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif",
        letterSpacing: '2px',
        lineHeight: '1.6'
      }}>
        摇卦：点击"摇一摇"六次，依次生成自下而上的六爻
      </Text>
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        style={{
          width: '100%',
          height: '220px',
          borderRadius: '12px',
          backgroundColor: 'rgba(8, 10, 16, 0.6)',
          border: '1px solid rgba(201, 173, 111, 0.15)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      />
      {initError ? (
        <Text style={{
          color: '#ff6b6b',
          fontSize: '22px',
          fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif"
        }}>
          {initError}
        </Text>
      ) : null}
      {step < 6 && (
        <View className="shake-actions">
          <Button
            size="default"
            className={`btn-shake ${isShaking ? 'disabled' : ''}`}
            disabled={isShaking || disabled}
            onClick={startShake}
          >
            {`摇一摇（${step + 1}/6）`}
          </Button>
        </View>
      )}
    </View>
  )
}

export default ShakeCoins
