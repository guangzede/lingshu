import { SIX_GOD_SEQUENCE, SIX_GOD_START_BY_STEM } from '@/constants/liuyaoRules'
import type { SixGod, Stem } from '@/types/liuyao'

const LINE_COUNT = 6
const YAO_LABELS_TOP_DOWN = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'] as const
const SIX_GOD_ALIAS_MAP: Record<string, SixGod> = {
  青龙: '青龙',
  朱雀: '朱雀',
  勾陈: '勾陈',
  腾蛇: '腾蛇',
  螣蛇: '腾蛇',
  白虎: '白虎',
  玄武: '玄武',
}

const clampTopIndex = (value: number) => Math.max(0, Math.min(LINE_COUNT - 1, value))

// 统一兼容两种 index 约定：
// - 0~5：上爻到初爻
// - 1~6：上爻到初爻
// 其他情况退回数组下标
export function resolveLiuyaoTopIndex(indexValue: unknown, fallbackIndex: number): number {
  const n = Number(indexValue)
  if (Number.isInteger(n)) {
    if (n >= 0 && n < LINE_COUNT) return clampTopIndex(n)
    if (n >= 1 && n <= LINE_COUNT) return clampTopIndex(n - 1)
  }
  return clampTopIndex(fallbackIndex)
}

export function getLiuyaoYaoLabel(indexValue: unknown, fallbackIndex: number): string {
  return YAO_LABELS_TOP_DOWN[resolveLiuyaoTopIndex(indexValue, fallbackIndex)] || '爻位'
}

export function normalizeSixGodName(value?: string): SixGod | undefined {
  if (!value) return undefined
  return SIX_GOD_ALIAS_MAP[value]
}

function buildSixGodsByDayStem(dayStem?: string): SixGod[] | null {
  if (!dayStem) return null
  const start = SIX_GOD_START_BY_STEM[dayStem as Stem]
  if (!start) return null

  const startIndex = Math.max(0, SIX_GOD_SEQUENCE.indexOf(start))
  return Array.from({ length: LINE_COUNT }, (_, topIndex) => {
    const bottomIndex = LINE_COUNT - 1 - topIndex
    return SIX_GOD_SEQUENCE[(startIndex + bottomIndex) % SIX_GOD_SEQUENCE.length]
  })
}

export function normalizeLiuyaoResultSixGods<T extends Record<string, any>>(result: T): T {
  if (!result || !Array.isArray(result.yaos) || result.yaos.length !== LINE_COUNT) {
    return result
  }

  const sixGods = buildSixGodsByDayStem(result?.timeGanZhi?.day?.stem)
  let yaoChanged = false
  const normalizedYaos = result.yaos.map((yao: any, index: number) => {
    const normalizedCurrent = normalizeSixGodName(yao?.sixGod)
    const topIndex = resolveLiuyaoTopIndex(yao?.index, index)
    const expected = sixGods ? sixGods[topIndex] : undefined
    const nextSixGod = expected || normalizedCurrent || yao?.sixGod
    if (yao?.sixGod === nextSixGod) return yao
    yaoChanged = true
    return { ...yao, sixGod: nextSixGod }
  })

  let nextResult: T = yaoChanged
    ? ({ ...result, yaos: normalizedYaos } as T)
    : result

  const rows = result?.hexagramTable?.rows
  if (!Array.isArray(rows) || rows.length !== LINE_COUNT) {
    return nextResult
  }

  let rowChanged = false
  const normalizedRows = rows.map((row: any, index: number) => {
    const normalizedCurrent = normalizeSixGodName(row?.left?.sixGod)
    const topIndex = resolveLiuyaoTopIndex(row?.index, index)
    const expected = sixGods ? sixGods[topIndex] : undefined
    const nextSixGod = expected || normalizedCurrent || row?.left?.sixGod
    if (row?.left?.sixGod === nextSixGod) return row
    rowChanged = true
    return {
      ...row,
      left: {
        ...(row?.left || {}),
        sixGod: nextSixGod,
      },
    }
  })

  if (!rowChanged) return nextResult

  return {
    ...(nextResult as any),
    hexagramTable: {
      ...(result.hexagramTable || {}),
      rows: normalizedRows,
    },
  } as T
}
