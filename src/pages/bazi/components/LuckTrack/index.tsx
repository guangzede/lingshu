import React from 'react'
import { Solar } from 'lunar-javascript'
import { useBaziStore } from '@/store/bazi'
import type { Branch, Stem } from '@/types/liuyao'
import { BRANCH_ELEMENT, HIDDEN_STEMS, STEM_ELEMENT, TEN_GOD_SHORT, getTenGod } from '../../utils'
import './index.scss'

const LuckTrack: React.FC = () => {
  const { result, selectedDaYunIndex, setSelectedDaYunIndex } = useBaziStore()
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null)
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState<number>(0)

  const dayunList = result?.luck?.daYun || []
  const currentIndex = Math.min(Math.max(selectedDaYunIndex, 0), Math.max(0, dayunList.length - 1))
  const currentDayun = dayunList[currentIndex]
  const currentYear = new Date().getFullYear()
  const todayLunar = Solar.fromDate(new Date()).getLunar()
  const currentLunarMonthIndex = Math.max(1, todayLunar.getMonth()) - 1
  const dayStem = result?.pillars?.day?.stem

  const STEMS: Stem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const BRANCHES: Branch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const MONTH_LABELS = ['正','二','三','四','五','六','七','八','九','十','十一','十二']

  const getBranchTenGodFull = (branch?: Branch) => {
    if (!branch) return '--'
    if (!dayStem) return '--'
    const mainHidden = HIDDEN_STEMS[branch]?.[0]
    if (!mainHidden) return '--'
    return getTenGod(dayStem, mainHidden)
  }

  const getBranchTenGodShort = (branch?: Branch) => {
    const full = getBranchTenGodFull(branch)
    return TEN_GOD_SHORT[full] || full
  }

  const buildLiuYueList = (ganZhi?: string) => {
    if (!ganZhi) return []
    if (!dayStem) return []
    const yearGan = ganZhi[0] as Stem
    const yearGanIndex = STEMS.indexOf(yearGan)
    const offsetTable = [2, 4, 6, 8, 0]
    const offset = offsetTable[Math.max(0, yearGanIndex) % 5]
    return Array.from({ length: 12 }, (_, idx) => {
      const gan = STEMS[(idx + offset) % 10]
      const zhi = BRANCHES[(idx + 2) % 12]
      return {
        index: idx,
        label: MONTH_LABELS[idx] || `${idx + 1}`,
        gan,
        zhi,
        stemTen: getTenGod(dayStem, gan),
        branchTen: getBranchTenGodFull(zhi)
      }
    })
  }

  React.useEffect(() => {
    if (!result?.luck || !currentDayun?.liuNian?.length) {
      setSelectedYear(null)
      return
    }
    const hasCurrent = currentDayun.liuNian.some((ln: any) => ln.year === currentYear)
    setSelectedYear(hasCurrent ? currentYear : currentDayun.liuNian[0].year)
  }, [currentDayun?.index, result?.luck, currentYear])

  React.useEffect(() => {
    if (selectedYear === currentYear) {
      setSelectedMonthIndex(currentLunarMonthIndex)
    } else {
      setSelectedMonthIndex(0)
    }
  }, [selectedYear, currentYear, currentLunarMonthIndex])

  const activeLiuNian = currentDayun?.liuNian?.find((ln: any) => ln.year === selectedYear) || currentDayun?.liuNian?.[0]
  const liuYueList = buildLiuYueList(activeLiuNian?.ganZhi)

  const handleToday = () => {
    const idx = dayunList.findIndex((dy: any) => dy.startYear && dy.endYear && currentYear >= dy.startYear && currentYear <= dy.endYear)
    if (idx >= 0) {
      setSelectedDaYunIndex(idx)
    }
    setSelectedYear(currentYear)
  }

  const TEN_GOD_HINTS: Record<string, { keywords: string; desc: string }> = {
    '比肩': { keywords: '自我、同辈、协作', desc: '强调自主与协作并存，适合拓展人脉或并行推进。' },
    '劫财': { keywords: '竞争、变动、资源', desc: '竞争与资源流动增强，注意收益分配与合作关系。' },
    '食神': { keywords: '创造、表达、享受', desc: '利于表达、创作与口福，适合沉淀作品与技能。' },
    '伤官': { keywords: '突破、锋芒、变革', desc: '突破意识增强，注意言行尺度与规则冲突。' },
    '偏财': { keywords: '机遇、灵活、收益', desc: '机会与财动增加，适合抓住临时机缘。' },
    '正财': { keywords: '积累、稳定、务实', desc: '偏重稳定收益与现实积累，适合稳健推进。' },
    '七杀': { keywords: '压力、挑战、执行', desc: '压力与任务增强，宜主动承担并保持纪律。' },
    '正官': { keywords: '秩序、责任、规范', desc: '制度与责任感提升，适合规范化推进。' },
    '偏印': { keywords: '思考、灵感、内省', desc: '思考与灵感增强，适合学习与规划。' },
    '正印': { keywords: '学习、贵人、守成', desc: '学习与贵人助力明显，适合稳扎稳打。' }
  }

  const buildDetail = (title: string, stem?: Stem, stemTen?: string, branch?: Branch, branchTen?: string) => {
    const stemInfo = TEN_GOD_HINTS[stemTen || '']
    const branchInfo = TEN_GOD_HINTS[branchTen || '']
    const keywords = [stemInfo?.keywords, branchInfo?.keywords].filter(Boolean).join(' / ') || '--'
    const desc = [stemInfo?.desc, branchInfo?.desc].filter(Boolean).join('；') || '暂无解读信息'
    return (
      <div className="luck-detail-card">
        <div className="detail-title">{title}</div>
        <div className="detail-line">
          <span>干：{stem || '--'} · {stemTen || '--'}</span>
          <span>支：{branch || '--'} · {branchTen || '--'}</span>
        </div>
        <div className="detail-keywords">关键词：{keywords}</div>
        <div className="detail-desc">{desc}</div>
      </div>
    )
  }

  const formatAge = (age?: number) => {
    if (age === undefined || age === null || Number.isNaN(Number(age))) return '--'
    return String(Math.floor(Number(age)))
  }

  const birthYear = result?.meta?.birth?.date ? Number(result.meta.birth.date.slice(0, 4)) : undefined
  const currentAge = birthYear ? Math.max(0, currentYear - birthYear) : undefined

  if (!result?.luck) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">大运流年</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">大运流年</div>
        <div className="luck-meta">
          <div className="luck-meta-left">
            <div>起运：{formatAge(result.luck.startAge)}岁 · 交运：{result.luck.startYear ?? '--'}年</div>
            <div>当前年龄：{currentAge ?? '--'} · 司命：{dayStem}</div>
          </div>
          <button className="luck-today" onClick={handleToday}>今</button>
        </div>

        <div className="luck-panel">
          <div className="luck-row">
            <div className="luck-label">大运</div>
            {dayunList.length ? (
              <div className="luck-grid dayun-grid" style={{ ['--count' as any]: dayunList.length }}>
                {dayunList.map((dy: any, idx: number) => (
                  <button
                    key={dy.index}
                    className={`luck-item dayun-item ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setSelectedDaYunIndex(idx)}
                  >
                    <div className="luck-year">{dy.startYear ?? '--'}</div>
                    <div className="luck-age">
                      {formatAge(dy.startAge)}{dy.endAge !== undefined ? `~${formatAge(dy.endAge)}` : ''}岁
                    </div>
                    <div className="luck-gz-stack">
                      <div className="luck-gz-line">
                        <span className={`luck-char element-${STEM_ELEMENT[dy.stem]}`}>{dy.stem}</span>
                        <span className="luck-god">{TEN_GOD_SHORT[dy.tenGod] || dy.tenGod}</span>
                      </div>
                      <div className="luck-gz-line">
                        <span className={`luck-char element-${BRANCH_ELEMENT[dy.branch]}`}>{dy.branch}</span>
                        <span className="luck-god">{pickBranchTenGod(dy.branch)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">暂无大运信息</div>
            )}
          </div>

          <div className="luck-row">
            <div className="luck-label">流年</div>
            {currentDayun?.liuNian?.length ? (
              <div className="luck-grid liunian-grid" style={{ ['--count' as any]: currentDayun.liuNian.length }}>
                {currentDayun.liuNian.map((ln: any) => {
                  const stem = ln.ganZhi?.[0]
                  const branch = ln.ganZhi?.[1]
                  const isActive = ln.year === selectedYear
                  const isCurrent = ln.year === currentYear
                  const branchTen = getBranchTenGodShort(branch as Branch)
                  return (
                    <div
                      key={`${currentDayun.index}-${ln.year}`}
                      className={`luck-item liunian-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => setSelectedYear(ln.year)}
                    >
                      <div className="luck-year">{ln.year}</div>
                      <div className="luck-gz-stack">
                        <div className="luck-gz-line">
                          <span className={`luck-char element-${STEM_ELEMENT[stem]}`}>{stem}</span>
                          <span className="luck-god">{TEN_GOD_SHORT[ln.tenGod] || ln.tenGod}</span>
                        </div>
                        <div className="luck-gz-line">
                          <span className={`luck-char element-${BRANCH_ELEMENT[branch]}`}>{branch}</span>
                          <span className="luck-god">{branchTen}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty">暂无流年信息</div>
            )}
          </div>

          <div className="luck-row">
            <div className="luck-label">流月</div>
            {liuYueList.length ? (
              <div className="luck-grid liuyue-grid" style={{ ['--count' as any]: liuYueList.length }}>
                {liuYueList.map((lm) => {
                  const isCurrent = selectedYear === currentYear && lm.index === currentLunarMonthIndex
                  const isActive = lm.index === selectedMonthIndex
                  return (
                    <div
                      key={`liuyue-${lm.index}`}
                      className={`luck-item liuyue-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => setSelectedMonthIndex(lm.index)}
                    >
                      <div className="luck-month">{lm.label}月</div>
                      <div className="luck-gz-stack">
                        <div className="luck-gz-line">
                          <span className={`luck-char element-${STEM_ELEMENT[lm.gan]}`}>{lm.gan}</span>
                          <span className="luck-god">{TEN_GOD_SHORT[lm.stemTen] || lm.stemTen}</span>
                        </div>
                        <div className="luck-gz-line">
                          <span className={`luck-char element-${BRANCH_ELEMENT[lm.zhi]}`}>{lm.zhi}</span>
                          <span className="luck-god">{TEN_GOD_SHORT[lm.branchTen] || lm.branchTen}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty">暂无流月信息</div>
            )}
          </div>

          {(activeLiuNian || liuYueList.length) && (
            <div className="luck-detail">
              {activeLiuNian ? buildDetail(
                `流年解读 · ${activeLiuNian.year}`,
                activeLiuNian.ganZhi?.[0] as Stem,
                activeLiuNian.tenGod,
                activeLiuNian.ganZhi?.[1] as Branch,
                getBranchTenGodFull(activeLiuNian.ganZhi?.[1] as Branch)
              ) : null}
              {liuYueList[selectedMonthIndex] ? buildDetail(
                `流月解读 · ${liuYueList[selectedMonthIndex].label}月`,
                liuYueList[selectedMonthIndex].gan,
                liuYueList[selectedMonthIndex].stemTen,
                liuYueList[selectedMonthIndex].zhi,
                liuYueList[selectedMonthIndex].branchTen
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default LuckTrack
