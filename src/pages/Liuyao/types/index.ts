export interface LineState {
  isYang: boolean
  isMoving: boolean
}

export interface YaoData {
  branch?: string
  stem?: string
  relation?: string
  fiveElement?: string
  sixGod?: string
  isYang?: boolean
  isMoving?: boolean
  seasonStrength?: string
  changsheng?: string
  fuShen?: {
    relation?: string
    stem?: string
    branch?: string
  }
}

export interface HexData {
  name?: string
  palace?: string
  palaceCategory?: string
  shiIndex?: number
  yingIndex?: number
}

export type PaipanMode = 'manual' | 'count' | 'auto'

// 定义 LiuyaoResult 类型
export interface LiuyaoResult {
  rule: any
  date: Date
  lunar: {
    year: string
    month: string
    day: string
    jieQi: string
  }
  timeGanZhi: {
    year: { stem: string; branch: string }
    month: { stem: string; branch: string }
    day: { stem: string; branch: string }
    hour: { stem: string; branch: string }
  }
  shenSha: any[]
  xunKong: any[]
  hex: any
  variant: any
  palace: string
  youHun: boolean
  guiHun: boolean
  yaos: any[]
  variantYaos: any[]
  branchRelations?: {
    dayBranch: string
    hourBranch: string
    dayRelations: Array<{ branch: string; isHarmony: boolean; isClash: boolean; isTriple: boolean; isPunish: boolean; relationText?: string }>
    hourRelations: Array<{ branch: string; isHarmony: boolean; isClash: boolean; isTriple: boolean; isPunish: boolean; relationText?: string }>
  }
  yaoInteractions?: Array<{
    yaoIndex: number
    yaoLabel: string
    yaoInfo: string
    intraRelations: { otherIndex: number; otherLabel: string; relation: string }[]
    variantRelation?: string
  }>
  yaoRelations?: Array<{
    yaoBranch: string
    yaoWuxing: string
    relations: string[]
  } | null>
  yaoUi?: Array<{
    yaoIndex: number
    yaoLabel: string
    yaoInfo: string
    isMoving: boolean
    fiveElement: string
    fiveElementClass: string
    seasonStrength: string
    seasonStrengthClass: string
    changsheng: string
    relations: string[]
    variantRelation: string
    energy: {
      baseScore: number
      finalScore: number
      level: string
      tags: Array<{ code: string; label: string; type: 'buff' | 'debuff' | 'neutral' }>
    } | null
  }>
  infoGrid?: {
    dateText: string
    lunarText: string
    ganzhi: { year: string; month: string; day: string; hour: string }
    xunKongText: string
    shenShaItems: Array<{ label: string; value: string; highlight?: string }>
  }
  hexagramTable?: {
    baseHeader: { name: string; palace: string; palaceCategory: string }
    variantHeader: { name: string; palace: string; palaceCategory: string }
    rows: Array<{
      index: number
      left: {
        sixGod: string
        fuShen: string
        relation: string
        yaoClass: string
        fiveElement: string
        shiYing: string
      }
      right: {
        relation: string
        yaoClass: string
        fiveElement: string
        shiYing: string
      }
    }>
  }
  energyAnalysis?: {
    lines: Array<{
      position: number
      base_score: number
      final_score: number
      level: 'SS' | 'S' | 'A' | 'B' | 'C' | 'F'
      tags: Array<{ code: string; label: string; type: 'buff' | 'debuff' | 'neutral' }>
      audit_logs: string[]
    }>
  }
}
