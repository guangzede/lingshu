// 保存的卦例数据结构
export interface LineState {
  isYang: boolean
  isMoving: boolean
}

export interface SavedCase {
  id: string // 时间戳作为唯一ID
  dateValue: string // YYYY-MM-DD
  timeValue: string // HH:mm
  lines: [LineState, LineState, LineState, LineState, LineState, LineState] // 6个爻的状态
  ruleSetKey: string // 排盘规则集
  question: string // 求测事项
  remark?: string // 备注（可选）
  manualMode?: boolean // 保存时的手动输入模式状态
  createdAt: number // 创建时间戳（毫秒）
  baseHexName?: string // 本卦名称（存历史列表用）
  variantHexName?: string // 变卦名称（存历史列表用）
}

export interface SavedCaseListItem {
  id: string
  dateValue: string
  timeValue: string
  question: string
  remark?: string
  createdAt: number
  baseHexName?: string
  variantHexName?: string
}
