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
