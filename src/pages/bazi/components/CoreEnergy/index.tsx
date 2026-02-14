import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const CoreEnergy: React.FC = () => {
  const { result } = useBaziStore()

  if (!result?.dayMaster) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">核心能量</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const { dayMaster, wuxing, yongShen } = result

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">核心能量</div>
        <div className="core-grid">
          <div className="core-block">
            <div className="core-title">日主</div>
            <div className={`core-value element-${dayMaster.element}`}>{dayMaster.stem}{dayMaster.element}</div>
            <div className="core-sub">{dayMaster.yinYang === 'yang' ? '阳干' : '阴干'} · {dayMaster.strength.level}</div>
            <div className="core-sub">月令：{dayMaster.season.status}</div>
          </div>
          <div className="core-block">
            <div className="core-title">喜忌参考</div>
            <div className="core-inline">
              <span className="core-sub">用神：{yongShen.use.join('、') || '--'}</span>
              <span className="core-sub">喜神：{yongShen.favor.join('、') || '--'}</span>
              <span className="core-sub">忌神：{yongShen.avoid.join('、') || '--'}</span>
            </div>
          </div>
        </div>

        <div className="energy-chart">
          {wuxing.elements.map((e: any) => (
            <div key={e.element} className="energy-row">
              <div className={`energy-label element-${e.element}`}>{e.element}</div>
              <div className="energy-bar">
                <div className="energy-bar-fill" style={{ width: `${e.percent}%` }} />
              </div>
              <div className="energy-percent">{e.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CoreEnergy
