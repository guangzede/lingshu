import React from 'react'
import { useDaliurenStore } from '@/store/daliuren'
import './index.scss'

const ResultPanel: React.FC = () => {
  const { result } = useDaliurenStore()

  if (!result) {
    return (
      <section className='daliuren-section daliuren-result-panel'>
        <div className='daliuren-card'>
          <div className='daliuren-empty'>暂无排盘结果，请先排盘。</div>
        </div>
      </section>
    )
  }

  const plates = result.plates || []
  const dayStem = result.ganzhi?.day?.stem || ''
  const hourBranch = result.ganzhi?.hour?.branch || ''
  const xunKong = result.xunKong || []
  const transmissionBranches = (result.threeTransmissions || []).map((t: any) => t.branch)
  const nobleBranches = result.shenSha?.['天乙贵人'] || []
  const lessons = result.fourLessons || []
  const transmissions = result.threeTransmissions || []
  const shenSha = result.shenSha || {}
  const keTi = result.keTi || []
  const relationTags = result.relationTags || []
  const warnings = result.warnings || []

  const relationMeaning: Record<string, string> = {
    '生': '上生下，主顺势相助，事有推进之力。',
    '克': '上克下，主制约牵制，成事多阻。',
    '受生': '下生上，主受助，贵人或资源扶持。',
    '受克': '下克上，主受制，易有压力与反复。',
    '比和': '同气比和，平稳相随，宜守不宜激。',
    '—': '关系平稳，可结合他象判断。'
  }

  const shenShaKeys = Object.keys(shenSha)
  const groups = [
    { title: '贵神', keys: ['天乙贵人'] },
    { title: '吉神', keys: ['文昌贵人', '将星', '华盖', '天医', '桃花', '咸池', '禄神', '驿马'] },
    { title: '煞神', keys: ['孤辰', '寡宿'] }
  ]
  const groupedKeys = new Set(groups.flatMap((g) => g.keys))
  const extraKeys = shenShaKeys.filter((k) => !groupedKeys.has(k))
  const shenShaGroups = [
    ...groups.map((g) => ({ ...g, keys: g.keys.filter((k) => shenShaKeys.includes(k)) })),
    { title: '其他', keys: extraKeys }
  ].filter((g) => g.keys.length > 0)

  const slotOrder = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4]
  const boardEarthOrder = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌']
  const orderedPlates = boardEarthOrder.map((earth) => plates.find((p: any) => p.earth === earth) || { earth, heaven: '—', general: '—' })
  const boardSlots = Array.from({ length: 16 }).map(() => null as any)
  orderedPlates.forEach((plate, idx) => {
    boardSlots[slotOrder[idx]] = plate
  })

  return (
    <section className='daliuren-section daliuren-result-panel'>
      <div className='daliuren-card daliuren-basic'>
        <div className='section-title'>起课信息</div>
        <div className='basic-grid'>
          <div>
            <div className='label'>公历</div>
            <div className='value'>{`${result.solar?.date || '--'} ${result.solar?.time || ''}`}</div>
          </div>
          <div>
            <div className='label'>农历</div>
            <div className='value'>{`农历 ${result.lunar?.year || ''}年${result.lunar?.month || ''}月${result.lunar?.day || ''}`}</div>
          </div>
          <div>
            <div className='label'>干支</div>
            <div className='value'>
              {`${result.ganzhi?.year?.stem || ''}${result.ganzhi?.year?.branch || ''} ` +
                `${result.ganzhi?.month?.stem || ''}${result.ganzhi?.month?.branch || ''} ` +
                `${result.ganzhi?.day?.stem || ''}${result.ganzhi?.day?.branch || ''} ` +
                `${result.ganzhi?.hour?.stem || ''}${result.ganzhi?.hour?.branch || ''}`}
            </div>
          </div>
          <div>
            <div className='label'>旬空</div>
            <div className='value'>{(result.xunKong || []).join('')}</div>
          </div>
        </div>
      </div>

      <div className='daliuren-card'>
        <div className='section-title'>天盘地盘</div>
        <div className='plate-board'>
          <div className='plate-grid'>
            {boardSlots.map((p: any, idx: number) => {
              if (!p) {
                return <div key={`slot-${idx}`} className='plate-slot' />
              }
              const isHour = p.earth === hourBranch
              const isNoble = nobleBranches.includes(p.earth)
              const isVoid = xunKong.includes(p.earth)
              const transmissionIndex = transmissionBranches.indexOf(p.earth)
              const transLabel = transmissionIndex >= 0 ? ['初', '中', '末'][transmissionIndex] : ''
              const hasBadges = isHour || isNoble || isVoid || Boolean(transLabel)
              return (
                <div key={`slot-${idx}`} className='plate-slot'>
                  <div
                    className={[
                      'plate-node',
                      hasBadges ? 'has-badges' : '',
                      isHour ? 'is-hour' : '',
                      isNoble ? 'is-noble' : '',
                      isVoid ? 'is-void' : '',
                      transLabel ? 'is-trans' : ''
                    ].filter(Boolean).join(' ')}
                  >
                    <div className='plate-badges'>
                      {isHour && <span className='plate-badge hour'>时</span>}
                      {isNoble && <span className='plate-badge noble'>贵</span>}
                      {isVoid && <span className='plate-badge void'>空</span>}
                      {transLabel && <span className='plate-badge trans'>{transLabel}</span>}
                    </div>
                    <div className='plate-earth'>{p.earth}</div>
                    <div className='plate-heaven'>{p.heaven}</div>
                    <div className='plate-general'>{p.general}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className='plate-center'>
            <div className='plate-center-title'>天盘地盘</div>
            <div className='plate-center-meta'>
              <span>日干 {dayStem || '--'}</span>
              <span>时支 {hourBranch || '--'}</span>
            </div>
            <div className='plate-center-hint'>上为天盘，下为地盘与天将</div>
          </div>
        </div>
      </div>

      <div className='daliuren-card'>
        <div className='section-title'>四课</div>
        <div className='lesson-grid'>
          {lessons.map((l: any) => {
            const upperEl = l.upperElement || ''
            const lowerEl = l.lowerElement || ''
            const relationText = relationMeaning[l.relation] || relationMeaning['—']
            return (
              <div key={l.label} className='lesson-item'>
                <div className='lesson-head'>
                  <div className='lesson-label'>{l.label}</div>
                  <span className='lesson-tag'>{l.relation || '—'}</span>
                </div>
                <div className='lesson-main'>
                  <div className='lesson-side'>
                    <div className='lesson-title'>上神</div>
                    <div className={`lesson-value ${upperEl ? `element-${upperEl}` : ''}`}>{l.upper?.value || '—'}</div>
                    <div className='lesson-sub'>{upperEl}</div>
                  </div>
                  <span className='lesson-arrow'>→</span>
                  <div className='lesson-side'>
                    <div className='lesson-title'>下神</div>
                    <div className={`lesson-value ${lowerEl ? `element-${lowerEl}` : ''}`}>{l.lower?.value || '—'}</div>
                    <div className='lesson-sub'>{lowerEl}</div>
                  </div>
                </div>
                <div className='lesson-extra'>
                  <div className='lesson-extra-item'>
                    <span>上神本位</span>
                    <strong>{l.upperHome || '—'}</strong>
                  </div>
                  <div className='lesson-extra-item'>
                    <span>上将</span>
                    <strong>{l.upperGeneral || '—'}</strong>
                  </div>
                  <div className='lesson-extra-item'>
                    <span>下将</span>
                    <strong>{l.lowerGeneral || '—'}</strong>
                  </div>
                </div>
                <div className='lesson-meta'>
                  <span>{upperEl}</span>
                  <span className='lesson-dot'>·</span>
                  <span>{l.relation || '—'}</span>
                  <span className='lesson-dot'>·</span>
                  <span>{lowerEl}</span>
                </div>
                <div className='lesson-meaning'>{relationText}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='daliuren-card'>
        <div className='section-title'>三传</div>
        <div className='transmission-grid'>
          {transmissions.map((t: any) => (
            <div key={t.label} className='transmission-item'>
              <div className='transmission-label'>{t.label}</div>
              <div className='transmission-branch'>{t.branch}</div>
              <div className='transmission-meta'>{`${t.general || ''} · ${t.element || ''} · ${t.relation || ''}`}</div>
            </div>
          ))}
        </div>
      </div>

      <div className='daliuren-card'>
        <div className='section-title'>课体与神煞</div>
        <div className='dlr-section-block'>
          <div className='dlr-subtitle'>课体判式</div>
          <div className='tag-row'>
            {(keTi.length ? keTi : ['平课']).map((tag: string) => (
              <span key={tag} className='tag'>{tag}</span>
            ))}
          </div>
          <div className='dlr-hint-list'>
            {(result.summary?.hints || []).length ? (
              (result.summary?.hints || []).map((item: string) => (
                <div key={item} className='dlr-hint-item'>{item}</div>
              ))
            ) : (
              <div className='dlr-hint-item muted'>课体平稳，暂无明显反吟、伏吟等特征。</div>
            )}
          </div>
        </div>

        <div className='dlr-section-block'>
          <div className='dlr-subtitle'>关系格局</div>
          <div className='tag-row'>
            {relationTags.length ? relationTags.map((tag: string) => (
              <span key={tag} className='tag subtle'>{tag}</span>
            )) : <span className='tag subtle'>关系平稳</span>}
          </div>
        </div>

        <div className='dlr-section-block'>
          <div className='dlr-subtitle'>神煞速查</div>
          <div className='dlr-shen-sha-groups'>
            {shenShaGroups.map((group) => (
              <div key={group.title} className='dlr-shen-sha-group'>
                <div className='dlr-group-title'>{group.title}</div>
                <div className='dlr-shen-sha-grid'>
                  {group.keys.map((key) => (
                    <div key={key} className='dlr-shen-sha-item'>
                      <span className='dlr-shen-sha-name'>{key}</span>
                      <strong className='dlr-shen-sha-value'>{(shenSha[key] || []).join('') || '--'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='daliuren-card'>
        <div className='section-title'>断语摘要</div>
        <div className='summary-text'>{result.summary?.main || '—'}</div>
        <ul className='summary-list'>
          {(result.summary?.hints || []).map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {warnings.length > 0 && (
        <div className='daliuren-card warning-card'>
          <div className='section-title'>规则提示</div>
          <ul className='summary-list'>
            {warnings.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ResultPanel
