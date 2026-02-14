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

  const entries = Object.entries(result.shenSha)

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
