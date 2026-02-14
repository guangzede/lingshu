import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const Explore: React.FC = () => {
  const { result } = useBaziStore()

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">全局分析</div>
        {result?.pattern?.summary?.length ? (
          <div className="analysis-block">
            {result.pattern.summary.map((line: string, idx: number) => (
              <div key={idx} className="analysis-line">{line}</div>
            ))}
          </div>
        ) : (
          <div className="empty">暂无分析内容</div>
        )}

        {result?.pattern?.hints?.length ? (
          <div className="tag-list">
            {result.pattern.hints.map((hint: string, idx: number) => (
              <span key={idx} className="tag">{hint}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Explore
