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

  // 伪 3D 场景，让画面像俯视桌面
  const planeSkew = 0.18
  const planeScaleY = 0.9
  const cameraPitch = 0.28

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
        setInitError(null)
        console.log('[ShakeCoins] canvas initialized', w, h, dpr)
      } catch (error) {
        console.error('Canvas init error:', error)
        setInitError(`初始化失败: ${error instanceof Error ? error.message : String(error)}`)
        // 延迟重试
        setTimeout(() => {
          init()
        }, 500)
      }
    }

    if (!disabled) {
      init()
    }

    return () => {
      if (frameRef.current !== null && cafFnRef.current) {
        try { cafFnRef.current(frameRef.current) } catch {}
      }
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

    // 厚度（侧边）- 使用更金黄的颜色
    if (edgeFactor > 0.08) {
      const h = r * 0.35 * edgeFactor
      const gradSide = ctx.createLinearGradient(0, -h, 0, h)
      gradSide.addColorStop(0, 'rgba(255,215,100,0.85)')
      gradSide.addColorStop(0.5, 'rgba(184,134,11,0.95)')
      gradSide.addColorStop(1, 'rgba(255,215,100,0.75)')
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
    }

    // 外圈 - 增强金色光泽
    const ringGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.15, 0, 0, r)
    ringGrad.addColorStop(0, '#ffd700') // 金色
    ringGrad.addColorStop(0.35, '#ffed4e') // 亮金色
    ringGrad.addColorStop(0.6, '#daa520') // 深金色
    ringGrad.addColorStop(0.85, '#b8860b') // 暗金色
    ringGrad.addColorStop(1, '#8b6914') // 更深的金色
    ctx.fillStyle = ringGrad
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 外圈高光带 - 增强金属感
    const rimGrad = ctx.createRadialGradient(r * 0.1, -r * 0.15, r * 0.1, 0, 0, r * 1.05)
    rimGrad.addColorStop(0, 'rgba(255,255,255,0.45)')
    rimGrad.addColorStop(0.3, 'rgba(255,250,200,0.28)')
    rimGrad.addColorStop(0.7, 'rgba(255,255,255,0.08)')
    rimGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rimGrad
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2)
    ctx.fill()

    // 内圈厚度
    ctx.lineWidth = r * 0.12
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.stroke()

    // 方孔：切除（保持清晰）
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.rect(-hole, -hole, hole * 2, hole * 2)
    ctx.fill()
    ctx.restore()

    // 方孔边缘微光 - 保持线条完整
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 240, 180, 0.85)'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.strokeRect(-hole, -hole, hole * 2, hole * 2)
    ctx.restore()

    // 主高光（强化金属质感）
    const shine = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r * 0.95)
    shine.addColorStop(0, 'rgba(255,255,255,0.48)')
    shine.addColorStop(0.4, 'rgba(255,255,200,0.18)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 暗角 vignetting
    const vignette = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.08)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(0.85, 'rgba(0,0,0,0.12)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.32)')
    ctx.fillStyle = vignette
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

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

    // 金色颗粒噪点增加金属质感
    ctx.save()
    ctx.globalAlpha = 0.26
    for (let i = 0; i < 120; i++) {
      const rr = Math.random() * r
      const theta = Math.random() * Math.PI * 2
      const px = Math.cos(theta) * rr
      const py = Math.sin(theta) * rr
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.42)' : 'rgba(139,69,19,0.35)'
      ctx.fillRect(px, py, 1, 1)
    }
    ctx.restore()

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

    // 初始化三枚金币的初始状态
    const randSpin = () => 10 + Math.random() * 6
    const states: CoinState[] = [
      { x: w * 0.32, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -220 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius },
      { x: w * 0.50, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -230 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius },
      { x: w * 0.68, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -210 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius }
    ]
    coinStates.current = states

    const gravity = 680 // px/s^2，增强重力加快回落
    const floorY = baseY
    const safeNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now()
    const startTime = safeNow()
    const duration = 1200 // 控制在1-2秒范围内的总体动画时长

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
        c.vy += gravity * dt
        c.x += c.vx * dt
        c.y += c.vy * dt
        c.angleZ += c.spinZ * dt
        c.angleX += c.spinX * dt
        c.angleY += c.spinY * dt
        c.spinZ *= 0.985 // 更强阻尼，尽快收敛
        
        // 角度吸附：当旋转速度较慢时，引导角度向最近的π整数倍靠拢
        const PI = Math.PI
        const spinThreshold = 2.5 // 当旋转速度低于此值时开始吸附
        const snapStrength = 0.25 // 更强的吸附强度，加速对齐
        
        // X轴吸附
        if (Math.abs(c.spinX) < spinThreshold) {
          const targetX = Math.round(c.angleX / PI) * PI
          const diffX = targetX - c.angleX
          // 添加一个引导力，让角度向目标靠拢
          c.spinX += diffX * snapStrength
          c.spinX *= 0.88 // 更强的阻尼
        } else {
          c.spinX *= 0.98
        }
        
        // Y轴吸附
        if (Math.abs(c.spinY) < spinThreshold) {
          const targetY = Math.round(c.angleY / PI) * PI
          const diffY = targetY - c.angleY
          c.spinY += diffY * snapStrength
          c.spinY *= 0.88
        } else {
          c.spinY *= 0.98
        }
        
        c.vx *= 0.98

        // 边界水平碰撞
        if (c.x < c.radius) {
          c.x = c.radius
          c.vx = -c.vx * 0.7
        }
        if (c.x > w - c.radius) {
          c.x = w - c.radius
          c.vx = -c.vx * 0.7
        }

        // 地面反弹
        if (c.y > floorY) {
          c.y = floorY
          c.vy = -c.vy * 0.5
          c.spinZ *= 0.85
          c.spinX *= 0.85
          c.spinY *= 0.85
        }
      }

      // 碰撞分离（简化）
      for (let i = 0; i < coinStates.current.length; i++) {
        for (let j = i + 1; j < coinStates.current.length; j++) {
          const a = coinStates.current[i]
          const b = coinStates.current[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const minDist = a.radius + b.radius - 10
          if (dist < minDist) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) * 0.5
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap
            // 简单速度交换
            const tx = a.vx
            const ty = a.vy
            a.vx = b.vx * 0.85
            a.vy = b.vy * 0.85
            b.vx = tx * 0.85
            b.vy = ty * 0.85
          }
        }
      }

      // 绘制
      coinStates.current.forEach((c) => {
        const frontFace = Math.cos(c.angleY) >= 0
        const { px, py } = projectToTable(c.x, c.y)
        drawCoin(ctx, { ...c, x: px, y: py }, frontFace)
        // 投影阴影贴合桌面透视
        ctx.save()
        ctx.globalAlpha = 0.25
        const { px: sx, py: sy } = projectToTable(c.x, floorY + 4)
        const shadowScale = 1 - Math.abs(Math.cos(c.angleX + cameraPitch)) * 0.12
        const shadowWidth = c.radius * 1.25 * shadowScale
        const shadowHeight = c.radius * 0.26 * shadowScale
        const shadowGrad = ctx.createRadialGradient(sx, sy, shadowHeight * 0.2, sx, sy, shadowWidth)
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.38)')
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = shadowGrad
        ctx.beginPath()
        ctx.ellipse(sx + c.vx * 0.008, sy, shadowWidth, shadowHeight, -planeSkew * 0.9, 0, Math.PI * 2)
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
        // 最终精确对齐到π的整数倍
        const PI = Math.PI
        coinStates.current.forEach((c) => {
          c.angleX = Math.round(c.angleX / PI) * PI
          c.angleY = Math.round(c.angleY / PI) * PI
          c.tilt = 0
          c.spinX = 0
          c.spinY = 0
          c.spinZ = 0
        })
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
      <Text style={{ color: '#ddd', fontSize: '14px' }}>摇卦：点击"摇一摇"六次，依次生成自下而上的六爻</Text>
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        style={{ width: '100%', height: '220px', borderRadius: '10px', backgroundColor: '#0b0d10', border: '1px solid rgba(0,240,255,0.2)' }}
      />
      {initError ? (
        <Text style={{ color: '#ff6b6b', fontSize: '12px' }}>{initError}</Text>
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
