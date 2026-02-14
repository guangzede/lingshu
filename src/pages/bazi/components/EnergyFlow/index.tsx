import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const EnergyFlow: React.FC = () => {
  const { result, viewMode } = useBaziStore()
  const [open, setOpen] = React.useState(false)

  if (!result?.relations) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">合冲刑害</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const { branches, combos, stems } = result.relations
  const pillarMap = {
    '年柱': result.pillars.year,
    '月柱': result.pillars.month,
    '日柱': result.pillars.day,
    '时柱': result.pillars.hour
  }

  const formatBranchRelation = (r: any) => {
    const [aLabel, bLabel] = r.pillars || []
    const a = (pillarMap as any)[aLabel]
    const b = (pillarMap as any)[bLabel]
    const detail = a && b ? `${aLabel}(${a.branch}) / ${bLabel}(${b.branch})` : (r.pillars || []).join(' / ')
    const short = a && b ? `${a.branch}${b.branch}` : ''
    return { detail, short }
  }

  const formatStemRelation = (r: any) => {
    const [aLabel, bLabel] = r.pillars || []
    const a = (pillarMap as any)[aLabel]
    const b = (pillarMap as any)[bLabel]
    const detail = a && b ? `${aLabel}(${a.stem}) / ${bLabel}(${b.stem})` : (r.pillars || []).join(' / ')
    const short = a && b ? `${a.stem}${b.stem}` : ''
    return { detail, short }
  }

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-head" onClick={() => setOpen(!open)}>
          <div className="section-title">合冲刑害</div>
          <button className={`section-toggle ${open ? 'open' : ''}`}>
            {open ? '收起' : '展开'}
          </button>
        </div>

        {!open ? (
          <div className="inline-note">内容已折叠，点击展开查看详情。</div>
        ) : (
          <>
            {combos.length > 0 ? (
              <div className="tag-list">
                {combos.map((c: any, idx: number) => (
                  <span key={`${c.type}-${idx}`} className="tag">{c.type} {c.detail}</span>
                ))}
              </div>
            ) : (
              <div className="empty">暂无合局/半合信息</div>
            )}

            {viewMode === 'pro' && (
              <div className="relation-list">
                {branches.length > 0 ? branches.map((r: any, idx: number) => {
                  const info = formatBranchRelation(r)
                  return (
                    <div key={`${r.type}-${idx}`} className="relation-item">
                      <span className="relation-type">{r.type}</span>
                      <span className="relation-pillars">{info.detail}</span>
                      <span className="relation-brief">{info.short || r.detail || ''}</span>
                    </div>
                  )
                }) : <div className="empty">暂无刑冲克害</div>}
              </div>
            )}

            {viewMode === 'pro' && stems?.length ? (
              <div className="relation-list">
                {stems.map((r: any, idx: number) => {
                  const info = formatStemRelation(r)
                  return (
                    <div key={`${r.type}-stem-${idx}`} className="relation-item">
                      <span className="relation-type">{r.type}</span>
                      <span className="relation-pillars">{info.detail}</span>
                      <span className="relation-brief">{info.short || ''}{r.detail ? ` · ${r.detail}` : ''}</span>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export default EnergyFlow
