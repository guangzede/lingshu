import React from 'react'
import { useBaziStore } from '@/store/bazi'
import type { Branch } from '@/types/liuyao'
import './index.scss'

const SEASON_MAP: Record<Branch, { season: string; climate: string; main: string; secondary: string; note: string }> = {
  '寅': { season: '春', climate: '木旺偏寒', main: '火', secondary: '土', note: '春木生发，先以温暖为要，火为主，土以培木。' },
  '卯': { season: '春', climate: '木旺偏寒', main: '火', secondary: '土', note: '春木生发，先以温暖为要，火为主，土以培木。' },
  '辰': { season: '春', climate: '木土交接', main: '火', secondary: '土', note: '春末土气渐显，仍以火温通，辅以土稳局。' },
  '巳': { season: '夏', climate: '火旺偏热', main: '水', secondary: '金', note: '夏火炎热，宜水调候，金以生水。' },
  '午': { season: '夏', climate: '火旺偏热', main: '水', secondary: '金', note: '夏火炎热，宜水调候，金以生水。' },
  '未': { season: '夏', climate: '火土偏燥', main: '水', secondary: '金', note: '夏末燥土，仍以水润，金助生水。' },
  '申': { season: '秋', climate: '金旺偏燥', main: '水', secondary: '木', note: '秋燥金强，宜水润燥，木以疏通。' },
  '酉': { season: '秋', climate: '金旺偏燥', main: '水', secondary: '木', note: '秋燥金强，宜水润燥，木以疏通。' },
  '戌': { season: '秋', climate: '金土偏燥', main: '水', secondary: '木', note: '秋末燥土，水润为先，木以行气。' },
  '亥': { season: '冬', climate: '水旺偏寒', main: '火', secondary: '土', note: '冬水寒冷，宜火温暖，土以护火。' },
  '子': { season: '冬', climate: '水旺偏寒', main: '火', secondary: '土', note: '冬水寒冷，宜火温暖，土以护火。' },
  '丑': { season: '冬', climate: '寒土湿重', main: '火', secondary: '土', note: '冬末寒湿，先以火温，土以固本。' }
}

const formatList = (list?: string[]) => (list && list.length ? list.join('、') : '--')

const TiaoHouYongShen: React.FC = () => {
  const { result } = useBaziStore()

  if (!result?.pillars) {
    return (
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="section-title">调候用神</div>
          <div className="empty">暂无排盘结果</div>
        </div>
      </section>
    )
  }

  const monthBranch = result.pillars.month.branch
  const dayStem = result.pillars.day.stem
  const dayElement = result.dayMaster?.element
  const mapping = SEASON_MAP[monthBranch]
  const yongShen = result.yongShen || { use: [], favor: [], avoid: [] }

  return (
    <section className="bazi-section">
      <div className="bazi-card tiao-card">
        <div className="section-title">调候用神</div>
        <div className="tiao-header">
          <div className="tiao-title">月令：{monthBranch} · {mapping?.season || '--'}季</div>
          <div className="tiao-chip">日主：{dayStem}{dayElement || ''}</div>
        </div>
        <div className="tiao-grid">
          <div className="tiao-block">
            <div className="tiao-label">气候</div>
            <div className="tiao-value">{mapping?.climate || '--'}</div>
          </div>
          <div className="tiao-block">
            <div className="tiao-label">调候主用</div>
            <div className={`tiao-value ${mapping?.main ? `element-${mapping.main}` : ''}`}>{mapping?.main || '--'}</div>
          </div>
          <div className="tiao-block">
            <div className="tiao-label">调候辅用</div>
            <div className={`tiao-value ${mapping?.secondary ? `element-${mapping.secondary}` : ''}`}>{mapping?.secondary || '--'}</div>
          </div>
          <div className="tiao-block">
            <div className="tiao-label">综合用神</div>
            <div className="tiao-value">{formatList(yongShen.use)}</div>
          </div>
        </div>
        <div className="tiao-desc">{mapping?.note || '调候以月令寒热燥湿为先，结合用神综合判断。'}</div>
        <div className="tiao-lines">
          <div className="tiao-line">
            <span className="tiao-key">喜神</span>
            <span className="tiao-val">{formatList(yongShen.favor)}</span>
          </div>
          <div className="tiao-line">
            <span className="tiao-key">忌神</span>
            <span className="tiao-val">{formatList(yongShen.avoid)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TiaoHouYongShen
