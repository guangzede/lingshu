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
    const grad = ctx.createLinearGradient(-10, -10, 12, 14)
    grad.addColorStop(0, '#fdf4c2')
    grad.addColorStop(0.4, '#d1a13c')
    grad.addColorStop(1, '#fef8d8')
    ctx.fillStyle = grad
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    ctx.lineWidth = 1.3
    ctx.font = '900 16px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillText(text, 0, 0)
    ctx.strokeText(text, 0, 0)
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

    // 厚度（侧边）
    if (edgeFactor > 0.08) {
      const h = r * 0.35 * edgeFactor
      const gradSide = ctx.createLinearGradient(0, -h, 0, h)
      gradSide.addColorStop(0, 'rgba(255,232,180,0.75)')
      gradSide.addColorStop(0.5, 'rgba(156,103,24,0.9)')
      gradSide.addColorStop(1, 'rgba(255,232,180,0.6)')
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

    // 外圈
    const ringGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.2, 0, 0, r)
    ringGrad.addColorStop(0, '#f7dc92')
    ringGrad.addColorStop(0.45, '#c2922e')
    ringGrad.addColorStop(0.9, '#8a5b16')
    ctx.fillStyle = ringGrad
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 外圈高光带
    const rimGrad = ctx.createRadialGradient(r * 0.1, -r * 0.1, r * 0.2, 0, 0, r)
    rimGrad.addColorStop(0, 'rgba(255,255,255,0.35)')
    rimGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rimGrad
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2)
    ctx.fill()

    // 内圈厚度
    ctx.lineWidth = r * 0.12
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.stroke()

    // 方孔：切除
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.rect(-hole, -hole, hole * 2, hole * 2)
    ctx.fill()
    ctx.restore()

    // 方孔边缘微光
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 220, 150, 0.7)'
    ctx.lineWidth = 2
    ctx.strokeRect(-hole, -hole, hole * 2, hole * 2)
    ctx.restore()

    // 金属高光与暗角
    const shine = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r)
    shine.addColorStop(0, 'rgba(255,255,255,0.32)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 暗角 vignetting
    const vignette = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.05)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.25)')
    ctx.fillStyle = vignette
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 文字：正面四方"大吉大利"，反面左右"吉祥"
    if (frontFace) {
      drawMetalText(ctx, '大', 0, -r * 0.62, 0)
      drawMetalText(ctx, '利', 0, r * 0.62, 0)
      drawMetalText(ctx, '吉', -r * 0.62, 0, -Math.PI / 2)
      drawMetalText(ctx, '大', r * 0.62, 0, Math.PI / 2)
    } else {
      drawMetalText(ctx, '吉', -r * 0.55, 0, -Math.PI / 2)
      drawMetalText(ctx, '祥', r * 0.55, 0, Math.PI / 2)
    }

    // 细小颗粒噪点增加金属质感
    ctx.save()
    ctx.globalAlpha = 0.22
    for (let i = 0; i < 80; i++) {
      const rr = Math.random() * r
      const theta = Math.random() * Math.PI * 2
      const px = Math.cos(theta) * rr
      const py = Math.sin(theta) * rr
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'
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

    // 初始化三枚铜钱的初始状态
    const randSpin = () => 12 + Math.random() * 10
    const states: CoinState[] = [
      { x: w * 0.32, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -220 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius },
      { x: w * 0.50, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -230 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius },
      { x: w * 0.68, y: baseY, vx: (Math.random() - 0.5) * 140, vy: -210 - Math.random() * 80, angleZ: Math.random() * Math.PI * 2, angleX: Math.random() * Math.PI * 2, angleY: Math.random() * Math.PI * 2, spinZ: randSpin(), spinX: randSpin(), spinY: randSpin(), tilt: (Math.random() - 0.5) * 0.5, radius }
    ]
    coinStates.current = states

    const gravity = 520 // px/s^2
    const floorY = baseY
    const startTime = performance.now()
    const duration = 1400

    const render = () => {
      const now = performance.now()
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
        c.spinZ *= 0.995
        
        // 角度吸附：当旋转速度较慢时，引导角度向最近的π整数倍靠拢
        const PI = Math.PI
        const spinThreshold = 2.5 // 当旋转速度低于此值时开始吸附
        const snapStrength = 0.15 // 吸附强度
        
        // X轴吸附
        if (Math.abs(c.spinX) < spinThreshold) {
          const targetX = Math.round(c.angleX / PI) * PI
          const diffX = targetX - c.angleX
          // 添加一个引导力，让角度向目标靠拢
          c.spinX += diffX * snapStrength
          c.spinX *= 0.92 // 更强的阻尼
        } else {
          c.spinX *= 0.995
        }
        
        // Y轴吸附
        if (Math.abs(c.spinY) < spinThreshold) {
          const targetY = Math.round(c.angleY / PI) * PI
          const diffY = targetY - c.angleY
          c.spinY += diffY * snapStrength
          c.spinY *= 0.92
        } else {
          c.spinY *= 0.995
        }
        
        c.vx *= 0.995

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
          c.vy = -c.vy * 0.55
          c.spinZ *= 0.9
          c.spinX *= 0.9
          c.spinY *= 0.9
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
        Math.abs(c.vy) < 15 && 
        Math.abs(c.vx) < 8 && 
        Math.abs(c.spinX) < 0.1 && 
        Math.abs(c.spinY) < 0.1 && 
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
      <View className="shake-actions">
        {step < 6 && (
          <Button
            size="default"
            className={`btn-shake ${isShaking ? 'disabled' : ''}`}
            disabled={isShaking || disabled}
            onClick={startShake}
          >
            {`摇一摇（${step}/6）`}
          </Button>
        )}
      </View>
    </View>
  )
}

export default ShakeCoins
