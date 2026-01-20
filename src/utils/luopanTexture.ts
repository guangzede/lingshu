/**
 * 罗盘纹理生成工厂
 * 在内存中动态绘制高清透明纹理，避免加载大图片
 */

/** 罗盘层级定义 */
export interface LuopanLayer {
  id: number
  name: string
  symbols: string[]
  radius: number
}

/** 罗盘层级配置 */
export const LUOPAN_LAYERS: LuopanLayer[] = [
  {
    id: 0,
    name: '天干',
    symbols: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    radius: 1.5
  },
  {
    id: 1,
    name: '地支',
    symbols: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    radius: 2.0
  },
  {
    id: 2,
    name: '八卦',
    symbols: ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'],
    radius: 2.5
  },
  {
    id: 3,
    name: '二十四山',
    symbols: [
      '壬', '子', '癸',
      '丑', '艮', '寅',
      '甲', '卯', '乙',
      '辰', '巽', '巳',
      '丙', '午', '丁',
      '未', '坤', '申',
      '庚', '酉', '辛',
      '戌', '乾', '亥'
    ],
    radius: 3.0
  },
  {
    id: 4,
    name: '六十四卦',
    symbols: [
      '䷀', '䷁', '䷂', '䷃', '䷄', '䷅', '䷆', '䷇',
      '䷈', '䷉', '䷊', '䷋', '䷌', '䷍', '䷎', '䷏',
      '䷐', '䷑', '䷒', '䷓', '䷔', '䷕', '䷖', '䷗',
      '䷘', '䷙', '䷚', '䷛', '䷜', '䷝', '䷞', '䷟',
      '䷠', '䷡', '䷢', '䷣', '䷤', '䷥', '䷦', '䷧',
      '䷨', '䷩', '䷪', '䷫', '䷬', '䷭', '䷮', '䷯',
      '䷰', '䷱', '䷲', '䷳', '䷴', '䷵', '䷶', '䷷',
      '䷸', '䷹', '䷺', '䷻', '䷼', '䷽', '䷾', '䷿'
    ],
    radius: 3.5
  }
]

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
function layoutSymbols(
  ctx: CanvasRenderingContext2D,
  symbols: string[],
  width: number,
  height: number
) {
  const step = width / symbols.length
  // 在文字可用区域内（40% 到 60%）居中绘制，避免贴着管道边缘
  const centerY = height * 0.5
  const verticalPadding = height * 0.2 // 上下 20% 的内边距，文字占 60% 高度

  symbols.forEach((symbol, index) => {
    const x = index * step + step / 2

    // 先绘制清晰的主体文字（无阴影）
    ctx.shadowBlur = 0
    ctx.fillText(symbol, x, centerY)

    // 再绘制发光层（轻微阴影）
    ctx.shadowBlur = 2
    ctx.shadowColor = '#FFD700'
    ctx.fillText(symbol, x, centerY)
  })
}

/**
 * F1.1.3 样式渲染细节
 * 设置金色霓虹发光样式
 */
function applyGoldenGlowStyle(ctx: CanvasRenderingContext2D, fontSize: number = 60) {
  // 字体：宋体增强仪式感，加大粗细
  ctx.font = `900 ${fontSize}px 'Songti SC', 'SimSun', serif`

  // 金色填充
  ctx.fillStyle = '#FFD700'

  // 明确禁用描边
  ctx.lineWidth = 0
  ctx.strokeStyle = 'transparent'

  // 初始不设置阴影（在 layoutSymbols 中双重绘制）
  ctx.shadowBlur = 0

  // 文本对齐
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
}

/**
 * F1.1.4 特殊图层处理
 * 根据层级 ID 调整字体大小和样式
 */
function getLayerFontSize(layerId: number): number {
  const fontSizes = [60, 55, 50, 45, 40]
  return fontSizes[layerId] || 50
}

/**
 * 主函数：生成指定层级的纹理画布
 * @param layerId 层级 ID (0-4)
 * @returns Canvas 元素，可转为 CanvasTexture
 */
export function generateLuopanTexture(layerId: number): HTMLCanvasElement {
  const layer = LUOPAN_LAYERS.find(l => l.id === layerId)
  if (!layer) {
    throw new Error(`无效的层级 ID: ${layerId}`)
  }

  // 画布尺寸：长条形 2048x128
  const width = 2048
  const height = 128

  // F1.1.1: 初始化透明画布
  const canvas = createTransparentCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  // F1.1.3: 应用金色发光样式
  const fontSize = getLayerFontSize(layerId)
  applyGoldenGlowStyle(ctx, fontSize)

  // F1.1.2: 排版符号
  layoutSymbols(ctx, layer.symbols, width, height)

  return canvas
}

/**
 * 批量生成所有层级的纹理
 * @returns 5 个 Canvas 元素数组
 */
export function generateAllTextures(): HTMLCanvasElement[] {
  return LUOPAN_LAYERS.map(layer => generateLuopanTexture(layer.id))
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
  // 注意：在小程序环境中，需要适配 Canvas API
  if (typeof document === 'undefined') {
    // 小程序环境处理（返回 mock 或使用 Taro Canvas）
    console.warn('小程序环境暂不支持 Canvas 纹理生成')
    return null
  }

  const canvas = generateLuopanTexture(layerId)

  // 动态导入 Three.js CanvasTexture（避免在小程序环境出错）
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
