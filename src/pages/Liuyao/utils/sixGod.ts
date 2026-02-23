import { SIX_GOD_SEQUENCE, SIX_GOD_START_BY_STEM } from '@/constants/liuyaoRules'
import type { SixGod, Stem } from '@/types/liuyao'

const LINE_COUNT = 6

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
  if (!sixGods) return result

  let yaoChanged = false
  const normalizedYaos = result.yaos.map((yao: any, index: number) => {
    const expected = sixGods[index]
    if (yao?.sixGod === expected) return yao
    yaoChanged = true
    return { ...yao, sixGod: expected }
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
    const expected = sixGods[index]
    if (row?.left?.sixGod === expected) return row
    rowChanged = true
    return {
      ...row,
      left: {
        ...(row?.left || {}),
        sixGod: expected,
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

