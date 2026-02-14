import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const ORDER: Array<'木' | '火' | '土' | '金' | '水'> = ['木', '火', '土', '金', '水']

function buildFlowSeq(maxElement: '木' | '火' | '土' | '金' | '水') {
  const startIndex = ORDER.indexOf(maxElement)
  return [...ORDER.slice(startIndex), ...ORDER.slice(0, startIndex)]
}

const EnergyFlowDirection: React.FC = () => {
  const { result } = useBaziStore()

  if (!result?.wuxing) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">五行能量流转</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const { elements, maxElement } = result.wuxing
  const max = elements?.[0]
  const min = elements?.[elements.length - 1]
  const isGreedy = max?.percent >= 35 && (max?.percent - (min?.percent || 0) >= 15)
  const seq = buildFlowSeq(maxElement)

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-title">五行能量流转</div>
        <div className="flow-card">
          <div className="flow-top">
            <div className={`flow-mode ${isGreedy ? 'is-strong' : ''}`}>{isGreedy ? '贪生忘克' : '生克并行'}</div>
            <div className="flow-main">
              <span className={`flow-main-element element-${maxElement}`}>{maxElement}</span>
              <span className="flow-main-percent">{max?.percent ?? '--'}%</span>
            </div>
          </div>
          <div className="flow-track">
            {seq.map((el, idx) => (
              <React.Fragment key={`${el}-${idx}`}>
                <div className={`flow-node element-${el} ${el === maxElement ? 'active' : ''}`}>{el}</div>
                {idx < seq.length - 1 && <span className="flow-arrow">→</span>}
              </React.Fragment>
            ))}
            <span className="flow-loop">⟲</span>
          </div>
          <div className="flow-note">
            {isGreedy
              ? '主气过旺，偏向相生循环，克制力量被弱化。'
              : '五行分布较均衡，生克关系相对完整。'}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EnergyFlowDirection
