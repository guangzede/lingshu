import React from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Canvas } from '@tarojs/components'
import './index.scss'

interface Props {
  metal: { base: number; final: number }
  wood: { base: number; final: number }
  water: { base: number; final: number }
  fire: { base: number; final: number }
  earth: { base: number; final: number }
}

const FiveElementsAnalysis: React.FC<Props> = ({ metal, wood, water, fire, earth }) => {
  const baseItems = React.useMemo(
    () => [
      { key: '金', value: metal.base, color: '#f6c453' },
      { key: '木', value: wood.base, color: '#7aa28c' },
      { key: '水', value: water.base, color: '#5bbcff' },
      { key: '火', value: fire.base, color: '#ff7b7b' },
      { key: '土', value: earth.base, color: '#d8c37a' }
    ],
    [metal, wood, water, fire, earth]
  )

  const finalItems = React.useMemo(
    () => [
      { key: '金', value: metal.final, color: '#f6c453' },
      { key: '木', value: wood.final, color: '#7aa28c' },
      { key: '水', value: water.final, color: '#5bbcff' },
      { key: '火', value: fire.final, color: '#ff7b7b' },
      { key: '土', value: earth.final, color: '#d8c37a' }
    ],
    [metal, wood, water, fire, earth]
  )

  React.useEffect(() => {
    const size = 300
    const padding = 24
    const radius = size / 2 - padding
    const center = size / 2

    const drawRadar = (ctx: CanvasRenderingContext2D, items: typeof baseItems) => {
      ctx.clearRect(0, 0, size, size)

      const maxValue = Math.max(1, ...items.map((i) => i.value || 0))

      ctx.strokeStyle = 'rgba(201, 178, 106, 0.25)'
      ctx.lineWidth = 1
      for (let level = 1; level <= 4; level++) {
        const r = (radius * level) / 4
        ctx.beginPath()
        items.forEach((_, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          const x = center + r * Math.cos(angle)
          const y = center + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(201, 178, 106, 0.35)'
      items.forEach((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
        ctx.stroke()
      })

      ctx.fillStyle = '#d8c37a'
      ctx.font = '12px sans-serif'
      items.forEach((item, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        const x = center + (radius + 12) * Math.cos(angle)
        const y = center + (radius + 12) * Math.sin(angle)
        ctx.fillText(item.key, x - 6, y + 4)
      })

      ctx.fillStyle = 'rgba(21, 224, 255, 0.18)'
      ctx.strokeStyle = 'rgba(21, 224, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      items.forEach((item, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        const r = (radius * (item.value || 0)) / maxValue
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      items.forEach((item, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        const r = (radius * (item.value || 0)) / maxValue
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        ctx.beginPath()
        ctx.fillStyle = item.color
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
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
    query.select('#five-elements-final').node().exec((res) => {
      const canvas = res?.[0]?.node as HTMLCanvasElement | undefined
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)
      drawRadar(ctx, finalItems)
    })
  }, [baseItems, finalItems])

  return (
    <View className="five-elements-card glass-card">
      <View className="card-header">
        <Text className="card-section-title">五行能量分析</Text>
        <Text className="card-section-guide">初始分与最终分对比</Text>
      </View>
      <View className="card-body">
        <View className="radar-container">
          <View className="radar-col">
            <Text className="radar-title">初始分（Base Score）</Text>
            <View className="radar-wrap">
              <Canvas className="radar-canvas" id="five-elements-base" canvasId="five-elements-base" type="2d" />
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
          <View className="radar-col">
            <Text className="radar-title">最终分（Final Score）</Text>
            <View className="radar-wrap">
              <Canvas className="radar-canvas" id="five-elements-final" canvasId="five-elements-final" type="2d" />
              <View className="radar-legend">
                {finalItems.map((item) => (
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
