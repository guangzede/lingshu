import React from 'react'
import { useBaziStore } from '@/store/bazi'
import type { Branch, Stem } from '@/types/liuyao'
import { BRANCH_ELEMENT, STEM_ELEMENT, getChangSheng, getHiddenStems, getNaYin, getTenGod, getXunKong } from '../../utils'
import './index.scss'

interface ColumnCell {
  stem?: Stem
  branch?: Branch
  stemElement?: string
  branchElement?: string
  tenGod?: string
  naYin?: string
  star?: string
  selfStar?: string
  hiddenStems?: Array<{ stem: Stem; element: string; tenGod: string }>
  xunKong?: Branch[]
}

const FourPillars: React.FC = () => {
  const { result, viewMode, selectedDaYunIndex } = useBaziStore()

  if (!result?.pillars) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">基本排盘</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const dayStem = result.pillars.day.stem
  const currentYear = new Date().getFullYear()
  const dayunList = result.luck?.daYun || []
  const dayunIndex = Math.min(Math.max(selectedDaYunIndex, 0), Math.max(0, dayunList.length - 1))
  const currentDayun = dayunList[dayunIndex]
  const currentLiuNian = currentDayun?.liuNian?.find((ln: any) => ln.year === currentYear) || currentDayun?.liuNian?.[0]

  const normalizeHidden = (branch: Branch, list?: Array<{ stem: Stem; element?: string; tenGod?: string }>) => {
    if (list && list.length) {
      return list.map((h) => ({
        stem: h.stem,
        element: h.element || STEM_ELEMENT[h.stem],
        tenGod: h.tenGod || getTenGod(dayStem, h.stem)
      }))
    }
    return getHiddenStems(branch, dayStem)
  }

  const buildFromPillar = (pillar: any): ColumnCell => ({
    stem: pillar.stem,
    branch: pillar.branch,
    stemElement: pillar.stemElement || STEM_ELEMENT[pillar.stem],
    branchElement: pillar.branchElement || BRANCH_ELEMENT[pillar.branch],
    tenGod: pillar.tenGod,
    naYin: pillar.naYin,
    star: pillar.changSheng || getChangSheng(dayStem, pillar.branch),
    selfStar: getChangSheng(pillar.stem, pillar.branch),
    hiddenStems: normalizeHidden(pillar.branch, pillar.hiddenStems),
    xunKong: getXunKong(pillar.stem, pillar.branch)
  })

  const buildFromGanZhi = (stem?: Stem, branch?: Branch, tenGod?: string): ColumnCell => {
    if (!stem || !branch) return {}
    return {
      stem,
      branch,
      stemElement: STEM_ELEMENT[stem],
      branchElement: BRANCH_ELEMENT[branch],
      tenGod: tenGod || getTenGod(dayStem, stem),
      naYin: getNaYin(stem, branch),
      star: getChangSheng(dayStem, branch),
      selfStar: getChangSheng(stem, branch),
      hiddenStems: getHiddenStems(branch, dayStem),
      xunKong: getXunKong(stem, branch)
    }
  }

  const columns = [
    {
      key: 'liunian',
      label: '流年',
      sub: undefined,
      data: buildFromGanZhi(currentLiuNian?.ganZhi?.[0] as Stem, currentLiuNian?.ganZhi?.[1] as Branch, currentLiuNian?.tenGod)
    },
    {
      key: 'dayun',
      label: '大运',
      sub: undefined,
      data: buildFromGanZhi(currentDayun?.stem, currentDayun?.branch, currentDayun?.tenGod)
    },
    { key: 'year', label: '年柱', data: buildFromPillar(result.pillars.year) },
    { key: 'month', label: '月柱', data: buildFromPillar(result.pillars.month) },
    { key: 'day', label: '日柱', data: buildFromPillar(result.pillars.day) },
    { key: 'hour', label: '时柱', data: buildFromPillar(result.pillars.hour) }
  ]

  const shenShaMap = result.shenSha || {}
  const pickShenSha = (branch?: Branch) => {
    if (!branch) return []
    return Object.entries(shenShaMap)
      .filter(([, list]) => Array.isArray(list) && list.includes(branch))
      .map(([name]) => name)
  }

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">基本排盘</div>
        <div className="bazi-table-wrap">
          <table className="bazi-table">
            <thead>
              <tr>
                <th className="row-label">日期</th>
                {columns.map((col) => (
                  <th key={col.key} className="col-label">
                    <div>{col.label}</div>
                    {col.sub ? <div className="col-sub">{col.sub}</div> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="row-label">主星</th>
                {columns.map((col) => (
                  <td key={`${col.key}-ten`} className="cell-text">{col.data?.tenGod || '--'}</td>
                ))}
              </tr>
              <tr>
                <th className="row-label">天干</th>
                {columns.map((col) => (
                  <td key={`${col.key}-stem`} className="cell-stem">
                    {col.data?.stem ? <span className={`element-${col.data.stemElement}`}>{col.data.stem}</span> : '--'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="row-label">地支</th>
                {columns.map((col) => (
                  <td key={`${col.key}-branch`} className="cell-branch">
                    {col.data?.branch ? <span className={`element-${col.data.branchElement}`}>{col.data.branch}</span> : '--'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="row-label">藏干</th>
                {columns.map((col) => (
                  <td key={`${col.key}-hidden`} className="cell-hidden">
                    {col.data?.hiddenStems?.length ? (
                      <div className="hidden-line">
                        {col.data.hiddenStems.map((h) => (
                          <span key={`${col.key}-${h.stem}-${h.tenGod}`} className={`hidden-stem element-${h.element}`}>
                            {h.stem}
                          </span>
                        ))}
                      </div>
                    ) : '--'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="row-label">藏干十神</th>
                {columns.map((col) => (
                  <td key={`${col.key}-hidden-god`} className="cell-hidden">
                    {col.data?.hiddenStems?.length ? (
                      <div className="hidden-god-list">
                        {col.data.hiddenStems.map((h) => (
                          <div key={`${col.key}-${h.stem}-${h.tenGod}-god`} className="hidden-god-line">
                            {h.tenGod}
                          </div>
                        ))}
                      </div>
                    ) : '--'}
                  </td>
                ))}
              </tr>
              {viewMode === 'pro' && (
                <>
                  <tr>
                    <th className="row-label">星运</th>
                    {columns.map((col) => (
                      <td key={`${col.key}-star`} className="cell-text">{col.data?.star || '--'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th className="row-label">自坐</th>
                    {columns.map((col) => (
                      <td key={`${col.key}-self`} className="cell-text">{col.data?.selfStar || '--'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th className="row-label">空亡</th>
                    {columns.map((col) => (
                      <td key={`${col.key}-xun`} className="cell-text">{col.data?.xunKong?.join('') || '--'}</td>
                    ))}
                  </tr>
                </>
              )}
              <tr className="nayin-row">
                <th className="row-label">纳音</th>
                {columns.map((col) => (
                  <td key={`${col.key}-nayin`} className="cell-text">{col.data?.naYin || '--'}</td>
                ))}
              </tr>
              {viewMode === 'pro' && (
                <tr>
                  <th className="row-label">神煞</th>
                  {columns.map((col) => {
                    const list = pickShenSha(col.data?.branch)
                    return (
                      <td key={`${col.key}-shensha`} className="cell-shensha">
                        {list.length ? (
                          <div className="shen-wrap">
                            {list.map((name) => (
                              <span key={`${col.key}-${name}`} className="shen-item">{name}</span>
                            ))}
                          </div>
                        ) : '--'}
                      </td>
                    )
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default FourPillars
