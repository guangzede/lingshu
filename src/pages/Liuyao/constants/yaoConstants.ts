// 地支五行映射
export const BRANCH_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

// 地支六合关系
export const BRANCH_HARMONY: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
}

// 地支六冲关系
export const BRANCH_CLASH: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
}

// 五行相生关系
export const GENERATES: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
}

// 五行相克关系
export const OVERCOMES: Record<string, string> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
}

// 爻位标签映射
export const YAO_LABELS: Record<number, string> = {
  0: '初爻',
  1: '二爻',
  2: '三爻',
  3: '四爻',
  4: '五爻',
  5: '上爻'
}

// 爻位顺序（用于显示）
export const YAO_LABEL_ORDER = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻']

// 八卦数字映射
export const TRIGRAM_MAP: Record<number, [boolean, boolean, boolean]> = {
  1: [true, true, true],    // 乾 111
  2: [true, true, false],   // 兑 110
  3: [true, false, true],   // 离 101
  4: [true, false, false],  // 震 100
  5: [false, true, true],   // 巽 011
  6: [false, true, false],  // 坎 010
  7: [false, false, true],  // 艮 001
  8: [false, false, false]  // 坤 000
}
