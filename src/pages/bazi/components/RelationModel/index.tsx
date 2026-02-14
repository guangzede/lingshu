import React from 'react'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const RelationModel: React.FC = () => {
  const { result, viewMode } = useBaziStore()
  const [open, setOpen] = React.useState(false)

  if (!result?.tenGods) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">十神与格局</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const order = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印']
  const weights = result.tenGods.weights || {}
  const entries = order.map((key) => [key, weights[key] ?? 0] as [string, number])
  const maxVal = Math.max(1, ...entries.map(([, v]) => Number(v)))
  const mid = Math.ceil(entries.length / 2)
  const leftEntries = entries.slice(0, mid)
  const rightEntries = entries.slice(mid)

  return (
    <section className="bazi-section">
      <div className="bazi-card">
        <div className="section-head" onClick={() => setOpen(!open)}>
          <div className="section-title">十神系统与格局参考</div>
          <button className={`section-toggle ${open ? 'open' : ''}`}>
            {open ? '收起' : '展开'}
          </button>
        </div>

        {!open ? (
          <div className="inline-note">内容已折叠，点击展开查看详情。</div>
        ) : (
          <>
            <div className="tag-list">
              {result.tenGods.top?.length ? result.tenGods.top.map((t: string) => (
                <span key={t} className="tag">{t}较旺</span>
              )) : <span className="tag">十神均衡</span>}
            </div>

            {viewMode === 'pro' && (
              <div className="ten-god-split">
                <div className="ten-god-col">
                  {leftEntries.map(([key, val]) => (
                    <div key={key} className="ten-god-bar-row">
                      <span className="ten-god-label">{key}</span>
                      <div className="ten-god-bar">
                        <div
                          className="ten-god-bar-fill"
                          style={{ width: `${Math.min(100, (Number(val) / maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="ten-god-col">
                  {rightEntries.map(([key, val]) => (
                    <div key={key} className="ten-god-bar-row">
                      <span className="ten-god-label">{key}</span>
                      <div className="ten-god-bar">
                        <div
                          className="ten-god-bar-fill"
                          style={{ width: `${Math.min(100, (Number(val) / maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default RelationModel
