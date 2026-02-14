import type { Branch, Stem } from '@/types/liuyao'

export type ElementCN = '木' | '火' | '土' | '金' | '水'

export const STEM_ELEMENT: Record<Stem, ElementCN> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

export const BRANCH_ELEMENT: Record<Branch, ElementCN> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

export const STEM_YINYANG: Record<Stem, 'yang' | 'yin'> = {
  '甲': 'yang', '乙': 'yin',
  '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin',
  '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin'
}

const GENERATES: Record<ElementCN, ElementCN> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
}

const OVERCOMES: Record<ElementCN, ElementCN> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
}

const CHANGSHENG_SEQ = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']

const CHANGSHENG_TABLE: Record<ElementCN, Branch[]> = {
  '木': ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'],
  '火': ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
  '土': ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'],
  '金': ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'],
  '水': ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未']
}

export const HIDDEN_STEMS: Record<Branch, Stem[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
}

const STEMS: Stem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES: Branch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const JIA_ZI: string[] = Array.from({ length: 60 }, (_, i) => {
  const stem = STEMS[i % 10]
  const branch = BRANCHES[i % 12]
  return `${stem}${branch}`
})

const NAYIN_VALUES = [
  '海中金','炉中火','大林木','路旁土','剑锋金','山头火','涧下水','城头土','白蜡金','杨柳木',
  '泉中水','屋上土','霹雳火','松柏木','长流水','沙中金','山下火','平地木','壁上土','金箔金',
  '佛灯火','天河水','大驿土','钗钏金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'
]

const NAYIN_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (let i = 0; i < 60; i++) {
    const pairIndex = Math.floor(i / 2)
    map[JIA_ZI[i]] = NAYIN_VALUES[pairIndex]
  }
  return map
})()

export const TEN_GOD_SHORT: Record<string, string> = {
  '比肩': '比',
  '劫财': '劫',
  '食神': '食',
  '伤官': '伤',
  '偏财': '偏',
  '正财': '财',
  '七杀': '杀',
  '正官': '官',
  '偏印': '枭',
  '正印': '印',
  '日主': '日'
}

export function getTenGod(dayStem: Stem, otherStem: Stem): string {
  if (dayStem === otherStem) return '比肩'
  const dayElement = STEM_ELEMENT[dayStem]
  const otherElement = STEM_ELEMENT[otherStem]
  const dayYinYang = STEM_YINYANG[dayStem]
  const otherYinYang = STEM_YINYANG[otherStem]

  if (dayElement === otherElement) return dayYinYang === otherYinYang ? '比肩' : '劫财'
  if (GENERATES[otherElement] === dayElement) return dayYinYang === otherYinYang ? '偏印' : '正印'
  if (GENERATES[dayElement] === otherElement) return dayYinYang === otherYinYang ? '食神' : '伤官'
  if (OVERCOMES[otherElement] === dayElement) return dayYinYang === otherYinYang ? '七杀' : '正官'
  if (OVERCOMES[dayElement] === otherElement) return dayYinYang === otherYinYang ? '偏财' : '正财'
  return '比肩'
}

export function getChangSheng(stem: Stem, branch: Branch): string {
  const baseElement = STEM_ELEMENT[stem]
  const seq = CHANGSHENG_TABLE[baseElement] || []
  const isYang = STEM_YINYANG[stem] === 'yang'
  const adjusted = isYang ? seq : [...seq].reverse()
  const idx = adjusted.indexOf(branch)
  return idx >= 0 ? CHANGSHENG_SEQ[idx] : ''
}

export function getNaYin(stem: Stem, branch: Branch): string {
  return NAYIN_MAP[`${stem}${branch}`] || ''
}

export function getHiddenStems(branch: Branch, dayStem: Stem) {
  const stems = HIDDEN_STEMS[branch] || []
  return stems.map((stem) => ({
    stem,
    element: STEM_ELEMENT[stem],
    tenGod: getTenGod(dayStem, stem)
  }))
}

export function getXunKong(stem: Stem, branch: Branch): Branch[] {
  const stemIndex = STEMS.indexOf(stem)
  const branchIndex = BRANCHES.indexOf(branch)
  const xunStartBranchIndex = (branchIndex - stemIndex + 12) % 12
  const kong1Index = (xunStartBranchIndex - 2 + 12) % 12
  const kong2Index = (xunStartBranchIndex - 1 + 12) % 12
  return [BRANCHES[kong1Index], BRANCHES[kong2Index]]
}
