import React from 'react'
import { Lunar, Solar } from 'lunar-javascript'
import { useBaziStore } from '@/store/bazi'
import FourPillars from '../FourPillars'
import CoreEnergy from '../CoreEnergy'
import EnergyFlowDirection from '../EnergyFlowDirection'
import EnergyFlow from '../EnergyFlow'
import RelationModel from '../RelationModel'
import LuckTrack from '../LuckTrack'
import TiaoHouYongShen from '../TiaoHouYongShen'
import Explore from '../Explore'
import ContactAuthor from '../ContactAuthor'
import AiAnalysis from '../AiAnalysis'

const ResultPanel: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    result,
    birth,
    calendar,
    timeMode,
    lunarLeap,
    caseNote,
    setCaseNote,
    saveCurrentCase,
    setActiveTab
  } = useBaziStore()

  const pad2 = (n: number) => String(n).padStart(2, '0')

  const buildSolar = () => {
    if (calendar === 'solar') {
      return Solar.fromYmdHms(birth.year, birth.month, birth.day, birth.hour, birth.minute, 0)
    }
    const lunarMonth = lunarLeap ? -birth.month : birth.month
    return Lunar.fromYmdHms(birth.year, lunarMonth, birth.day, birth.hour, birth.minute, 0).getSolar()
  }

  const solar = buildSolar()
  const lunar = solar.getLunar()
  const lunarIsLeap = typeof (lunar as any).isLeap === 'function' ? (lunar as any).isLeap() : false

  const solarText = `${solar.getYear()}年${pad2(solar.getMonth())}月${pad2(solar.getDay())}日 ${pad2(solar.getHour())}:${pad2(solar.getMinute())}`
  const lunarText = `${lunarIsLeap ? '闰' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`

  return (
    <>
      <section className="bazi-section">
        <div className="bazi-card">
          <div className="bazi-header">
            <div>
              <div className="bazi-title">排盘结果</div>
              <div className="bazi-subtitle">普通盘/详细盘切换，随时查看不同层级内容</div>
            </div>
          </div>
          <div className="bazi-result-summary">
            <div>公历：{solarText}</div>
            <div>农历：{lunarText}</div>
            <div>输入方式：{calendar === 'solar' ? '公历' : '农历'} · {timeMode === 'trueSolar' ? '真太阳时' : '北京时间'}</div>
          </div>
          <div className="bazi-switch-row">
            <button className={`bazi-pill ${viewMode === 'basic' ? 'active' : ''}`} onClick={() => setViewMode('basic')}>普通盘</button>
            <button className={`bazi-pill ${viewMode === 'pro' ? 'active' : ''}`} onClick={() => setViewMode('pro')}>详细盘</button>
            <button className="bazi-pill" onClick={() => setActiveTab('history')}>查看记录</button>
          </div>
          {!result && <div className="inline-note">当前暂无排盘结果，请先在排盘页生成。</div>}
        </div>
      </section>

      <FourPillars />
      <div className="bazi-grid">
        <CoreEnergy />
        <TiaoHouYongShen />
      </div>
      <div className="bazi-grid">
        <EnergyFlowDirection />
        <EnergyFlow />
      </div>
      <div className="bazi-grid">
        <RelationModel />
        <LuckTrack />
      </div>
      <AiAnalysis />
      <Explore />
      <section className="bazi-section">
        <div className="bazi-card note-card">
          <div className="section-title">命理笔记</div>
          <textarea
            className="note-textarea"
            value={caseNote}
            onChange={(e) => setCaseNote(e.target.value)}
            placeholder="记录你的解盘要点、验证反馈、后续跟进..."
          />
          <div className="bazi-action-row">
            <button className="bazi-primary-btn" onClick={() => saveCurrentCase('保存中...')}>
              保存笔记
            </button>
            <button className="bazi-ghost-btn" onClick={() => setActiveTab('history')}>
              查看记录
            </button>
          </div>
        </div>
      </section>

      <ContactAuthor />
    </>
  )
}

export default ResultPanel
