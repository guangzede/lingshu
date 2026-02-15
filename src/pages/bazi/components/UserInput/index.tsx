import React from 'react'
import { PickerView, PickerViewColumn } from '@tarojs/components'
import { Lunar, LunarMonth, LunarYear, Solar } from 'lunar-javascript'
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
    const monthText = lunar.getMonthInChinese()
    const prefix = isLeap && !monthText.startsWith('闰') ? '闰' : ''
    return `${prefix}${monthText}月`
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
  const [dateModalOpen, setDateModalOpen] = React.useState(false)
  const {
    birth,
    calendar,
    lunarLeap,
    gender,
    manualMode,
    manualPillars,
    manualStartAge,
    manualStartYear,
    setBirth,
    setCalendar,
    setTimeMode,
    setLunarLeap,
    setGender,
    setManualMode,
    setManualPillar,
    setManualStartAge,
    setManualStartYear,
    caseName,
    caseNote,
    setCaseName,
    setCaseNote,
    compute,
    setActiveTab,
    autoSave,
    setAutoSave
  } = useBaziStore()

  const [pickerValue, setPickerValue] = React.useState<[number, number, number, number, number]>([0, 0, 0, 0, 0])
  const PICKER_ROW = 40

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

  const getDays = React.useCallback(() => {
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
  }, [birth.year, birth.month, calendar, lunarLeap])

  const daysDynamic = React.useMemo(() => {
    const count = getDays()
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [getDays])

  const monthOptions = React.useMemo(() => {
    if (calendar !== 'lunar') {
      return months.map((m) => ({ key: `${m}`, value: m, label: pad2(m), isLeap: false }))
    }
    return months.flatMap((m) => {
      const options = [
        {
          key: `${m}`,
          value: m,
          label: getLunarMonthLabel(birth.year, m, false),
          isLeap: false
        }
      ]
      if (leapMonth === m) {
        options.push({
          key: `${m}L`,
          value: m,
          label: getLunarMonthLabel(birth.year, m, true),
          isLeap: true
        })
      }
      return options
    })
  }, [calendar, birth.year, leapMonth])

  const dayOptions = React.useMemo(() => {
    return daysDynamic.map((d) => ({
      key: `${d}`,
      value: d,
      label: calendar === 'lunar'
        ? getLunarDayLabel(birth.year, birth.month, d, lunarLeap)
        : pad2(d)
    }))
  }, [daysDynamic, calendar, birth.year, birth.month, lunarLeap])

  React.useEffect(() => {
    if (!dateModalOpen) return
    const yearIndex = years.indexOf(birth.year)
    const monthIndex = monthOptions.findIndex((m) => m.value === birth.month && Boolean(m.isLeap) === lunarLeap)
    const dayIndex = dayOptions.findIndex((d) => d.value === birth.day)
    const hourIndex = hours.indexOf(birth.hour)
    const minuteIndex = minutes.indexOf(birth.minute)
    const clampedDayIndex = Math.max(0, Math.min(dayOptions.length - 1, dayIndex))
    if (dayIndex !== clampedDayIndex) {
      const nextDay = dayOptions[clampedDayIndex]
      if (nextDay) setBirth({ day: nextDay.value })
    }
    const nextPicker: [number, number, number, number, number] = [
      Math.max(0, yearIndex),
      Math.max(0, monthIndex),
      Math.max(0, clampedDayIndex),
      Math.max(0, hourIndex),
      Math.max(0, minuteIndex)
    ]
    const same = nextPicker.every((v, i) => v === pickerValue[i])
    if (!same) setPickerValue(nextPicker)
  }, [dateModalOpen, birth.year, birth.month, birth.day, birth.hour, birth.minute, lunarLeap, monthOptions, dayOptions, setBirth, pickerValue])

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

  const birthDisplay = `${birth.year}-${pad2(birth.month)}-${pad2(birth.day)} ${pad2(birth.hour)}:${pad2(birth.minute)}`
  const lunarDisplay = React.useMemo(() => {
    try {
      const lunarMonth = lunarLeap ? -birth.month : birth.month
      const lunar = Lunar.fromYmdHms(birth.year, lunarMonth, birth.day, birth.hour, birth.minute, 0)
      const monthLabel = `${lunarLeap ? '闰' : ''}${lunar.getMonthInChinese()}月`
      const dayLabel = lunar.getDayInChinese()
      return `农历 ${lunar.getYearInChinese()}年${monthLabel}${dayLabel} ${pad2(birth.hour)}:${pad2(birth.minute)}`
    } catch (err) {
      return birthDisplay
    }
  }, [birth.year, birth.month, birth.day, birth.hour, birth.minute, lunarLeap, birthDisplay])
  const birthDisplayText = calendar === 'lunar' ? lunarDisplay : birthDisplay
  const manualDisplay = `四柱 ${manualPillars.year.stem}${manualPillars.year.branch} ${manualPillars.month.stem}${manualPillars.month.branch} ${manualPillars.day.stem}${manualPillars.day.branch} ${manualPillars.hour.stem}${manualPillars.hour.branch}`

  return (
    <section className="bazi-section">
      <div className="bazi-card bazi-input-card">
        <div className="bazi-input-header">
          <div className="bazi-title">问真排盘</div>
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

          <div className="bazi-row bazi-row-dual bazi-row-dual-compact">
            <div className="bazi-dual-group">
              <div className="bazi-dual-group-inner">
                <div className="bazi-dual-content">
                  <button className={`bazi-pill ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>男</button>
                  <button className={`bazi-pill ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>女</button>
                </div>
                <div className="bazi-dual-content">
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
            </div>
          </div>

          <div className="bazi-row bazi-row-clickable" onClick={() => setDateModalOpen(true)}>
            <div className="bazi-row-label">出生时间</div>
            <div className="bazi-row-content">
              <div className="bazi-row-value">{manualMode ? manualDisplay : birthDisplayText}</div>
              <div className="bazi-row-arrow">›</div>
            </div>
          </div>

          <div className="bazi-row bazi-row-save">
            <div className="bazi-row-label">保存</div>
            <div className="bazi-row-content">
              <label className={`bazi-switch ${autoSave ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span className="bazi-switch-track" />
                <span className="bazi-switch-thumb" />
              </label>
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
              } catch (err) {
                // compute errors handled by store toast
              }
            }}
          >
            开始排盘
          </button>
        </div>
      </div>

      {!manualMode && (
        <div className="bazi-card bazi-instant-card">
          <div className="instant-header">
            <div className="instant-spacer" />
            <button
              className="bazi-ghost-btn instant-btn instant-btn-quick"
              onClick={async () => {
                const nowDate = new Date()
                setManualMode(false)
                setCalendar('solar')
                setTimeMode('beijing')
                setBirth({
                  year: nowDate.getFullYear(),
                  month: nowDate.getMonth() + 1,
                  day: nowDate.getDate(),
                  hour: nowDate.getHours(),
                  minute: nowDate.getMinutes()
                })
                try {
                  await compute()
                  setActiveTab('result')
                } catch (err) {
                  // compute errors handled by store toast
                }
              }}
            >
              即时排盘
            </button>
          </div>
          <div className="instant-body">
            {(() => {
              const instantNow = new Date()
              const solar = Solar.fromDate(instantNow)
              const lunar = solar.getLunar()
              const eightChar = lunar.getEightChar()
              eightChar.setSect(2)
              const pillars = [
                { stem: eightChar.getYearGan() as Stem, branch: eightChar.getYearZhi() as Branch },
                { stem: eightChar.getMonthGan() as Stem, branch: eightChar.getMonthZhi() as Branch },
                { stem: eightChar.getDayGan() as Stem, branch: eightChar.getDayZhi() as Branch },
                { stem: eightChar.getTimeGan() as Stem, branch: eightChar.getTimeZhi() as Branch }
              ]
              return (
                <div className="instant-row">
                  <div className="instant-left">
                    <div className="instant-pillars">
                      {pillars.map((p, idx) => (
                        <div key={`instant-${idx}`} className="instant-pillar">
                          <span>{p.stem}</span>
                          <span>{p.branch}</span>
                        </div>
                      ))}
                    </div>
                    <div className="instant-meta">
                      <div className="instant-note">{`农历 ${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`}</div>
                      <div className="instant-note">{`公历 ${instantNow.getFullYear()}-${pad2(instantNow.getMonth() + 1)}-${pad2(instantNow.getDate())} ${pad2(instantNow.getHours())}:${pad2(instantNow.getMinutes())}`}</div>
                    </div>
                  </div>
                  <div className="instant-right">
                    <div className="instant-time">{`${pad2(instantNow.getHours())}:${pad2(instantNow.getMinutes())}`}</div>
                    <button
                      className="bazi-ghost-btn instant-btn"
                      onClick={async () => {
                        const nowDate = new Date()
                        setManualMode(false)
                        setCalendar('solar')
                        setTimeMode('beijing')
                        setBirth({
                          year: nowDate.getFullYear(),
                          month: nowDate.getMonth() + 1,
                          day: nowDate.getDate(),
                          hour: nowDate.getHours(),
                          minute: nowDate.getMinutes()
                        })
                        try {
                          await compute()
                          setActiveTab('result')
                        } catch (err) {
                          // compute errors handled by store toast
                        }
                      }}
                    >
                      即时排盘
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {dateModalOpen && (
        <div className="bazi-modal-mask" onClick={() => setDateModalOpen(false)}>
          <div className="bazi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bazi-modal-body">
              <div className="bazi-modal-tabs">
                <button
                  className={`bazi-modal-tab ${calendar === 'solar' && !manualMode ? 'active' : ''}`}
                  onClick={() => {
                    setManualMode(false)
                    setCalendar('solar')
                  }}
                >
                  公历
                </button>
                <button
                  className={`bazi-modal-tab ${calendar === 'lunar' && !manualMode ? 'active' : ''}`}
                  onClick={() => {
                    setManualMode(false)
                    setCalendar('lunar')
                  }}
                >
                  农历
                </button>
                <button
                  className={`bazi-modal-tab ${manualMode ? 'active' : ''}`}
                  onClick={() => {
                    setManualMode(true)
                  }}
                >
                  四柱
                </button>
              </div>
              {manualMode ? (
                <div className="bazi-modal-manual">
                  {renderPillarSelect('年柱', 'year')}
                  {renderPillarSelect('月柱', 'month')}
                  {renderPillarSelect('日柱', 'day')}
                  {renderPillarSelect('时柱', 'hour')}
                  <div className="inline-note">手动八字遵循“阳干配阳支、阴干配阴支”规则。</div>
                </div>
              ) : (
                <div className="bazi-modal-wheel">
                  <div className="bazi-wheel-labels">
                    <span>年</span>
                    <span>月</span>
                    <span>日</span>
                    <span>时</span>
                    <span>分</span>
                  </div>
                  <PickerView
                    className="bazi-picker"
                    itemHeight={PICKER_ROW}
                    value={pickerValue}
                    onChange={(e) => {
                      const [yIdx, mIdx, dIdx, hIdx, minIdx] = e.detail.value
                      setPickerValue([yIdx, mIdx, dIdx, hIdx, minIdx])
                      const y = years[Math.max(0, Math.min(years.length - 1, yIdx))]
                      const m = monthOptions[Math.max(0, Math.min(monthOptions.length - 1, mIdx))]
                      const d = dayOptions[Math.max(0, Math.min(dayOptions.length - 1, dIdx))]
                      const h = hours[Math.max(0, Math.min(hours.length - 1, hIdx))]
                      const mi = minutes[Math.max(0, Math.min(minutes.length - 1, minIdx))]
                      setBirth({
                        year: y,
                        month: m.value,
                        day: d.value,
                        hour: h,
                        minute: mi
                      })
                      setLunarLeap(Boolean(m.isLeap))
                    }}
                  >
                    <PickerViewColumn>
                      {years.map((y, idx) => (
                        <div key={y} className={`bazi-picker-item ${pickerValue[0] === idx ? 'active' : ''}`}>{y}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {monthOptions.map((m, idx) => (
                        <div key={m.key} className={`bazi-picker-item ${pickerValue[1] === idx ? 'active' : ''}`}>{m.label}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {dayOptions.map((d, idx) => (
                        <div key={d.key} className={`bazi-picker-item ${pickerValue[2] === idx ? 'active' : ''}`}>{d.label}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {hours.map((h, idx) => (
                        <div key={h} className={`bazi-picker-item ${pickerValue[3] === idx ? 'active' : ''}`}>{pad2(h)}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {minutes.map((m, idx) => (
                        <div key={m} className={`bazi-picker-item ${pickerValue[4] === idx ? 'active' : ''}`}>{pad2(m)}</div>
                      ))}
                    </PickerViewColumn>
                  </PickerView>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default UserInput
