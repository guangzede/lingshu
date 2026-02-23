import React from 'react'
import { PickerView, PickerViewColumn } from '@tarojs/components'
import { Lunar, LunarMonth, LunarYear } from 'lunar-javascript'
import { useDaliurenStore } from '@/store/daliuren'
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
    datetime,
    calendar,
    lunarLeap,
    manualMode,
    manualPillars,
    caseName,
    caseNote,
    subject,
    autoSave,
    setDatetime,
    setCalendar,
    setLunarLeap,
    setManualMode,
    setManualPillar,
    setCaseName,
    setCaseNote,
    setSubject,
    setAutoSave,
    compute,
    setActiveTab
  } = useDaliurenStore()

  const PICKER_ROW = 40
  const [pickerValue, setPickerValue] = React.useState<[number, number, number, number, number]>([0, 0, 0, 0, 0])

  const leapMonth = calendar === 'lunar' ? LunarYear.fromYear(datetime.year).getLeapMonth() : 0

  React.useEffect(() => {
    if (calendar !== 'lunar') return
    if (!leapMonth && lunarLeap) setLunarLeap(false)
  }, [calendar, leapMonth, lunarLeap, setLunarLeap])

  const getDays = React.useCallback(() => {
    const y = datetime.year
    const m = datetime.month
    if (calendar === 'lunar') {
      try {
        const lunarMonth = lunarLeap ? -m : m
        return LunarMonth.fromYm(y, lunarMonth).getDayCount()
      } catch (err) {
        return 30
      }
    }
    return new Date(y, m, 0).getDate()
  }, [datetime.year, datetime.month, calendar, lunarLeap])

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
          label: getLunarMonthLabel(datetime.year, m, false),
          isLeap: false
        }
      ]
      if (leapMonth === m) {
        options.push({
          key: `${m}L`,
          value: m,
          label: getLunarMonthLabel(datetime.year, m, true),
          isLeap: true
        })
      }
      return options
    })
  }, [calendar, datetime.year, leapMonth])

  const dayOptions = React.useMemo(() => {
    return daysDynamic.map((d) => ({
      key: `${d}`,
      value: d,
      label: calendar === 'lunar'
        ? getLunarDayLabel(datetime.year, datetime.month, d, lunarLeap)
        : pad2(d)
    }))
  }, [daysDynamic, calendar, datetime.year, datetime.month, lunarLeap])

  React.useEffect(() => {
    if (!dateModalOpen) return
    const yearIndex = years.indexOf(datetime.year)
    const monthIndex = monthOptions.findIndex((m) => m.value === datetime.month && Boolean(m.isLeap) === lunarLeap)
    const dayIndex = dayOptions.findIndex((d) => d.value === datetime.day)
    const hourIndex = hours.indexOf(datetime.hour)
    const minuteIndex = minutes.indexOf(datetime.minute)
    const clampedDayIndex = Math.max(0, Math.min(dayOptions.length - 1, dayIndex))
    if (dayIndex !== clampedDayIndex) {
      const nextDay = dayOptions[clampedDayIndex]
      if (nextDay) setDatetime({ day: nextDay.value })
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
  }, [dateModalOpen, datetime.year, datetime.month, datetime.day, datetime.hour, datetime.minute, lunarLeap, monthOptions, dayOptions, pickerValue, setDatetime])

  const birthDisplay = `${datetime.year}-${pad2(datetime.month)}-${pad2(datetime.day)} ${pad2(datetime.hour)}:${pad2(datetime.minute)}`
  const lunarDisplay = React.useMemo(() => {
    try {
      const lunarMonth = lunarLeap ? -datetime.month : datetime.month
      const lunar = Lunar.fromYmdHms(datetime.year, lunarMonth, datetime.day, datetime.hour, datetime.minute, 0)
      const monthLabel = `${lunarLeap ? '闰' : ''}${lunar.getMonthInChinese()}月`
      const dayLabel = lunar.getDayInChinese()
      return `农历 ${lunar.getYearInChinese()}年${monthLabel}${dayLabel} ${pad2(datetime.hour)}:${pad2(datetime.minute)}`
    } catch (err) {
      return birthDisplay
    }
  }, [datetime, lunarLeap, birthDisplay])

  const displayText = calendar === 'lunar' ? lunarDisplay : birthDisplay

  const renderPillarSelect = (label: string, key: keyof typeof manualPillars) => {
    const p = manualPillars[key]
    const allowedBranches = YANG_STEMS.includes(p.stem) ? YANG_BRANCHES : YIN_BRANCHES
    return (
      <div className="dlr-pillar-input" key={label}>
        <div className="dlr-pillar-label">{label}</div>
        <div className="dlr-pillar-controls">
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

  return (
    <section className="daliuren-section">
      <div className="daliuren-card daliuren-input-card">
        <div className="daliuren-input-header">
          <div className="daliuren-title">大六壬排盘</div>
          <div className="daliuren-subtitle">选择起课时间与历法，生成六壬盘</div>
        </div>

        <div className="daliuren-form">
          <div className="daliuren-row">
            <div className="daliuren-label">姓名</div>
            <div className="daliuren-content">
              <input
                className="daliuren-text"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="可选"
              />
            </div>
          </div>

          <div className="daliuren-row">
            <div className="daliuren-label">备注</div>
            <div className="daliuren-content">
              <input
                className="daliuren-text"
                value={caseNote}
                onChange={(e) => setCaseNote(e.target.value)}
                placeholder="可选"
              />
            </div>
          </div>

          <div className="daliuren-row">
            <div className="daliuren-label">主题</div>
            <div className="daliuren-content">
              <input
                className="daliuren-text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="求测事项 / 主题"
              />
            </div>
          </div>

          <div className="daliuren-row daliuren-toggle-row">
            <div className="daliuren-toggle-group">
              <button className={`daliuren-pill ${calendar === 'solar' && !manualMode ? 'active' : ''}`} onClick={() => { setManualMode(false); setCalendar('solar') }}>公历</button>
              <button className={`daliuren-pill ${calendar === 'lunar' && !manualMode ? 'active' : ''}`} onClick={() => { setManualMode(false); setCalendar('lunar') }}>农历</button>
              <button className={`daliuren-pill ${manualMode ? 'active' : ''}`} onClick={() => setManualMode(true)}>四柱</button>
            </div>
          </div>

          <div className="daliuren-row daliuren-row-clickable" onClick={() => setDateModalOpen(true)}>
            <div className="daliuren-label">起课时间</div>
            <div className="daliuren-content">
              <div className="daliuren-value">{manualMode ? '四柱手动' : displayText}</div>
              <div className="daliuren-arrow">›</div>
            </div>
          </div>

          <div className="daliuren-row daliuren-row-save">
            <div className="daliuren-label">保存</div>
            <div className="daliuren-content">
              <label className="daliuren-switch">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span />
              </label>
            </div>
          </div>

          <button
            className="daliuren-primary"
            onClick={async () => {
              const res = await compute()
              if (res) setActiveTab('result')
            }}
          >
            开始排盘
          </button>
        </div>
      </div>

      {dateModalOpen && (
        <div className="dlr-modal-mask" onClick={() => setDateModalOpen(false)}>
          <div className="dlr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dlr-modal-body">
              <div className="dlr-modal-tabs">
                <button
                  className={`dlr-modal-tab ${calendar === 'solar' && !manualMode ? 'active' : ''}`}
                  onClick={() => {
                    setManualMode(false)
                    setCalendar('solar')
                  }}
                >
                  公历
                </button>
                <button
                  className={`dlr-modal-tab ${calendar === 'lunar' && !manualMode ? 'active' : ''}`}
                  onClick={() => {
                    setManualMode(false)
                    setCalendar('lunar')
                  }}
                >
                  农历
                </button>
                <button
                  className={`dlr-modal-tab ${manualMode ? 'active' : ''}`}
                  onClick={() => setManualMode(true)}
                >
                  四柱
                </button>
              </div>
              {manualMode ? (
                <div className="dlr-modal-manual">
                  {renderPillarSelect('年柱', 'year')}
                  {renderPillarSelect('月柱', 'month')}
                  {renderPillarSelect('日柱', 'day')}
                  {renderPillarSelect('时柱', 'hour')}
                  <div className="dlr-inline-note">手动四柱遵循“阳干配阳支、阴干配阴支”规则。</div>
                </div>
              ) : (
                <div className="dlr-modal-wheel">
                  <div className="dlr-wheel-labels">
                    <span>年</span>
                    <span>月</span>
                    <span>日</span>
                    <span>时</span>
                    <span>分</span>
                  </div>
                  <PickerView
                    className="dlr-picker"
                    indicatorStyle={`height: ${PICKER_ROW}px;`}
                    value={pickerValue}
                    onChange={(e) => {
                      const [yIdx, mIdx, dIdx, hIdx, minIdx] = e.detail.value
                      setPickerValue([yIdx, mIdx, dIdx, hIdx, minIdx])
                      const y = years[Math.max(0, Math.min(years.length - 1, yIdx))]
                      const m = monthOptions[Math.max(0, Math.min(monthOptions.length - 1, mIdx))]
                      const d = dayOptions[Math.max(0, Math.min(dayOptions.length - 1, dIdx))]
                      const h = hours[Math.max(0, Math.min(hours.length - 1, hIdx))]
                      const mi = minutes[Math.max(0, Math.min(minutes.length - 1, minIdx))]
                      setDatetime({
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
                        <div key={y} className={`dlr-picker-item ${pickerValue[0] === idx ? 'active' : ''}`}>{y}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {monthOptions.map((m, idx) => (
                        <div key={m.key} className={`dlr-picker-item ${pickerValue[1] === idx ? 'active' : ''}`}>{m.label}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {dayOptions.map((d, idx) => (
                        <div key={d.key} className={`dlr-picker-item ${pickerValue[2] === idx ? 'active' : ''}`}>{d.label}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {hours.map((h, idx) => (
                        <div key={h} className={`dlr-picker-item ${pickerValue[3] === idx ? 'active' : ''}`}>{pad2(h)}</div>
                      ))}
                    </PickerViewColumn>
                    <PickerViewColumn>
                      {minutes.map((m, idx) => (
                        <div key={m} className={`dlr-picker-item ${pickerValue[4] === idx ? 'active' : ''}`}>{pad2(m)}</div>
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
