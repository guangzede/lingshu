import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const AuxStars: React.FC = () => {
  const { result } = useBaziStore()

  if (!result?.shenSha) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">神煞</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const pillars = result.pillars
  const stemSet = new Set([pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem])
  const branchSet = new Set([pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch])

  const entries = Object.entries(result.shenSha).map(([key, value]) => {
    const list = Array.isArray(value) ? value : [value]
    const filtered = list.filter((token: any) => {
      if (typeof token !== 'string') return false
      if (stemSet.has(token as any)) return true
      if (branchSet.has(token as any)) return true
      if (token.includes('柱')) return true
      return false
    })
    return [key, filtered] as const
  }).filter(([, value]) => value.length > 0)

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">神煞</div>
        {entries.length === 0 ? (
          <div className="empty">暂无神煞信息</div>
        ) : (
          <div className="shen-sha-grid">
            {entries.map(([key, value]) => (
              <div key={key} className="shen-sha-item">
                <span className="shen-sha-name">{key}</span>
                <span className="shen-sha-value">{Array.isArray(value) ? value.join('、') : value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AuxStars
