import React from 'react'
import { useBaziStore } from '@/store/bazi'
import type { BaziCase, BaziCaseListItem } from '@/types/baziCase'
import { fetchBaziCaseDetail } from '@/services/baziCases'
import { BRANCH_ELEMENT, STEM_ELEMENT } from '../../utils'
import './index.scss'

type PillarInfo = {
  label: string
  stem: string
  branch: string
}

const STEM_HE = [
  ['甲', '己'],
  ['乙', '庚'],
  ['丙', '辛'],
  ['丁', '壬'],
  ['戊', '癸']
]

const BRANCH_HE = [
  ['子', '丑'],
  ['寅', '亥'],
  ['卯', '戌'],
  ['辰', '酉'],
  ['巳', '申'],
  ['午', '未']
]

const BRANCH_CHONG = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥']
]

const BRANCH_HAI = [
  ['子', '未'],
  ['丑', '午'],
  ['寅', '巳'],
  ['卯', '辰'],
  ['申', '亥'],
  ['酉', '戌']
]

const BRANCH_XING = [
  ['子', '卯'],
  ['寅', '巳'],
  ['巳', '申'],
  ['申', '寅'],
  ['丑', '未'],
  ['未', '戌'],
  ['戌', '丑'],
  ['辰', '辰'],
  ['午', '午'],
  ['酉', '酉'],
  ['亥', '亥']
]

const SANHE_GROUPS = [
  { name: '申子辰', element: '水', branches: ['申', '子', '辰'] },
  { name: '寅午戌', element: '火', branches: ['寅', '午', '戌'] },
  { name: '亥卯未', element: '木', branches: ['亥', '卯', '未'] },
  { name: '巳酉丑', element: '金', branches: ['巳', '酉', '丑'] }
]

const ELEMENT_GEN: Record<string, string> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木'
}

const ELEMENT_OVER: Record<string, string> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木'
}

const isPair = (a: string, b: string, pairs: string[][]) =>
  pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x))

const HePan: React.FC = () => {
  const { result, caseName, getSavedCases, birth, gender, calendar } = useBaziStore()
  const [cases, setCases] = React.useState<BaziCaseListItem[]>([])
  const [selectedId, setSelectedId] = React.useState('')
  const [target, setTarget] = React.useState<BaziCase | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const list = await getSavedCases()
        if (mounted) setCases(list)
      } catch (err: any) {
        if (mounted) setError(err?.message || '请登录后查看合盘记录')
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [getSavedCases])

  React.useEffect(() => {
    if (!selectedId) {
      setTarget(null)
      return
    }
    setLoading(true)
    setError('')
    fetchBaziCaseDetail(selectedId)
      .then((detail) => {
        setTarget(detail || null)
      })
      .catch((err: any) => {
        setError(err?.message || '加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedId])

  if (!result?.pillars) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">八字合盘</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const basePillars: PillarInfo[] = [
    { label: '年柱', stem: result.pillars.year.stem, branch: result.pillars.year.branch },
    { label: '月柱', stem: result.pillars.month.stem, branch: result.pillars.month.branch },
    { label: '日柱', stem: result.pillars.day.stem, branch: result.pillars.day.branch },
    { label: '时柱', stem: result.pillars.hour.stem, branch: result.pillars.hour.branch }
  ]

  const targetPillarsRaw = target?.result?.pillars || target?.pillars
  const targetPillars: PillarInfo[] = targetPillarsRaw ? [
    { label: '年柱', stem: targetPillarsRaw.year.stem, branch: targetPillarsRaw.year.branch },
    { label: '月柱', stem: targetPillarsRaw.month.stem, branch: targetPillarsRaw.month.branch },
    { label: '日柱', stem: targetPillarsRaw.day.stem, branch: targetPillarsRaw.day.branch },
    { label: '时柱', stem: targetPillarsRaw.hour.stem, branch: targetPillarsRaw.hour.branch }
  ] : []

  const baseDayMaster = result?.dayMaster
  const targetDayMaster = target?.result?.dayMaster
  const selectedCase = cases.find((item) => item.id === selectedId)
  const pad2 = (n: number) => n.toString().padStart(2, '0')
  const baseBirthLabel = birth
    ? `${birth.year}-${pad2(birth.month)}-${pad2(birth.day)} ${pad2(birth.hour)}:${pad2(birth.minute)}`
    : '--'
  const baseMeta = `${baseBirthLabel} · ${gender === 'male' ? '男' : '女'}${calendar === 'lunar' ? '（农历）' : '（公历）'}`
  const targetGender = target?.gender === 'female' ? '女' : target?.gender === 'male' ? '男' : ''
  const targetCalendar = target?.birth?.calendar ? (target?.birth?.calendar === 'lunar' ? '（农历）' : '（公历）') : ''
  const targetMeta = selectedCase
    ? `${selectedCase.name || '未命名'} · ${selectedCase.birthDate || '手动四柱'}${selectedCase.birthTime ? ` ${selectedCase.birthTime}` : ''}${targetGender ? ` · ${targetGender}` : ''}${targetCalendar}`
    : ''

  const getSelectLabel = (item: BaziCaseListItem) => {
    const name = item.name || '未命名'
    const date = item.birthDate || '手动四柱'
    if (name.length <= 6) {
      return `${name} · ${date}`
    }
    return `${date}`
  }

  const allBranches = [...basePillars.map(p => p.branch), ...targetPillars.map(p => p.branch)]

  const buildPairList = (pairs: string[][], type: 'stem' | 'branch') => {
    const list: Array<{ label: string }> = []
    basePillars.forEach((a) => {
      targetPillars.forEach((b) => {
        const aval = type === 'stem' ? a.stem : a.branch
        const bval = type === 'stem' ? b.stem : b.branch
        if (isPair(aval, bval, pairs)) {
          list.push({ label: `${a.label}(${aval}) · ${b.label}(${bval})` })
        }
      })
    })
    return list
  }

  const hePairs = buildPairList(BRANCH_HE, 'branch')
  const chongPairs = buildPairList(BRANCH_CHONG, 'branch')
  const haiPairs = buildPairList(BRANCH_HAI, 'branch')
  const xingPairs = buildPairList(BRANCH_XING, 'branch')
  const stemHePairs = buildPairList(STEM_HE, 'stem')

  const sanheList = SANHE_GROUPS.map((group) => {
    const hit = group.branches.filter((b) => allBranches.includes(b))
    if (hit.length === 3) {
      return `三合局：${group.name}合${group.element}`
    }
    if (hit.length === 2) {
      const missing = group.branches.find((b) => !hit.includes(b))
      return `半合：${hit.join('')}（缺${missing}）`
    }
    return ''
  }).filter(Boolean)

  const calcElementRelation = (a?: string, b?: string) => {
    if (!a || !b) return { label: '--', score: 0 }
    if (a === b) return { label: '同气同频', score: 6 }
    if (ELEMENT_GEN[a] === b) return { label: '你方偏付出', score: 8 }
    if (ELEMENT_GEN[b] === a) return { label: '对方偏支持', score: 8 }
    if (ELEMENT_OVER[a] === b) return { label: '你方偏主导', score: -8 }
    if (ELEMENT_OVER[b] === a) return { label: '对方偏主导', score: -8 }
    return { label: '--', score: 0 }
  }

  const dayRelation = calcElementRelation(baseDayMaster?.element, targetDayMaster?.element)

  const buildWuxingMap = (res?: any) => {
    const map: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
    if (!res?.wuxing?.elements) return map
    res.wuxing.elements.forEach((e: any) => {
      if (map[e.element] !== undefined) {
        map[e.element] = Number(e.percent) || 0
      }
    })
    return map
  }

  const baseWuxing = buildWuxingMap(result)
  const targetWuxing = buildWuxingMap(target?.result)
  const diffAvg = Object.keys(baseWuxing).reduce((sum, key) => sum + Math.abs(baseWuxing[key] - targetWuxing[key]), 0) / 5
  const complementScore = Math.max(0, Math.min(100, 100 - diffAvg))

  const positive = hePairs.length + sanheList.length
  const negative = chongPairs.length + xingPairs.length + haiPairs.length
  const scoreRaw = 60 + positive * 4 - negative * 5 + (complementScore - 50) * 0.4 + dayRelation.score
  const score = Math.max(0, Math.min(100, Math.round(scoreRaw)))

  const level = score >= 80 ? '同频相合' : score >= 65 ? '互补偏多' : score >= 50 ? '互补一般' : '摩擦偏多'
  const wuxingNote = complementScore >= 75
    ? '五行互补度高，容易形成相生支持'
    : complementScore >= 55
      ? '五行互补度中等，配合得当更稳'
      : '五行互补偏弱，建议在节奏与分工上错峰配合'

  const verdicts = [
    `合盘指数 ${score} 分，整体为「${level}」格局。`,
    `日主关系：${dayRelation.label}，相处中易形成对应的强弱角色。`,
    `五行互补度 ${Math.round(complementScore)}%，${wuxingNote}。`,
    `合冲刑害统计：合${positive}，冲${chongPairs.length}，刑${xingPairs.length}，害${haiPairs.length}，建议以稳定沟通化解冲突。`
  ]

  const buildPillarRelation = (left?: PillarInfo, right?: PillarInfo) => {
    if (!left || !right) return { label: '--', tone: 'neutral', tags: [] as string[] }
    const labels: string[] = []
    const stemElementLeft = STEM_ELEMENT[left.stem as keyof typeof STEM_ELEMENT]
    const stemElementRight = STEM_ELEMENT[right.stem as keyof typeof STEM_ELEMENT]
    const branchElementLeft = BRANCH_ELEMENT[left.branch as keyof typeof BRANCH_ELEMENT]
    const branchElementRight = BRANCH_ELEMENT[right.branch as keyof typeof BRANCH_ELEMENT]

    if (stemElementLeft && stemElementRight) {
      if (ELEMENT_GEN[stemElementLeft] === stemElementRight || ELEMENT_GEN[stemElementRight] === stemElementLeft) {
        labels.push('干生')
      }
      if (ELEMENT_OVER[stemElementLeft] === stemElementRight || ELEMENT_OVER[stemElementRight] === stemElementLeft) {
        labels.push('干克')
      }
    }

    if (branchElementLeft && branchElementRight) {
      if (ELEMENT_GEN[branchElementLeft] === branchElementRight || ELEMENT_GEN[branchElementRight] === branchElementLeft) {
        labels.push('支生')
      }
      if (ELEMENT_OVER[branchElementLeft] === branchElementRight || ELEMENT_OVER[branchElementRight] === branchElementLeft) {
        labels.push('支克')
      }
    }

    if (isPair(left.stem, right.stem, STEM_HE)) labels.push('干合')
    if (isPair(left.branch, right.branch, BRANCH_HE)) labels.push('支合')
    if (isPair(left.branch, right.branch, BRANCH_CHONG)) labels.push('支冲')
    if (isPair(left.branch, right.branch, BRANCH_XING)) labels.push('支刑')
    if (isPair(left.branch, right.branch, BRANCH_HAI)) labels.push('支害')
    const label = labels.length ? labels.join(' · ') : '平'
    const tone = labels.some((item) => item.includes('冲') || item.includes('刑') || item.includes('害') || item.includes('克'))
      ? 'warn'
      : labels.some((item) => item.includes('合') || item.includes('生')) ? 'good' : 'neutral'
    return { label, tone, tags: labels }
  }

  return (
    <section className="bazi-section">
      <div className="bazi-card hepan-card">
        <div className="section-title">八字合盘</div>
        <div className="hepan-head">
          <div className="hepan-col">
            <div className="hepan-label">本命盘</div>
            <div className="hepan-name">{caseName || '当前排盘'}</div>
            <div className="hepan-meta hepan-meta-base">{baseMeta}</div>
          </div>
          <div className="hepan-col">
            <div className="hepan-label">合盘对象</div>
            <select
              className="hepan-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">请选择记录</option>
              {cases.map((item) => (
                <option key={item.id} value={item.id}>
                  {getSelectLabel(item)}
                </option>
              ))}
            </select>
            {targetMeta
              ? <div className="hepan-meta">{targetMeta}</div>
              : <div className="hepan-meta hepan-meta-placeholder">{'\u00A0'}</div>}
            {loading && <div className="hepan-note">加载中...</div>}
            {error && <div className="hepan-note">{error}</div>}
          </div>
        </div>

        {targetPillars.length > 0 && (
          <div className="hepan-network">
            <div className="hepan-network-title">合盘矩阵</div>
            <div className="hepan-network-grid">
              <div className="hepan-network-corner">
                <span className="corner-diag corner-base"><em>本盘</em></span>
                <span className="corner-diag corner-target"><em>合盘</em></span>
              </div>
              {targetPillars.map((p) => (
                <div key={`net-head-${p.label}`} className="hepan-network-head">
                  {/* <div className="net-label">{p.label}</div> */}
                  <div className={`net-stem element-${STEM_ELEMENT[p.stem as keyof typeof STEM_ELEMENT]}`}>{p.stem}</div>
                  <div className={`net-branch element-${BRANCH_ELEMENT[p.branch as keyof typeof BRANCH_ELEMENT]}`}>{p.branch}</div>
                </div>
              ))}
              {basePillars.map((base) => (
                <React.Fragment key={`net-row-${base.label}`}>
                  <div className="hepan-network-side">
                    {/* <div className="net-label">{base.label}</div> */}
                    <div className={`net-stem element-${STEM_ELEMENT[base.stem as keyof typeof STEM_ELEMENT]}`}>{base.stem}</div>
                    <div className={`net-branch element-${BRANCH_ELEMENT[base.branch as keyof typeof BRANCH_ELEMENT]}`}>{base.branch}</div>
                  </div>
                  {targetPillars.map((target) => {
                    const relation = buildPillarRelation(base, target)
                    const toneClass = relation.tone === 'warn' ? 'warn' : relation.tone === 'good' ? 'good' : 'neutral'
                    return (
                      <div key={`net-cell-${base.label}-${target.label}`} className={`hepan-network-cell ${toneClass}`}>
                        {relation.tags.length ? (
                          relation.tags.map((tag) => (
                            <span key={`${base.label}-${target.label}-${tag}`} className="hepan-network-tag">{tag}</span>
                          ))
                        ) : (
                          <span className="hepan-network-tag muted">平</span>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {!targetPillars.length ? (
          <div className="hepan-empty">请选择一条记录进行合盘对比</div>
        ) : (
          <>
            <div className="hepan-metrics">
              <div className="hepan-metric">
                <span>合盘指数</span>
                <strong>{score}</strong>
              </div>
              <div className="hepan-metric">
                <span>日主关系</span>
                <strong>{dayRelation.label}</strong>
              </div>
              <div className="hepan-metric">
                <span>五行互补</span>
                <strong>{Math.round(complementScore)}%</strong>
              </div>
              <div className="hepan-metric">
                <span>合冲刑害</span>
                <strong>{`合${positive}`}</strong>
                <strong>{`冲${chongPairs.length} `}</strong>
                <strong>{`刑${xingPairs.length} `}</strong>
                <strong>{`害${haiPairs.length}`}</strong>
              </div>
            </div>

            <div className="hepan-verdicts">
              {verdicts.map((line, idx) => (
                <div key={`verdict-${idx}`}>{line}</div>
              ))}
            </div>

            <div className="hepan-relations">
              <div className="hepan-rel-group">
                <div className="hepan-rel-title">合局与半合</div>
                <div className="hepan-rel-list">
                  {sanheList.length ? sanheList.map((item, idx) => (
                    <span key={`sanhe-${idx}`} className="hepan-rel-item">{item}</span>
                  )) : <span className="hepan-rel-item">暂无三合/半合</span>}
                </div>
              </div>

              <div className="hepan-rel-group">
                <div className="hepan-rel-title">六合</div>
                <div className="hepan-rel-list">
                  {hePairs.length ? hePairs.map((item, idx) => (
                    <span key={`he-${idx}`} className="hepan-rel-item">{item.label}</span>
                  )) : <span className="hepan-rel-item">暂无六合</span>}
                </div>
              </div>

              <div className="hepan-rel-group">
                <div className="hepan-rel-title">天干合</div>
                <div className="hepan-rel-list">
                  {stemHePairs.length ? stemHePairs.map((item, idx) => (
                    <span key={`stem-${idx}`} className="hepan-rel-item">{item.label}</span>
                  )) : <span className="hepan-rel-item">暂无天干合</span>}
                </div>
              </div>

              <div className="hepan-rel-group">
                <div className="hepan-rel-title">冲、刑、害</div>
                <div className="hepan-rel-list hepan-rel-list-block">
                  {chongPairs.map((item, idx) => (
                    <span key={`chong-${idx}`} className="hepan-rel-item">{`冲：${item.label}`}</span>
                  ))}
                  {xingPairs.map((item, idx) => (
                    <span key={`xing-${idx}`} className="hepan-rel-item">{`刑：${item.label}`}</span>
                  ))}
                  {haiPairs.map((item, idx) => (
                    <span key={`hai-${idx}`} className="hepan-rel-item">{`害：${item.label}`}</span>
                  ))}
                  {!chongPairs.length && !xingPairs.length && !haiPairs.length && (
                    <span className="hepan-rel-item">暂无冲刑害</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default HePan
