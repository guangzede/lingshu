import React from 'react'
import Taro from '@tarojs/taro'
import { Lunar, LunarMonth, LunarYear } from 'lunar-javascript'
import { useBaziStore } from '@/store/bazi'
import type { Branch, Stem } from '@/types/liuyao'
import './index.scss'

const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const YANG_STEMS: Stem[] = ['甲', '丙', '戊', '庚', '壬']
const YANG_BRANCHES: Branch[] = ['子', '寅', '辰', '午', '申', '戌']
const YIN_BRANCHES: Branch[] = ['丑', '卯', '巳', '未', '酉', '亥']

const now = new Date()
const currentYear = now.getFullYear()
const years = Array.from({ length: 121 }, (_, i) => currentYear - 80 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const pad2 = (n: number) => n.toString().padStart(2, '0')
const getLunarMonthLabel = (year: number, month: number, isLeap: boolean) => {
  try {
    const lunarMonth = isLeap ? -month : month
    const lunar = Lunar.fromYmdHms(year, lunarMonth, 1, 0, 0, 0)
    return `${isLeap ? '闰' : ''}${lunar.getMonthInChinese()}月`
  } catch (err) {
    return `${month}月`
  }
}

const getLunarDayLabel = (year: number, month: number, day: number, isLeap: boolean) => {
  try {
    const lunarMonth = isLeap ? -month : month
    const lunar = Lunar.fromYmdHms(year, lunarMonth, day, 0, 0, 0)
    return lunar.getDayInChinese()
  } catch (err) {
    return `${day}`
  }
}

const UserInput: React.FC = () => {
  const {
    birth,
    calendar,
    timeMode,
    lunarLeap,
    gender,
    manualMode,
    directionRule,
    manualPillars,
    manualStartAge,
    manualStartYear,
    setBirth,
    setCalendar,
    setTimeMode,
    setLunarLeap,
    setGender,
    setManualMode,
    setDirectionRule,
    setManualPillar,
    setManualStartAge,
    setManualStartYear,
    caseName,
    caseNote,
    setCaseName,
    setCaseNote,
    compute,
    saveCurrentCase,
    currentCaseId,
    setActiveTab
  } = useBaziStore()

  const leapMonth = calendar === 'lunar' ? LunarYear.fromYear(birth.year).getLeapMonth() : 0

  React.useEffect(() => {
    if (calendar !== 'lunar') return
    if (!leapMonth) {
      if (lunarLeap) setLunarLeap(false)
      return
    }
    if (lunarLeap && birth.month !== leapMonth) {
      if (lunarLeap) setLunarLeap(false)
    }
  }, [calendar, birth.year, birth.month, leapMonth, lunarLeap, setLunarLeap])

  const getDays = () => {
    const y = birth.year
    const m = birth.month
    if (calendar === 'lunar') {
      try {
        const lunarMonth = lunarLeap ? -m : m
        return LunarMonth.fromYm(y, lunarMonth).getDayCount()
      } catch (err) {
        return 30
      }
    }
    return new Date(y, m, 0).getDate()
  }

  const daysDynamic = Array.from({ length: getDays() }, (_, i) => i + 1)

  const renderPillarSelect = (label: string, key: keyof typeof manualPillars) => {
    const p = manualPillars[key]
    const allowedBranches = YANG_STEMS.includes(p.stem) ? YANG_BRANCHES : YIN_BRANCHES
    return (
      <div className="bazi-pillar-input" key={label}>
        <div className="bazi-pillar-label">{label}</div>
        <div className="bazi-pillar-controls">
          <select
            value={p.stem}
            onChange={(e) => {
              const nextStem = e.target.value as Stem
              const nextBranches = YANG_STEMS.includes(nextStem) ? YANG_BRANCHES : YIN_BRANCHES
              const nextBranch = nextBranches.includes(p.branch) ? p.branch : nextBranches[0]
              setManualPillar(key, { stem: nextStem, branch: nextBranch })
            }}
          >
            {STEMS.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select
            value={allowedBranches.includes(p.branch) ? p.branch : allowedBranches[0]}
            onChange={(e) => setManualPillar(key, { ...p, branch: e.target.value as Branch })}
          >
            {allowedBranches.map((b) => (<option key={b} value={b}>{b}</option>))}
          </select>
        </div>
      </div>
    )
  }

  React.useEffect(() => {
    if (!manualMode) return
    (['year', 'month', 'day', 'hour'] as Array<keyof typeof manualPillars>).forEach((key) => {
      const p = manualPillars[key]
      const allowed = YANG_STEMS.includes(p.stem) ? YANG_BRANCHES : YIN_BRANCHES
      if (!allowed.includes(p.branch)) {
        setManualPillar(key, { ...p, branch: allowed[0] })
      }
    })
  }, [manualMode, manualPillars, setManualPillar])

  return (
    <section className="bazi-section">
      <div className="bazi-card bazi-input-card">
        <div className="bazi-input-header">
          <div className="bazi-title">灵枢 八字</div>
          <div className="bazi-subtitle">选择历法与出生信息，生成八字排盘</div>
        </div>

        <div className="bazi-input-form">
          <div className="bazi-row">
            <div className="bazi-row-label">姓名</div>
            <div className="bazi-row-content">
              <input
                className="bazi-text-input"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="可选"
              />
            </div>
          </div>

          <div className="bazi-row">
            <div className="bazi-row-label">备注</div>
            <div className="bazi-row-content">
              <input
                className="bazi-text-input"
                value={caseNote}
                onChange={(e) => setCaseNote(e.target.value)}
                placeholder="可选"
              />
            </div>
          </div>

          <div className="bazi-row">
            <div className="bazi-row-label">性别</div>
            <div className="bazi-row-content">
              <button className={`bazi-pill ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>男</button>
              <button className={`bazi-pill ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>女</button>
            </div>
          </div>

          <div className="bazi-row">
            <div className="bazi-row-label">历法</div>
            <div className="bazi-row-content">
              <button
                className={`bazi-pill ${!manualMode && calendar === 'solar' ? 'active' : ''}`}
                onClick={() => { setManualMode(false); setCalendar('solar') }}
              >
                公历
              </button>
              <button
                className={`bazi-pill ${!manualMode && calendar === 'lunar' ? 'active' : ''}`}
                onClick={() => { setManualMode(false); setCalendar('lunar') }}
              >
                农历
              </button>
              <button
                className={`bazi-pill ${manualMode ? 'active' : ''}`}
                onClick={() => setManualMode(true)}
              >
                四柱
              </button>
            </div>
          </div>

          {!manualMode ? (
            <div className="bazi-row">
              <div className="bazi-row-label">出生时间</div>
              <div className="bazi-row-content bazi-date-row">
                <div className="bazi-input-col">
                  <label>年</label>
                  <select value={birth.year} onChange={(e) => setBirth({ year: Number(e.target.value) })}>
                    {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
                <div className="bazi-input-col">
                  <label>月</label>
                  {calendar === 'lunar' ? (
                    <select
                      value={`${birth.month}${lunarLeap ? 'L' : ''}`}
                      onChange={(e) => {
                        const raw = e.target.value
                        const isLeap = raw.endsWith('L')
                        const monthValue = Number(raw.replace('L', ''))
                        setBirth({ month: monthValue })
                        setLunarLeap(isLeap)
                      }}
                    >
                      {months.flatMap((m) => {
                        const options = [
                          {
                            key: `${m}`,
                            value: `${m}`,
                            label: getLunarMonthLabel(birth.year, m, false)
                          }
                        ]
                        if (leapMonth === m) {
                          options.push({
                            key: `${m}L`,
                            value: `${m}L`,
                            label: getLunarMonthLabel(birth.year, m, true)
                          })
                        }
                        return options.map((opt) => (
                          <option key={opt.key} value={opt.value}>{opt.label}</option>
                        ))
                      })}
                    </select>
                  ) : (
                    <select value={birth.month} onChange={(e) => setBirth({ month: Number(e.target.value) })}>
                      {months.map((m) => (
                        <option key={m} value={m}>{pad2(m)}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="bazi-input-col">
                  <label>日</label>
                  <select value={birth.day} onChange={(e) => setBirth({ day: Number(e.target.value) })}>
                    {daysDynamic.map((d) => (
                      <option key={d} value={d}>
                        {calendar === 'lunar'
                          ? getLunarDayLabel(birth.year, birth.month, d, lunarLeap)
                          : `${pad2(d)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bazi-input-col">
                  <label>时</label>
                  <select value={birth.hour} onChange={(e) => setBirth({ hour: Number(e.target.value) })}>
                    {hours.map((h) => (<option key={h} value={h}>{pad2(h)}</option>))}
                  </select>
                </div>
                <div className="bazi-input-col">
                  <label>分</label>
                  <select value={birth.minute} onChange={(e) => setBirth({ minute: Number(e.target.value) })}>
                    {minutes.map((m) => (<option key={m} value={m}>{pad2(m)}</option>))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="bazi-manual-grid">
              {renderPillarSelect('年柱', 'year')}
              {renderPillarSelect('月柱', 'month')}
              {renderPillarSelect('日柱', 'day')}
              {renderPillarSelect('时柱', 'hour')}
              <div className="inline-note">手动八字遵循“阳干配阳支、阴干配阴支”规则。</div>
              <div className="bazi-advance">
                <div>
                  <label>起运年龄</label>
                  <input
                    type="number"
                    value={manualStartAge ?? ''}
                    onChange={(e) => setManualStartAge(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="可选"
                  />
                </div>
                <div>
                  <label>起运年份</label>
                  <input
                    type="number"
                    value={manualStartYear ?? ''}
                    onChange={(e) => setManualStartYear(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="可选"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bazi-row">
            <div className="bazi-row-label">时间制</div>
            <div className="bazi-row-content">
              <button className={`bazi-pill ${timeMode === 'beijing' ? 'active' : ''}`} onClick={() => setTimeMode('beijing')}>北京时间</button>
              <button className={`bazi-pill ${timeMode === 'trueSolar' ? 'active' : ''}`} onClick={() => setTimeMode('trueSolar')}>真太阳时</button>
            </div>
          </div>

          <div className="bazi-row">
            <div className="bazi-row-label">顺逆</div>
            <div className="bazi-row-content">
              <button className={`bazi-pill ${directionRule === 'year' ? 'active' : ''}`} onClick={() => setDirectionRule('year')}>年干顺逆</button>
              <button className={`bazi-pill ${directionRule === 'day' ? 'active' : ''}`} onClick={() => setDirectionRule('day')}>日干顺逆</button>
            </div>
          </div>
        </div>

        <div className="bazi-action-row">
          <button
            className="bazi-primary-btn"
            onClick={async () => {
              try {
                const computed = await compute()
                setActiveTab('result')
                if (computed) {
                  const modal = await Taro.showModal({
                    title: '保存记录',
                    content: currentCaseId ? '是否更新当前记录？' : '是否保存本次排盘记录？',
                    confirmText: currentCaseId ? '更新' : '保存',
                    cancelText: '暂不保存'
                  })
                  if (modal.confirm) {
                    await saveCurrentCase('保存中...')
                  }
                }
              } catch (err) {
                // compute errors handled by store toast
              }
            }}
          >
            开始排盘
          </button>
        </div>
      </div>
    </section>
  )
}

export default UserInput
