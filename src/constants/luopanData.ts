// Luopan structured data for Three Plates, 72 Dragons, and 64 Hexagrams (Fuxi circle)
// All angles in degrees. Earth plate baseline is 0°. Man plate offset -7.5°, Heaven plate offset +7.5°.

export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export interface LuopanSegment {
  label: string // 山向或卦名
  degree: number // 中心角度（相对于地盘0°基准，已含各盘偏移）
  color: string // 五行颜色，用于前端着色
  isVoid?: boolean // 穿山七十二龙的空亡标记
  dragons?: string[] // 72龙：每个地支下的5个甲子龙
  glyph?: string // 六十四卦符号
}

export interface LuopanLayer {
  id: string
  name: string
  radius: number
  offset?: number // 度数偏移（人盘/天盘）
  segments: LuopanSegment[]
}

// 五行配色
export const WUXING_COLORS: Record<WuXing, string> = {
  wood: '#2ecc71', // 绿
  fire: '#e74c3c', // 红
  earth: '#c2a661', // 土黄/褐
  metal: '#ffd700', // 金/白
  water: '#3498db' // 蓝
}

// 24山基序（地盘正针，0°起点）
const EARTH_MOUNTAINS = [
  '壬', '子', '癸',
  '丑', '艮', '寅',
  '甲', '卯', '乙',
  '辰', '巽', '巳',
  '丙', '午', '丁',
  '未', '坤', '申',
  '庚', '酉', '辛',
  '戌', '乾', '亥'
]

// 地支对应五行
const BRANCH_WUXING: Record<string, WuXing> = {
  子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood', 辰: 'earth',
  巳: 'fire', 午: 'fire', 未: 'earth', 申: 'metal', 酉: 'metal',
  戌: 'earth', 亥: 'water'
}

// 天干对应五行
const STEM_WUXING: Record<string, WuXing> = {
  甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth',
  己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water'
}

// 四维（乾坤艮巽）对应五行
const TRIGRAM_WUXING: Record<string, WuXing> = {
  乾: 'metal', 坤: 'earth', 艮: 'earth', 巽: 'wood'
}

// 穿山七十二龙：12地支各5个甲子龙
const BRANCH_DRAGONS: Record<string, string[]> = {
  子: ['甲子', '丙子', '戊子', '庚子', '壬子'],
  丑: ['乙丑', '丁丑', '己丑', '辛丑', '癸丑'],
  寅: ['甲寅', '丙寅', '戊寅', '庚寅', '壬寅'],
  卯: ['乙卯', '丁卯', '己卯', '辛卯', '癸卯'],
  辰: ['甲辰', '丙辰', '戊辰', '庚辰', '壬辰'],
  巳: ['乙巳', '丁巳', '己巳', '辛巳', '癸巳'],
  午: ['甲午', '丙午', '戊午', '庚午', '壬午'],
  未: ['乙未', '丁未', '己未', '辛未', '癸未'],
  申: ['甲申', '丙申', '戊申', '庚申', '壬申'],
  酉: ['乙酉', '丁酉', '己酉', '辛酉', '癸酉'],
  戌: ['甲戌', '丙戌', '戊戌', '庚戌', '壬戌'],
  亥: ['乙亥', '丁亥', '己亥', '辛亥', '癸亥']
}

// 获取五行颜色
function getColor(label: string): string {
  if (BRANCH_WUXING[label]) return WUXING_COLORS[BRANCH_WUXING[label]]
  if (STEM_WUXING[label]) return WUXING_COLORS[STEM_WUXING[label]]
  if (TRIGRAM_WUXING[label]) return WUXING_COLORS[TRIGRAM_WUXING[label]]
  return '#ffffff'
}

// 生成 24山 单盘数据（带 offset）
function buildPlate(offset: number, name: string, id: string, radius: number): LuopanLayer {
  const step = 15 // 每山15度
  const segments: LuopanSegment[] = EARTH_MOUNTAINS.map((label, idx) => {
    const baseDeg = idx * step + offset
    const isBranch = !!BRANCH_WUXING[label]
    const dragons = isBranch ? BRANCH_DRAGONS[label] : []
    const isVoid = !isBranch // 干与四维标记空亡
    return {
      label,
      degree: baseDeg,
      color: getColor(label),
      isVoid,
      dragons
    }
  })

  return { id, name, radius, offset, segments }
}

// 六十四卦（使用用户提供的顺序：Unicode ䷀-䷿，也即通行序）
const HEXAGRAMS = [
  '䷀', '䷁', '䷂', '䷃', '䷄', '䷅', '䷆', '䷇',
  '䷈', '䷉', '䷊', '䷋', '䷌', '䷍', '䷎', '䷏',
  '䷐', '䷑', '䷒', '䷓', '䷔', '䷕', '䷖', '䷗',
  '䷘', '䷙', '䷚', '䷛', '䷜', '䷝', '䷞', '䷟',
  '䷠', '䷡', '䷢', '䷣', '䷤', '䷥', '䷦', '䷧',
  '䷨', '䷩', '䷪', '䷫', '䷬', '䷭', '䷮', '䷯',
  '䷰', '䷱', '䷲', '䷳', '䷴', '䷵', '䷶', '䷷',
  '䷸', '䷹', '䷺', '䷻', '䷼', '䷽', '䷾', '䷿'
]

const HEXAGRAM_STEP = 360 / 64
const HEXAGRAM_LAYER: LuopanLayer = {
  id: 'fuxi-64',
  name: '先天六十四卦（圆图序）',
  radius: 3.8,
  segments: HEXAGRAMS.map((glyph, idx) => ({
    label: glyph,
    glyph,
    degree: idx * HEXAGRAM_STEP,
    color: '#ffd700'
  }))
}

// 三盘：地盘、人盘、天盘
export const EARTH_PLATE = buildPlate(0, '地盘正针', 'earth-plate', 3.0)
export const MAN_PLATE = buildPlate(-7.5, '人盘中针', 'man-plate', 3.1)
export const HEAVEN_PLATE = buildPlate(7.5, '天盘缝针', 'heaven-plate', 3.2)

// 汇总导出
export const LUOPAN_LAYERS: LuopanLayer[] = [
  EARTH_PLATE,
  MAN_PLATE,
  HEAVEN_PLATE,
  HEXAGRAM_LAYER
]
