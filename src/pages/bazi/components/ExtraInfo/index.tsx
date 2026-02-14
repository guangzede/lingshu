import React from 'react'
import { useBaziStore } from '@/store/bazi'
import type { Branch, Stem } from '@/types/liuyao'
import { BRANCH_ELEMENT, STEM_ELEMENT, TEN_GOD_SHORT, getTenGod } from '../../utils'
import './index.scss'

const ExtraInfo: React.FC = () => {
  const { result } = useBaziStore()
  const extra = result?.extra
  const dayStem = result?.pillars?.day?.stem
  const wuxingElements = result?.wuxing?.elements || []
  const maxElement = result?.wuxing?.maxElement
  const minElement = result?.wuxing?.minElement
  const shenShaMap = result?.shenSha || {}

  const elementPercentMap = wuxingElements.reduce((acc: Record<string, number>, item: any) => {
    acc[item.element] = item.percent
    return acc
  }, {})

  const getNaYinElement = (nayin?: string) => {
    if (!nayin) return undefined
    const last = nayin[nayin.length - 1]
    if (last === '木' || last === '火' || last === '土' || last === '金' || last === '水') return last
    return undefined
  }

  const parseGanZhi = (value?: string) => {
    if (!value || value.length < 2) return {}
    return { stem: value[0] as Stem, branch: value[1] as Branch }
  }

  const getTendency = (element?: string) => {
    if (!element || !maxElement || !minElement) return ''
    if (element === maxElement) return '偏旺'
    if (element === minElement) return '偏弱'
    return '平衡'
  }

  const getShenShaTags = (branch?: Branch) => {
    if (!branch) return []
    return Object.entries(shenShaMap)
      .filter(([, list]) => Array.isArray(list) && list.includes(branch))
      .map(([name]) => name)
      .slice(0, 2)
  }

  const SIX_HARMONY: Record<Branch, Branch> = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  }

  const SIX_CLASH: Record<Branch, Branch> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  }

  const SIX_HARM: Record<Branch, Branch> = {
    '子': '未', '未': '子',
    '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅',
    '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申',
    '酉': '戌', '戌': '酉'
  }

  const TRIPLE_PUNISHMENT: Record<Branch, Branch[]> = {
    '寅': ['巳', '申'], '巳': ['申', '寅'], '申': ['寅', '巳'],
    '丑': ['戌', '未'], '戌': ['未', '丑'], '未': ['丑', '戌'],
    '子': ['卯'], '卯': ['子'],
    '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥']
  }

  const buildRelationSummary = (branch?: Branch) => {
    if (!branch || !result?.pillars) return '--'
    const pillars = [
      { label: '年', branch: result.pillars.year.branch },
      { label: '月', branch: result.pillars.month.branch },
      { label: '日', branch: result.pillars.day.branch },
      { label: '时', branch: result.pillars.hour.branch }
    ]
    const group: Record<'合' | '冲' | '刑' | '害', string[]> = { 合: [], 冲: [], 刑: [], 害: [] }

    pillars.forEach((p) => {
      if (SIX_HARMONY[branch] === p.branch) group.合.push(p.label)
      if (SIX_CLASH[branch] === p.branch) group.冲.push(p.label)
      if (SIX_HARM[branch] === p.branch) group.害.push(p.label)
      const punish = TRIPLE_PUNISHMENT[branch] || []
      if (punish.includes(p.branch)) group.刑.push(p.label)
    })

    const format = (key: '合' | '冲' | '刑' | '害') => `${key}:${group[key].length ? group[key].join('') : '--'}`
    return `${format('合')} ${format('冲')} ${format('刑')} ${format('害')}`
  }

  const HINT_MAP: Record<string, string> = {
    '命宫': '性格底色与人生主轴',
    '身宫': '行事方式与现实表现',
    '胎元': '根基起点与早年气场',
    '胎息': '内在习惯与潜意识'
  }

  if (!extra) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">命理要素</div>
          <div className="empty">{result ? '手动八字未提供出生信息，命宫等暂不可用' : '暂无排盘结果'}</div>
        </div>
      </section>
    )
  }

  const renderItem = (label: string, value?: string, nayin?: string) => {
    const { stem, branch } = parseGanZhi(value)
    const element = getNaYinElement(nayin) || (branch ? BRANCH_ELEMENT[branch] : undefined) || (stem ? STEM_ELEMENT[stem] : undefined)
    const tendency = getTendency(element)
    const percent = element ? (elementPercentMap[element] ?? 0) : 0
    const tenGodFull = stem && dayStem ? getTenGod(dayStem, stem) : ''
    const tenGodShort = tenGodFull ? (TEN_GOD_SHORT[tenGodFull] || tenGodFull) : '--'
    const shenShaTags = getShenShaTags(branch)
    const relationText = buildRelationSummary(branch)
    const hintBase = HINT_MAP[label] || '命理关键信息'
    const hint = `${hintBase}${element ? `，${element}气${tendency}` : ''}`

    return (
      <div className="extra-item">
        <div className="extra-header">
          <div className="extra-label">{label}</div>
          <div className={`extra-chip ${element ? `element-${element}` : ''}`}>
            {element ? `${element}${tendency}` : '--'}
          </div>
        </div>
        <div className="extra-main">
          <div className="extra-value">{value || '--'}</div>
          <div className="extra-note">{nayin || ''}</div>
        </div>
        <div className="extra-desc">{hint}</div>
        <div className="extra-line">
          <span className="extra-key">十神</span>
          <span className="extra-val">{tenGodShort}</span>
        </div>
        <div className="extra-strength">
          <span className="extra-key">强弱</span>
          <div className="extra-bar">
            <div className="extra-bar-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="extra-val">{percent}%</span>
        </div>
        <div className="extra-line">
          <span className="extra-key">神煞</span>
          <span className="extra-tags">
            {shenShaTags.length ? shenShaTags.map((name) => (
              <span key={`${label}-${name}`} className="extra-tag">{name}</span>
            )) : <span className="extra-empty">--</span>}
          </span>
        </div>
        <div className="extra-line">
          <span className="extra-key">合冲刑害</span>
          <span className="extra-val">{relationText}</span>
        </div>
      </div>
    )
  }

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">命理要素</div>
        <div className="extra-grid">
          {renderItem('命宫', extra.mingGong, extra.mingGongNaYin)}
          {renderItem('身宫', extra.shenGong, extra.shenGongNaYin)}
          {renderItem('胎元', extra.taiYuan, extra.taiYuanNaYin)}
          {renderItem('胎息', extra.taiXi, extra.taiXiNaYin)}
        </div>
      </div>
    </section>
  )
}

export default ExtraInfo
