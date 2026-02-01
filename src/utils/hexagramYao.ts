let TEXTS: any = {}
try {
  // 动态加载 JSON，若 JSON 格式错误则回退为空对象，避免模块加载时抛出错误
  // 使用 require 而非静态 import 以便捕获解析异常
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  TEXTS = require('./hexagram_texts.json')
} catch (e) {
  // JSON 解析失败或文件缺失时记录警告，后续使用占位数据
  // 在运行时可修复 JSON 文件后重新加载模块以获得完整数据
  // console.warn will be visible when running tests
  // tslint:disable-next-line:no-console
  // use any to avoid TS inference issues
  console.warn('[hexagram_texts] failed to load JSON, using empty dataset', (e as any) && (e as any).message)
}

export interface HexagramTexts {
  name: string
  tuan?: string // 彖曰
  xiang?: string // 象曰
  yao: string[] // 六爻爻辞，自下而上 index 0 = 初爻
}

const HEXAGRAM_TEXTS: Record<string, HexagramTexts> = (TEXTS || {}) as unknown as Record<string, HexagramTexts>

/**
 * 返回完整卦文（含 `tuan`、`xiang`、`yao` 数组）。
 * 如果没有找到，会返回一个带占位信息的对象。
 */
export function getHexagramTexts(hexName: string): HexagramTexts {
  // 精确匹配
  const found = HEXAGRAM_TEXTS[hexName]
  if (found) return found

  // 容错匹配：如果传入的是诸如 "乾为天"、"风地观" 之类的复合名，尝试从现有短名中匹配包含的汉字
  const keys = Object.keys(HEXAGRAM_TEXTS)
  for (const k of keys) {
    if (!k) continue
    if (hexName.includes(k)) return HEXAGRAM_TEXTS[k]
    if (k.includes(hexName)) return HEXAGRAM_TEXTS[k]
  }
  return {
    name: hexName,
    tuan: `彖曰占位：${hexName}`,
    xiang: `象曰占位：${hexName}`,
    yao: [
      `初爻占位：${hexName}`,
      `二爻占位：${hexName}`,
      `三爻占位：${hexName}`,
      `四爻占位：${hexName}`,
      `五爻占位：${hexName}`,
      `上爻占位：${hexName}`
    ]
  }
}

/**
 * 兼容旧 API：返回指定爻的爻辞（索引从 0 开始）。
 */
export function getYaoText(hexName: string, yaoIndex: number): string {
  const h = getHexagramTexts(hexName)
  return h.yao[yaoIndex] || `爻辞占位：${hexName} - 爻${yaoIndex + 1}`
}

/**
 * 返回逆序的爻辞数组（上爻优先），每项仍然是字符串。
 * 便于需要“逆序排列爻辞”的显示场景。
 */
export function getYaoTextsReversed(hexName: string): string[] {
  const h = getHexagramTexts(hexName)
  // 原始 JSON 中约定 index 0 = 初爻（自下而上），因此逆序为上->下
  return [...h.yao].slice().reverse()
}

/**
 * 返回逆序爻辞的对象数组，附带 `marker` 字段：
 * - '用九' 或 '用六'：若爻辞中含有该字样
 * - null：未检测到
 */
export function getYaoObjectsReversed(hexName: string): Array<{ text: string; marker: '用九' | '用六' | null }> {
  const reversed = getYaoTextsReversed(hexName)
  return reversed.map((t) => {
    if (t.includes('用九')) return { text: t, marker: '用九' }
    if (t.includes('用六')) return { text: t, marker: '用六' }
    return { text: t, marker: null }
  })
}

/**
 * 扫描全部卦，返回那些没有任一爻包含“用九”或“用六”的卦名清单，便于人工补充。
 */
export function reportHexagramsMissingYongMarkers(): string[] {
  return Object.keys(HEXAGRAM_TEXTS).filter((k) => {
    const h = HEXAGRAM_TEXTS[k]
    const found = h.yao.some((s) => s.includes('用九') || s.includes('用六'))
    return !found
  })
}

export default getHexagramTexts
