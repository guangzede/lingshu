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
}
