import React from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Canvas } from '@tarojs/components'
import './index.scss'

interface Props {
  metal: { base: number }
  wood: { base: number }
  water: { base: number }
  fire: { base: number }
  earth: { base: number }
}
 
import { WUXING_COLORS } from '@/constants/luopanData'

const FiveElementsAnalysis: React.FC<Props> = ({ metal, wood, water, fire, earth }) => {
  const baseItems = React.useMemo(
    () => [
      { key: '金', value: metal.base, color: WUXING_COLORS.metal },
      { key: '木', value: wood.base, color: WUXING_COLORS.wood },
      { key: '水', value: water.base, color: WUXING_COLORS.water },
      { key: '火', value: fire.base, color: WUXING_COLORS.fire },
      { key: '土', value: earth.base, color: WUXING_COLORS.earth }
    ],
    [metal, wood, water, fire, earth]
  )

  React.useEffect(() => {
    const size = 300
    const padding = 24
    const center = size / 2 + 0.5 // 保证像素对齐，防止模糊
    const radius = size / 2 - padding

    const drawRadar = (ctx: CanvasRenderingContext2D, items: typeof baseItems) => {
      ctx.clearRect(0, 0, size, size)
      const maxValue = Math.max(1, ...items.map((i) => i.value || 0))

      // 1. 画雷达背景网格和径向线
      ctx.save()
      ctx.strokeStyle = 'rgba(201, 178, 106, 0.25)'
      ctx.lineWidth = 1
      for (let level = 1; level <= 4; level++) {
        const r = (radius * level) / 4
        ctx.beginPath()
        for (let i = 0; i < items.length; i++) {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          const x = center + r * Math.cos(angle)
          const y = center + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(201, 178, 106, 0.35)'
      for (let i = 0; i < items.length; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
        ctx.stroke()
      }
      ctx.restore()

      // （已移除中心到顶点的实心渐变色带）

      // 3. 画五行多边形区域的五行色环绕渐变
      // 先构造多边形路径
      const polyPoints = []
      for (let i = 0; i < items.length; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        const r = (radius * (items[i].value || 0)) / maxValue
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        polyPoints.push({ x, y, color: items[i].color })
      }
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < polyPoints.length; i++) {
        const { x, y } = polyPoints[i]
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.clip()
      // 每条边做线性渐变填充
      for (let i = 0; i < polyPoints.length; i++) {
        const p1 = polyPoints[i]
        const p2 = polyPoints[(i + 1) % polyPoints.length]
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
        grad.addColorStop(0, p1.color)
        grad.addColorStop(1, p2.color)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.lineTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.closePath()
        ctx.globalAlpha = 0.45
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }
      ctx.restore()

      // 4. 画五行文字（五行色）
      ctx.save()
      ctx.font = 'bold 20px sans-serif'
      // 适当缩小半径并微调偏移，避免文字超出画布
      const textRadius = radius + 8;
      for (let i = 0; i < items.length; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const x = center + textRadius * Math.cos(angle);
        const y = center + textRadius * Math.sin(angle);
        ctx.fillStyle = items[i].color;
        // 针对每个字微调偏移
        let offsetX = -10, offsetY = 8;
        if (i === 0) { offsetX = -8; offsetY = 10; } // 金
        if (i === 2) { offsetX = -8; offsetY = 6; }  // 水
        if (i === 4) { offsetX = -10; offsetY = 6; } // 土
        ctx.fillText(items[i].key, x + offsetX, y + offsetY);
      }
      ctx.restore()

      // 5. 画雷达多边形边框
      ctx.save()
      ctx.strokeStyle = 'rgba(21, 224, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < polyPoints.length; i++) {
        const { x, y } = polyPoints[i]
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // 6. 画顶点圆点
      ctx.save()
      for (let i = 0; i < polyPoints.length; i++) {
        const { x, y, color } = polyPoints[i]
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    const dpr = Taro.getSystemInfoSync().pixelRatio || 1
    const query = Taro.createSelectorQuery()
    query.select('#five-elements-base').node().exec((res) => {
      const canvas = res?.[0]?.node as HTMLCanvasElement | undefined
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)
      drawRadar(ctx, baseItems)
    })
  }, [baseItems])

  return (
    <View className="five-elements-card glass-card">
      <View className="card-header">
        <Text className="card-section-title">五行能量分析</Text>
        <Text className="card-section-guide">直观感受能量强弱</Text>
      </View>
      <View className="card-body">
        <View className="radar-container">
          <View className="radar-col" style={{ width: '70%', maxWidth: '70%', margin: '0 auto' }}>
            <Text className="radar-title">五行分布</Text>
            <View className="radar-wrap">
              <Canvas
                className="radar-canvas"
                id="five-elements-base"
                canvasId="five-elements-base"
                type="2d"
                style={{ width: '70vw', height: '70vw', maxWidth: 500, maxHeight: 500, display: 'block' }}
              />
              <View className="radar-legend">
                {baseItems.map((item) => (
                  <View key={item.key} className="legend-item">
                    <View className="legend-dot" style={{ backgroundColor: item.color }} />
                    <Text className="legend-label">{item.key}</Text>
                    <Text className="legend-value">{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default FiveElementsAnalysis
