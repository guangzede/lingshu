import { Lunar } from 'lunar-javascript'
import type { Branch, Hexagram, SixGod, Stem, Trigram, TrigramName, Yao, ComputeOptions, SchoolRuleSet, Relation } from '@/types/liuyao'
import { RULE_SETS, SIX_GODS, TRIGRAM_BRANCH_SEQUENCE, DEFAULT_BRANCH_SEQUENCE } from '@/constants/liuyaoRules'
import { resolveHexagramName } from '@/constants/hexagramNames'
import { findPalaceByCode, PALACE_HEXAGRAMS } from '@/constants/hexagramPalace'

// 将三爻映射为八卦名（自下而上的三位：阳=1，阴=0）
function getTrigramName(yaos: [Yao, Yao, Yao]): TrigramName {
  const bits = yaos.map(y => (y.isYang ? 1 : 0)) // bottom->top
  const code = bits[0] * 4 + bits[1] * 2 + bits[2]
  const map: Record<number, TrigramName> = {
    7: '乾', // 111
    6: '兑', // 110
    5: '离', // 101
    4: '震', // 100
    3: '巽', // 011
    2: '坎', // 010
    1: '艮', // 001
    0: '坤'  // 000
  }
  return map[code]
}

function cloneYao(y: Yao): Yao {
  return { ...y }
}

function codeFromYaos(yaos: [Yao, Yao, Yao, Yao, Yao, Yao]) {
  return yaos.map(y => (y.isYang ? '1' : '0')).join('')
}

function applyPalace(hex: Hexagram) {
  const code = codeFromYaos(hex.yaos)
  const meta = findPalaceByCode(code)
  if (meta) {
    hex.palace = meta.palace
    hex.palaceCategory = meta.category
    hex.element = meta.element
    hex.shiIndex = meta.shiIndex
    hex.yingIndex = meta.yingIndex
    if (!hex.name) hex.name = meta.name
  }
}

function buildHexagramFromCode(code: string): Hexagram {
  const bits = code.split('').map(c => c === '1')
  const lines = bits.map((b) => ({ isYang: b, isMoving: false }))
  return buildHexagram(lines as any)
}

export function buildHexagram(lines: Array<{ isYang: boolean; isMoving: boolean }>): Hexagram {
  if (lines.length !== 6) throw new Error('需要6爻输入')
  const yaos: [Yao, Yao, Yao, Yao, Yao, Yao] = [
    { index: 1, isYang: lines[0].isYang, isMoving: lines[0].isMoving },
    { index: 2, isYang: lines[1].isYang, isMoving: lines[1].isMoving },
    { index: 3, isYang: lines[2].isYang, isMoving: lines[2].isMoving },
    { index: 4, isYang: lines[3].isYang, isMoving: lines[3].isMoving },
    { index: 5, isYang: lines[4].isYang, isMoving: lines[4].isMoving },
    { index: 6, isYang: lines[5].isYang, isMoving: lines[5].isMoving }
  ]
  const lowerTriplet: [Yao, Yao, Yao] = [cloneYao(yaos[0]), cloneYao(yaos[1]), cloneYao(yaos[2])]
  const upperTriplet: [Yao, Yao, Yao] = [cloneYao(yaos[3]), cloneYao(yaos[4]), cloneYao(yaos[5])]
  const lower: Trigram = { name: getTrigramName(lowerTriplet), yaos: lowerTriplet }
  const upper: Trigram = { name: getTrigramName(upperTriplet), yaos: upperTriplet }
  const hex = { lower, upper, yaos, palace: `${lower.name}宫` }
  applyHexagramName(hex)
  applyPalace(hex)
  return hex
}

export function deriveVariant(hex: Hexagram): Hexagram {
  const changed: [Yao, Yao, Yao, Yao, Yao, Yao] = hex.yaos.map(y => {
    const copy = cloneYao(y)
    if (copy.isMoving) copy.isYang = !copy.isYang
    return copy
  }) as any
  const lowerTriplet: [Yao, Yao, Yao] = [cloneYao(changed[0]), cloneYao(changed[1]), cloneYao(changed[2])]
  const upperTriplet: [Yao, Yao, Yao] = [cloneYao(changed[3]), cloneYao(changed[4]), cloneYao(changed[5])]
  const lower: Trigram = { name: getTrigramName(lowerTriplet), yaos: lowerTriplet }
  const upper: Trigram = { name: getTrigramName(upperTriplet), yaos: upperTriplet }
  const variant = { lower, upper, yaos: changed, palace: `${lower.name}宫` }
  applyHexagramName(variant)
  applyPalace(variant)
  return variant
}

// 互卦：取二三四为下卦，三四五为上卦（常用法）
export function deriveMutual(hex: Hexagram): Hexagram {
  const yaos = hex.yaos
  const lowerTriplet: [Yao, Yao, Yao] = [cloneYao(yaos[1]), cloneYao(yaos[2]), cloneYao(yaos[3])]
  const upperTriplet: [Yao, Yao, Yao] = [cloneYao(yaos[2]), cloneYao(yaos[3]), cloneYao(yaos[4])]
  const lower: Trigram = { name: getTrigramName(lowerTriplet), yaos: lowerTriplet }
  const upper: Trigram = { name: getTrigramName(upperTriplet), yaos: upperTriplet }
  const combined: [Yao, Yao, Yao, Yao, Yao, Yao] = [
    cloneYao(lowerTriplet[0]), cloneYao(lowerTriplet[1]), cloneYao(lowerTriplet[2]),
    cloneYao(upperTriplet[0]), cloneYao(upperTriplet[1]), cloneYao(upperTriplet[2])
  ]
  const mutual = { lower, upper, yaos: combined, palace: `${lower.name}宫` }
  applyHexagramName(mutual)
  applyPalace(mutual)
  return mutual
}

function applyHexagramName(hex: Hexagram) {
  hex.name = resolveHexagramName(hex.upper.name, hex.lower.name)
  if (!hex.palace) hex.palace = `${hex.lower.name}宫`
}

export function getDayStemBranch(date: Date): { stem: Stem; branch: Branch } {
  const lunar = Lunar.fromDate(date)
  const stem = lunar.getDayGan() as Stem
  const branch = lunar.getDayZhi() as Branch
  return { stem, branch }
}

export function getTimeGanZhi(date: Date) {
  const lunar = Lunar.fromDate(date)
  const y = { stem: lunar.getYearGan() as Stem, branch: lunar.getYearZhi() as Branch }
  const m = { stem: lunar.getMonthGan() as Stem, branch: lunar.getMonthZhi() as Branch }
  const d = { stem: lunar.getDayGan() as Stem, branch: lunar.getDayZhi() as Branch }
  const h = { stem: lunar.getTimeGan() as Stem, branch: lunar.getTimeZhi() as Branch }
  return { year: y, month: m, day: d, hour: h }
}

// 五行映射（用于六亲判定与五行呈现）
type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
const STEM_WUXING: Record<Stem, WuXing> = {
  '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire', '戊': 'earth',
  '己': 'earth', '庚': 'metal', '辛': 'metal', '壬': 'water', '癸': 'water'
}
const BRANCH_WUXING: Record<Branch, WuXing> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood', '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth', '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
}
const WUXING_CN: Record<WuXing, '木' | '火' | '土' | '金' | '水'> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
}
const CN_TO_WUXING: Record<'木' | '火' | '土' | '金' | '水', WuXing> = {
  '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water'
}
const GENERATES: Record<WuXing, WuXing> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
}
const OVERCOMES: Record<WuXing, WuXing> = {
  wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood'
}

function getRelation(self: WuXing, yaoBranch?: Branch, yaoStem?: Stem): Relation | undefined {
  const other = yaoBranch ? BRANCH_WUXING[yaoBranch] : (yaoStem ? STEM_WUXING[yaoStem] : undefined)
  if (!other) return undefined
  const me = self
  if (me === other) return '兄弟'
  if (GENERATES[me] === other) return '子孙'
  if (GENERATES[other] === me) return '父母'
  if (OVERCOMES[me] === other) return '妻财'
  if (OVERCOMES[other] === me) return '官鬼'
  return undefined
}

function assignFiveElement(yaos: [Yao, Yao, Yao, Yao, Yao, Yao]) {
  yaos.forEach(y => { if (y.stem) y.fiveElement = WUXING_CN[STEM_WUXING[y.stem]] })
}

function applyFuShen(hex: Hexagram, yaos: [Yao, Yao, Yao, Yao, Yao, Yao], rule: SchoolRuleSet, self: WuXing) {
  const missing = yaos.some(y => !y.relation)
  if (!missing) return
  const palaceCode = codeFromYaos(hex.yaos)
  const palaceMeta = findPalaceByCode(palaceCode)
  if (!palaceMeta) return
  const base = PALACE_HEXAGRAMS.find(h => h.palace === palaceMeta.palace && h.category === '本宫')
  if (!base) return
  const baseHex = buildHexagramFromCode(base.code)
  const baseNaJia = mapNaJia(baseHex, rule)
  baseNaJia.forEach(y => { y.relation = getRelation(self, y.branch, y.stem) })
  baseNaJia.forEach((b, idx) => {
    const target = yaos[idx]
    if (!target.relation) {
      target.fuShen = { stem: b.stem, branch: b.branch, relation: b.relation }
    }
  })
}

function toWuXing(el?: string): WuXing | undefined {
  if (!el) return undefined
  return CN_TO_WUXING[el as '木' | '火' | '土' | '金' | '水']
}

// 神煞（示例：桃花、驿马、文昌、禄神）
const DAY_BRANCH_GROUP: Record<'申子辰' | '亥卯未' | '寅午戌' | '巳酉丑', Branch[]> = {
  '申子辰': ['申', '子', '辰'],
  '亥卯未': ['亥', '卯', '未'],
  '寅午戌': ['寅', '午', '戌'],
  '巳酉丑': ['巳', '酉', '丑']
}
function groupOfBranch(b: Branch): keyof typeof DAY_BRANCH_GROUP {
  for (const k of Object.keys(DAY_BRANCH_GROUP) as Array<keyof typeof DAY_BRANCH_GROUP>) {
    if (DAY_BRANCH_GROUP[k].includes(b)) return k
  }
  return '申子辰'
}
export function computeShenSha(dayStem: Stem, dayBranch: Branch) {
  const g = groupOfBranch(dayBranch)
  const taoHuaMap: Record<keyof typeof DAY_BRANCH_GROUP, Branch> = {
    '申子辰': '酉', '亥卯未': '卯', '寅午戌': '午', '巳酉丑': '子'
  }
  const yiMaMap: Record<keyof typeof DAY_BRANCH_GROUP, Branch> = {
    '申子辰': '戌', '亥卯未': '申', '寅午戌': '辰', '巳酉丑': '寅'
  }
  const wenChangMap: Record<Stem, Branch> = {
    '甲': '巳', '乙': '巳', '丙': '未', '丁': '未', '戊': '申', '己': '申',
    '庚': '亥', '辛': '亥', '壬': '卯', '癸': '卯'
  }
  const luShenMap: Record<Stem, Branch> = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '未', '己': '未',
    '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  }
  return {
    桃花: taoHuaMap[g],
    驿马: yiMaMap[g],
    文昌: wenChangMap[dayStem],
    禄神: luShenMap[dayStem]
  }
}

// 长生十二宫（基于日干在地支上的状态，附加到每爻的 branch 上）
const CHANGSHENG_SEQ = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'] as const
type Changsheng = typeof CHANGSHENG_SEQ[number]
const YANG_START: Branch = '亥' // 阳干起长生亥，顺行
const YIN_START: Branch = '午'  // 阴干起长生午，逆行
const BRANCH_ORDER: Branch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
function indexOfBranch(b: Branch) { return BRANCH_ORDER.indexOf(b) }
function nextIndex(i: number) { return (i + 1) % BRANCH_ORDER.length }
function prevIndex(i: number) { return (i - 1 + BRANCH_ORDER.length) % BRANCH_ORDER.length }
function buildChangshengMap(start: Branch, forward: boolean): Record<Branch, Changsheng> {
  const map = {} as Record<Branch, Changsheng>
  let idx = indexOfBranch(start)
  for (const stage of CHANGSHENG_SEQ) {
    map[BRANCH_ORDER[idx]] = stage
    idx = forward ? nextIndex(idx) : prevIndex(idx)
  }
  return map
}
const CS_YANG = buildChangshengMap(YANG_START, true)
const CS_YIN = buildChangshengMap(YIN_START, false)
function isYangStem(s: Stem) { return ['甲','丙','戊','庚','壬'].includes(s) }
export function assignChangsheng(dayStem: Stem, yaos: [Yao, Yao, Yao, Yao, Yao, Yao]) {
  const map = isYangStem(dayStem) ? CS_YANG : CS_YIN
  yaos.forEach(y => { if (y.branch) y.changsheng = map[y.branch] })
}

export function assignSixGods(date: Date, rule: SchoolRuleSet, yaos: [Yao, Yao, Yao, Yao, Yao, Yao]): SixGod[] {
  const base = rule.sixGod
  const { stem, branch } = getDayStemBranch(date)
  const start: SixGod = base.baseBy === 'dayStem'
    ? (base.startByStem?.[stem] || SIX_GODS[0])
    : (base.startByBranch?.[branch] || SIX_GODS[0])
  const seq = base.sequence
  const startIndex = seq.indexOf(start)
  const result: SixGod[] = yaos.map((_, i) => seq[(startIndex + i) % seq.length])
  // 写回到爻（可选）
  result.forEach((sg, i) => { yaos[i].sixGod = sg })
  return result
}

export function mapNaJia(hex: Hexagram, rule: SchoolRuleSet): [Yao, Yao, Yao, Yao, Yao, Yao] {
  const res = hex.yaos.map(cloneYao) as [Yao, Yao, Yao, Yao, Yao, Yao]
  const lowerName = hex.lower.name
  const upperName = hex.upper.name
  const trigramStem = rule.naJia.trigramStem
  // 为下卦三爻赋干
  const lowerStem = trigramStem[lowerName]
  if (Array.isArray(lowerStem)) {
    res[0].stem = lowerStem[0]; res[1].stem = lowerStem[1]; res[2].stem = lowerStem[2]
  } else {
    res[0].stem = lowerStem; res[1].stem = lowerStem; res[2].stem = lowerStem
  }
  // 为上卦三爻赋干
  const upperStem = trigramStem[upperName]
  if (Array.isArray(upperStem)) {
    res[3].stem = upperStem[0]; res[4].stem = upperStem[1]; res[5].stem = upperStem[2]
  } else {
    res[3].stem = upperStem; res[4].stem = upperStem; res[5].stem = upperStem
  }
  // 地支排法：优先使用按八卦定义的六位序列；无则回退默认。
  const lowerSeq = TRIGRAM_BRANCH_SEQUENCE[lowerName] || (rule.naJia.branchSequence as Branch[]) || DEFAULT_BRANCH_SEQUENCE
  const upperSeq = TRIGRAM_BRANCH_SEQUENCE[upperName] || (rule.naJia.branchSequence as Branch[]) || DEFAULT_BRANCH_SEQUENCE
  // 下卦（1-3爻）取该卦位的前3位（自下而上）
  res[0].branch = lowerSeq[0]; res[1].branch = lowerSeq[1]; res[2].branch = lowerSeq[2]
  // 上卦（4-6爻）取该卦位的后3位（自下而上对应4-6爻）
  res[3].branch = upperSeq[3 % upperSeq.length];
  res[4].branch = upperSeq[4 % upperSeq.length];
  res[5].branch = upperSeq[5 % upperSeq.length];
  return res
}

export function getBranchOrder(hex: Hexagram, rule: SchoolRuleSet): Branch[] {
  const res = mapNaJia(hex, rule)
  return res.map(y => y.branch!).filter(Boolean) as Branch[]
}

export function computeAll(lines: Array<{ isYang: boolean; isMoving: boolean }>, options: ComputeOptions) {
  const rule = RULE_SETS[options.ruleSetKey]
  if (!rule) throw new Error(`未找到规则集: ${options.ruleSetKey}`)
  const hex = buildHexagram(lines)
  const variant = deriveVariant(hex)
  const date = options.date || new Date()
  const lunar = Lunar.fromDate(date)
  const withNaJia = mapNaJia(hex, rule)
  assignSixGods(date, rule, withNaJia)
  const variantNaJia = mapNaJia(variant, rule).map(y => ({ ...y, isMoving: false })) as [Yao, Yao, Yao, Yao, Yao, Yao]
  // 六亲判定（基于日干与纳甲之干的生克）
  const { stem: dayStem } = getDayStemBranch(date)
  const selfElement = toWuXing(hex.element) || STEM_WUXING[dayStem]
  const variantSelfElement = toWuXing(variant.element) || STEM_WUXING[dayStem]
  withNaJia.forEach(y => { y.relation = getRelation(selfElement, y.branch, y.stem) })
  variantNaJia.forEach(y => { y.relation = getRelation(variantSelfElement, y.branch, y.stem) })
  assignChangsheng(dayStem, withNaJia)
  assignChangsheng(dayStem, variantNaJia)
  assignFiveElement(withNaJia)
  assignFiveElement(variantNaJia)
  applyFuShen(hex, withNaJia, rule, selfElement)
  const timeGanZhi = getTimeGanZhi(date)
  const shenSha = computeShenSha(timeGanZhi.day.stem, timeGanZhi.day.branch)
  // 四时旺衰（按月支季节，对每爻的天干五行给出旺/相/休/囚/死）
  const seasonEl = (() => {
    const m = timeGanZhi.month.branch
    if (['寅','卯','辰'].includes(m)) return 'wood'
    if (['巳','午','未'].includes(m)) return 'fire'
    if (['申','酉','戌'].includes(m)) return 'metal'
    if (['亥','子','丑'].includes(m)) return 'water'
    return 'earth'
  })() as 'wood'|'fire'|'metal'|'water'|'earth'
  function seasonStatus(season: WuXing, elem: WuXing): '旺'|'相'|'休'|'囚'|'死' {
    if (season === elem) return '旺'
    if (GENERATES[season] === elem) return '相'
    // 休：季生所生的再生（两级生）
    const next = GENERATES[season]
    const next2 = GENERATES[next]
    if (next2 === elem) return '休'
    if (OVERCOMES[season] === elem) return '囚'
    // 死：被季所克之子（两级克）
    const oc = OVERCOMES[season]
    const oc2 = OVERCOMES[oc]
    return oc2 === elem ? '死' : '休'
  }
  withNaJia.forEach(y => {
    if (y.stem) {
      const el = STEM_WUXING[y.stem]
      y.seasonStrength = seasonStatus(seasonEl as any, el)
    }
  })
  variantNaJia.forEach(y => {
    if (y.stem) {
      const el = STEM_WUXING[y.stem]
      y.seasonStrength = seasonStatus(seasonEl as any, el)
    }
  })
  // 游魂/归魂：仅一动爻时，四爻动为游魂，三爻动为归魂
  const youHun = hex.palaceCategory === '游魂'
  const guiHun = hex.palaceCategory === '归魂'
  return {
    rule,
    date,
    lunar: {
      year: lunar.getYearInChinese(),
      month: lunar.getMonthInChinese(),
      day: lunar.getDayInChinese(),
      jieQi: lunar.getJieQi() || ''
    },
    timeGanZhi,
    shenSha,
    hex,
    variant,
    palace: hex.palace,
    youHun,
    guiHun,
    yaos: withNaJia,
    variantYaos: variantNaJia
  }
}
