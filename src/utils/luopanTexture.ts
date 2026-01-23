/**
 * 罗盘纹理生成工厂
 * 在内存中动态绘制高清透明纹理，避免加载大图片
 */
import { LUOPAN_LAYERS as STRUCTURED_LAYERS, LuopanSegment } from '@/constants/luopanData'

// 将结构化数据导出给兼容调用方
export const LUOPAN_LAYERS = STRUCTURED_LAYERS

/**
 * F1.1.1 画布初始化
 * 创建长条形透明画布
 */
function createTransparentCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 2D 上下文')

  // 确保背景完全透明
  ctx.clearRect(0, 0, width, height)

  return canvas
}

/**
 * F1.1.2 符箓排版算法
 * 均匀分布字符在画布上
 */
function layoutSegmentsByDegree(
  ctx: CanvasRenderingContext2D,
  segments: LuopanSegment[],
  width: number,
  height: number
) {
  if (segments.length === 0) return

  // 按角度排序，并计算每段的弧长占比
  const sorted = [...segments].sort((a, b) => a.degree - b.degree)
  const spans = sorted.map((seg, idx) => {
    const next = sorted[(idx + 1) % sorted.length]
    const span = ((next.degree - seg.degree + 360) % 360) || (360 / sorted.length)
    return span
  })

  const centerY = height * 0.5
  let cursor = 0

  sorted.forEach((seg, idx) => {
    const spanDeg = spans[idx]
    const blockWidth = (spanDeg / 360) * width
    const xCenter = cursor + blockWidth / 2

    // 使用分段颜色（空亡置灰）
    const baseColor = seg.isVoid ? '#666666' : (seg.color || '#FFD700')
    ctx.fillStyle = baseColor

    // 主体文字
    ctx.shadowBlur = 0
    ctx.fillText(seg.label, xCenter, centerY)

    // 轻微发光层
    ctx.shadowBlur = 2
    ctx.shadowColor = '#FFD700'
    ctx.fillText(seg.label, xCenter, centerY)

    cursor += blockWidth
  })
}

/**
 * F1.1.3 样式渲染细节
 * 设置金色霓虹发光样式
 */
function applyGoldenGlowStyle(ctx: CanvasRenderingContext2D, fontSize: number = 60) {
  ctx.font = `900 ${fontSize}px 'Songti SC', 'SimSun', serif`
  ctx.fillStyle = '#FFD700'
  ctx.lineWidth = 0
  ctx.strokeStyle = 'transparent'
  ctx.shadowBlur = 0
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
}

function pickFontSize(count: number): number {
  if (count <= 10) return 60
  if (count <= 24) return 50
  if (count <= 64) return 38
  return 32
}

/**
 * 主函数：生成指定层级的纹理画布
 * @param layerId 层级 ID (0-4)
 * @returns Canvas 元素，可转为 CanvasTexture
 */
export function generateLuopanTexture(layerId: number): HTMLCanvasElement {
  const layer = LUOPAN_LAYERS[layerId]
  if (!layer) {
    throw new Error(`无效的层级索引: ${layerId}`)
  }

  const width = 2048
  const height = 140

  const canvas = createTransparentCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  const fontSize = pickFontSize(layer.segments.length)
  applyGoldenGlowStyle(ctx, fontSize)

  layoutSegmentsByDegree(ctx, layer.segments, width, height)

  return canvas
}

/**
 * 批量生成所有层级的纹理
 * @returns 5 个 Canvas 元素数组
 */
export function generateAllTextures(): HTMLCanvasElement[] {
  return LUOPAN_LAYERS.map((_, idx) => generateLuopanTexture(idx))
}

/**
 * 工具函数：将 Canvas 转为 DataURL (可选，用于调试)
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

/**
 * 兼容旧 API：generateRingTexture
 * 生成 Three.js CanvasTexture
 */
export function generateRingTexture(layerId: number): any {
  if (typeof document === 'undefined') {
    console.warn('小程序环境暂不支持 Canvas 纹理生成')
    return null
  }

  const canvas = generateLuopanTexture(layerId)

  try {
    const THREE = require('three')
    return new THREE.CanvasTexture(canvas)
  } catch (e) {
    console.error('无法加载 Three.js:', e)
    return null
  }
}

/**
 * 生成太极图纹理
 * @param size 画布尺寸（正方形）
 * @returns Canvas 元素
 */
export function generateTaijiTexture(size: number = 512): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    console.warn('小程序环境暂不支持 Canvas 纹理生成')
    return null as any
  }

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 5

  // 清除背景为白色（重要！这样黑色才能显示）
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)

  // 关闭阴影，确保清晰显示
  ctx.shadowBlur = 0

  // === 绘制主圆形 ===
  // 先绘制完整的黑色圆作为底层
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  // 绘制右半边白色半圆（覆盖黑色的右半部分）
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2)
  ctx.fill()

  // === 绘制上方小白圆 ===
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(centerX, centerY - radius / 2, radius / 2, 0, Math.PI * 2)
  ctx.fill()

  // === 绘制下方小黑圆 ===
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(centerX, centerY + radius / 2, radius / 2, 0, Math.PI * 2)
  ctx.fill()

  // === 绘制鱼眼 ===
  // 上方黑点
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(centerX, centerY - radius / 2, radius / 10, 0, Math.PI * 2)
  ctx.fill()

  // 下方白点
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(centerX, centerY + radius / 2, radius / 10, 0, Math.PI * 2)
  ctx.fill()

  // === 绘制外圆金色边框（最后叠加） ===
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 8
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()

  return canvas
}

/**
 * 生成 Three.js 太极图纹理
 */
export function generateTaijiThreeTexture(): any {
  if (typeof document === 'undefined') {
    return null
  }

  const canvas = generateTaijiTexture(512)

  try {
    const THREE = require('three')
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    texture.anisotropy = 16
    return texture
  } catch (e) {
    console.error('无法加载 Three.js:', e)
    return null
  }
}

export default {
  generateLuopanTexture,
  generateAllTextures,
  generateRingTexture,
  generateTaijiTexture,
  generateTaijiThreeTexture,
  LUOPAN_LAYERS
}
