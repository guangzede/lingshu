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
import HePan from '../HePan'
import Explore from '../Explore'
import ContactAuthor from '../ContactAuthor'
import AiAnalysis from '../AiAnalysis'
import { TEN_GOD_SHORT } from '../../utils'

const ResultPanel: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    result,
    selectedDaYunIndex,
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

  const currentYear = new Date().getFullYear()
  const dayunList = result?.luck?.daYun || []
  const dayunIndex = Math.min(Math.max(selectedDaYunIndex, 0), Math.max(0, dayunList.length - 1))
  const currentDayun = dayunList[dayunIndex]
  const currentLiuNian = currentDayun?.liuNian?.find((ln: any) => ln.year === currentYear) || currentDayun?.liuNian?.[0]

  const formatGZ = (stem?: string, branch?: string) => (stem && branch ? `${stem}${branch}` : '--')
  const formatTenGod = (ten?: string) => (ten ? (TEN_GOD_SHORT[ten] || ten) : '--')

  const dayMaster = result?.dayMaster
  const yongShen = result?.yongShen
  const mainElement = result?.wuxing?.maxElement
  const mainPercent = result?.wuxing?.elements?.[0]?.percent

  return (
    <>
      <section className='bazi-section'>
        <div className='bazi-card result-hero'>
          <div className='result-hero-main'>
            <div className='bazi-title'>排盘结果</div>
            <div className='bazi-subtitle'>普通盘/详细盘切换，随时查看不同层级内容</div>
            <div className='result-meta'>
              <div>公历：{solarText}</div>
              <div>农历：{lunarText}</div>
              <div>输入方式：{calendar === 'solar' ? '公历' : '农历'} · {timeMode === 'trueSolar' ? '真太阳时' : '北京时间'}</div>
            </div>
          </div>
          <div className='result-hero-actions'>
            <div className='bazi-switch-row'>
              <button className={`bazi-pill ${viewMode === 'basic' ? 'active' : ''}`} onClick={() => setViewMode('basic')}>普通盘</button>
              <button className={`bazi-pill ${viewMode === 'pro' ? 'active' : ''}`} onClick={() => setViewMode('pro')}>详细盘</button>
              <button className='bazi-pill' onClick={() => setActiveTab('history')}>查看记录</button>
            </div>
          </div>
          {!result && <div className='inline-note'>当前暂无排盘结果，请先在排盘页生成。</div>}
        </div>
      </section>

      <section className='bazi-section'>
        <div className='bazi-card summary-card'>
          <div className='summary-header'>
            <div className='section-title'>命局摘要</div>
            <div className='summary-sub'>核心结论 · 当前运势 · 用神偏好</div>
          </div>
          <div className='summary-grid'>
            <div className='summary-item'>
              <div className='summary-label'>日主</div>
              <div className={`summary-value element-${dayMaster?.element || ''}`}>{dayMaster ? `${dayMaster.stem}${dayMaster.element}` : '--'}</div>
              <div className='summary-desc'>{dayMaster ? `${dayMaster.yinYang === 'yang' ? '阳' : '阴'}干 · ${dayMaster.strength.level}` : '--'}</div>
            </div>
            <div className='summary-item'>
              <div className='summary-label'>主气</div>
              <div className={`summary-value element-${mainElement || ''}`}>{mainElement || '--'}</div>
              <div className='summary-desc'>{mainPercent !== undefined ? `${Math.round(mainPercent)}%` : '--'}</div>
            </div>
            <div className='summary-item'>
              <div className='summary-label'>当前大运</div>
              <div className='summary-value'>{formatGZ(currentDayun?.stem, currentDayun?.branch)}</div>
              <div className='summary-desc'>{formatTenGod(currentDayun?.tenGod)}</div>
            </div>
            <div className='summary-item'>
              <div className='summary-label'>当前流年</div>
              <div className='summary-value'>{currentLiuNian?.ganZhi || '--'}</div>
              <div className='summary-desc'>{formatTenGod(currentLiuNian?.tenGod)}</div>
            </div>
          </div>

          <div className='summary-tags'>
            <div className='summary-tag'>
              <span>用神</span>
              <div>{yongShen?.use?.join('、') || '--'}</div>
            </div>
            <div className='summary-tag'>
              <span>喜神</span>
              <div>{yongShen?.favor?.join('、') || '--'}</div>
            </div>
            <div className='summary-tag'>
              <span>忌神</span>
              <div>{yongShen?.avoid?.join('、') || '--'}</div>
            </div>
          </div>
        </div>
      </section>

      <FourPillars />
      <HePan />
      <CoreEnergy />
      <TiaoHouYongShen />
      <EnergyFlowDirection />
      <EnergyFlow />
      <RelationModel />
      <LuckTrack />
      <AiAnalysis />
      <Explore />
      <section className='bazi-section'>
        <div className='bazi-card note-card'>
          <div className='section-title'>命理笔记</div>
          <textarea
            className='note-textarea'
            value={caseNote}
            onChange={(e) => setCaseNote(e.target.value)}
            placeholder='记录你的解盘要点、验证反馈、后续跟进...'
          />
          <div className='bazi-action-row'>
            <button className='bazi-primary-btn' onClick={() => saveCurrentCase('保存中...')}>
              保存笔记
            </button>
            <button className='bazi-ghost-btn' onClick={() => setActiveTab('history')}>
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
