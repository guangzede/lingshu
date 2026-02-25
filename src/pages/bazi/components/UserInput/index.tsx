import React from 'react'
import { PickerView, PickerViewColumn } from '@tarojs/components'
import { Lunar, LunarMonth, LunarYear, Solar } from 'lunar-javascript'
import { useBaziStore } from '@/store/bazi'
import type { Branch, Stem } from '@/types/liuyao'

const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const YANG_STEMS: Stem[] = ['甲', '丙', '戊', '庚', '壬']
const YANG_BRANCHES: Branch[] = ['子', '寅', '辰', '午', '申', '戌']
const YIN_BRANCHES: Branch[] = ['丑', '卯', '巳', '未', '酉', '亥']

const now = new Date()
const currentYear = now.getFullYear()
const years = Array.from({ length: 121 }, (_, i) => currentYear - 80 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

type PickerValue = [number, number, number, number, number]

const pad2 = (n: number) => n.toString().padStart(2, '0')
const clampIndex = (index: number, max: number) => Math.max(0, Math.min(max, index))
const getAllowedBranches = (stem: Stem) => (YANG_STEMS.includes(stem) ? YANG_BRANCHES : YIN_BRANCHES)

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

const buildInstantData = () => {
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
  return { instantNow, lunar, pillars }
}

interface PillarSelectProps {
  label: string
  value: { stem: Stem; branch: Branch }
  onClickStem: () => void
  onClickBranch: () => void
}

const PillarSelect: React.FC<PillarSelectProps> = ({ label, value, onClickStem, onClickBranch }) => {
  return (
    <div className="bazi-pillar-input">
      <div className="bazi-pillar-label">{label}</div>
      <div className="bazi-pillar-display">
        <div className="pillar-box stem-box" onClick={onClickStem}>
          {value.stem}
        </div>
        <div className="pillar-box branch-box" onClick={onClickBranch}>
          {value.branch}
        </div>
      </div>
    </div>
  )
}

interface WheelPickerProps {
  value: PickerValue
  onChange: (next: PickerValue) => void
  columns: Array<Array<{ key: string; label: string }>>
}

const WheelPicker: React.FC<WheelPickerProps> = ({ value, onChange, columns }) => (
  <PickerView
    className="bazi-picker"
    value={value}
    indicatorClass="bazi-picker-indicator"
    onChange={(e) => onChange(e.detail.value as PickerValue)}
  >
    {columns.map((column, columnIndex) => (
      <PickerViewColumn key={`col-${columnIndex}`}>
        {column.map((item, idx) => (
          <div key={item.key} className={`bazi-picker-item ${value[columnIndex] === idx ? 'active' : ''}`}>
            {item.label}
          </div>
        ))}
      </PickerViewColumn>
    ))}
  </PickerView>
)

interface DateModalProps {
  calendar: 'solar' | 'lunar'
  manualMode: boolean
  pickerValue: PickerValue
  monthOptions: Array<{ key: string; value: number; label: string; isLeap: boolean }>
  dayOptions: Array<{ key: string; value: number; label: string }>
  manualPillars: Record<'year' | 'month' | 'day' | 'hour', { stem: Stem; branch: Branch }>
  onClose: () => void
  onPickerChange: (next: PickerValue) => void
  onSelectSolar: () => void
  onSelectLunar: () => void
  onSelectManual: () => void
  onSetManualPillar: (key: keyof DateModalProps['manualPillars'], next: { stem: Stem; branch: Branch }) => void
}

type SelectionTarget = {
  pillar: 'year' | 'month' | 'day' | 'hour'
  part: 'stem' | 'branch'
} | null

const DateModal: React.FC<DateModalProps> = ({
  calendar,
  manualMode,
  pickerValue,
  monthOptions,
  dayOptions,
  manualPillars,
  onClose,
  onPickerChange,
  onSelectSolar,
  onSelectLunar,
  onSelectManual,
  onSetManualPillar
}) => {
  const [selectionTarget, setSelectionTarget] = React.useState<SelectionTarget>(null)

  const columns = [
    years.map((y) => ({ key: `${y}`, label: `${y}` })),
    monthOptions.map((m) => ({ key: m.key, label: m.label })),
    dayOptions.map((d) => ({ key: d.key, label: d.label })),
    hours.map((h) => ({ key: `${h}`, label: pad2(h) })),
    minutes.map((m) => ({ key: `${m}`, label: pad2(m) }))
  ]

  const handleSelectStem = (stem: Stem) => {
    if (!selectionTarget || selectionTarget.part !== 'stem') return
    const pillarKey = selectionTarget.pillar
    const currentPillar = manualPillars[pillarKey]
    const nextBranches = getAllowedBranches(stem)
    const nextBranch = nextBranches.includes(currentPillar.branch) ? currentPillar.branch : nextBranches[0]
    onSetManualPillar(pillarKey, { stem, branch: nextBranch })
    setSelectionTarget(null)
  }

  const handleSelectBranch = (branch: Branch) => {
    if (!selectionTarget || selectionTarget.part !== 'branch') return
    const pillarKey = selectionTarget.pillar
    const currentPillar = manualPillars[pillarKey]
    onSetManualPillar(pillarKey, { ...currentPillar, branch })
    setSelectionTarget(null)
  }

  const renderSelectionGrid = () => {
    if (!selectionTarget) return null

    if (selectionTarget.part === 'stem') {
      return (
        <div className="bazi-grid-picker">
          <div className="picker-header">
            <span>选择天干</span>
            <span className="close-btn" onClick={() => setSelectionTarget(null)}>×</span>
          </div>
          <div className="picker-grid stems">
            {STEMS.map((s) => (
              <div
                key={s}
                className={`grid-cell ${manualPillars[selectionTarget.pillar].stem === s ? 'active' : ''}`}
                onClick={() => handleSelectStem(s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (selectionTarget.part === 'branch') {
      const currentStem = manualPillars[selectionTarget.pillar].stem
      const allowed = getAllowedBranches(currentStem)
      return (
        <div className="bazi-grid-picker">
          <div className="picker-header">
            <span>选择地支 ({YANG_STEMS.includes(currentStem) ? '阳' : '阴'})</span>
            <span className="close-btn" onClick={() => setSelectionTarget(null)}>×</span>
          </div>
          <div className="picker-grid branches">
            {BRANCHES.map((b) => {
              const isAllowed = allowed.includes(b)
              return (
                <div
                  key={b}
                  className={`grid-cell ${manualPillars[selectionTarget.pillar].branch === b ? 'active' : ''} ${!isAllowed ? 'disabled' : ''}`}
                  onClick={() => isAllowed && handleSelectBranch(b)}
                >
                  {b}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bazi-modal-mask" onClick={onClose}>
      <div className="bazi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bazi-modal-body">
          {!selectionTarget && (
            <div className="bazi-modal-tabs">
              <button
                className={`bazi-modal-tab ${calendar === 'solar' && !manualMode ? 'active' : ''}`}
                onClick={onSelectSolar}
              >
                公历
              </button>
              <button
                className={`bazi-modal-tab ${calendar === 'lunar' && !manualMode ? 'active' : ''}`}
                onClick={onSelectLunar}
              >
                农历
              </button>
              <button
                className={`bazi-modal-tab ${manualMode ? 'active' : ''}`}
                onClick={onSelectManual}
              >
                四柱
              </button>
            </div>
          )}

          {manualMode ? (
            selectionTarget ? (
              renderSelectionGrid()
            ) : (
              <div className="bazi-modal-manual">
                <PillarSelect
                  label="年柱"
                  value={manualPillars.year}
                  onClickStem={() => setSelectionTarget({ pillar: 'year', part: 'stem' })}
                  onClickBranch={() => setSelectionTarget({ pillar: 'year', part: 'branch' })}
                />
                <PillarSelect
                  label="月柱"
                  value={manualPillars.month}
                  onClickStem={() => setSelectionTarget({ pillar: 'month', part: 'stem' })}
                  onClickBranch={() => setSelectionTarget({ pillar: 'month', part: 'branch' })}
                />
                <PillarSelect
                  label="日柱"
                  value={manualPillars.day}
                  onClickStem={() => setSelectionTarget({ pillar: 'day', part: 'stem' })}
                  onClickBranch={() => setSelectionTarget({ pillar: 'day', part: 'branch' })}
                />
                <PillarSelect
                  label="时柱"
                  value={manualPillars.hour}
                  onClickStem={() => setSelectionTarget({ pillar: 'hour', part: 'stem' })}
                  onClickBranch={() => setSelectionTarget({ pillar: 'hour', part: 'branch' })}
                />
                <div className="inline-note">点击干支进行修改。遵循“阳配阳、阴配阴”规则。</div>
              </div>
            )
          ) : (
            <div className="bazi-modal-wheel">
              <div className="bazi-wheel-labels">
                <span>年</span>
                <span>月</span>
                <span>日</span>
                <span>时</span>
                <span>分</span>
              </div>
              <WheelPicker
                value={pickerValue}
                onChange={onPickerChange}
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const useWheelModel = ({
  birth,
  calendar,
  lunarLeap,
  setBirth,
  setLunarLeap,
  dateModalOpen
}: {
  birth: { year: number; month: number; day: number; hour: number; minute: number }
  calendar: 'solar' | 'lunar'
  lunarLeap: boolean
  setBirth: (next: Partial<typeof birth>) => void
  setLunarLeap: (next: boolean) => void
  dateModalOpen: boolean
}) => {
  const [pickerValue, setPickerValue] = React.useState<PickerValue>([0, 0, 0, 0, 0])

  const leapMonth = React.useMemo(
    () => (calendar === 'lunar' ? LunarYear.fromYear(birth.year).getLeapMonth() : 0),
    [calendar, birth.year]
  )

  React.useEffect(() => {
    if (calendar !== 'lunar') return
    if (!leapMonth) {
      if (lunarLeap) setLunarLeap(false)
      return
    }
    if (lunarLeap && birth.month !== leapMonth) {
      setLunarLeap(false)
    }
  }, [calendar, birth.month, leapMonth, lunarLeap, setLunarLeap])

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

  const syncPicker = React.useCallback(() => {
    const yearIndex = years.indexOf(birth.year)
    const monthIndex = monthOptions.findIndex((m) => m.value === birth.month && Boolean(m.isLeap) === lunarLeap)
    const dayIndex = dayOptions.findIndex((d) => d.value === birth.day)
    const hourIndex = hours.indexOf(birth.hour)
    const minuteIndex = minutes.indexOf(birth.minute)
    const clampedDayIndex = clampIndex(dayIndex, dayOptions.length - 1)
    if (dayIndex !== clampedDayIndex) {
      const nextDay = dayOptions[clampedDayIndex]
      if (nextDay) setBirth({ day: nextDay.value })
    }
    const nextPicker: PickerValue = [
      clampIndex(yearIndex, years.length - 1),
      clampIndex(monthIndex, monthOptions.length - 1),
      clampedDayIndex,
      clampIndex(hourIndex, hours.length - 1),
      clampIndex(minuteIndex, minutes.length - 1)
    ]
    const same = nextPicker.every((v, i) => v === pickerValue[i])
    if (!same) setPickerValue(nextPicker)
  }, [birth.year, birth.month, birth.day, birth.hour, birth.minute, dayOptions, lunarLeap, monthOptions, pickerValue, setBirth])

  React.useEffect(() => {
    if (!dateModalOpen) return
    syncPicker()
  }, [dateModalOpen, syncPicker])

  const handlePickerChange = React.useCallback((next: PickerValue) => {
    const [yIdx, mIdx, dIdx, hIdx, minIdx] = next
    setPickerValue(next)
    const y = years[clampIndex(yIdx, years.length - 1)]
    const m = monthOptions[clampIndex(mIdx, monthOptions.length - 1)]
    const d = dayOptions[clampIndex(dIdx, dayOptions.length - 1)]
    const h = hours[clampIndex(hIdx, hours.length - 1)]
    const mi = minutes[clampIndex(minIdx, minutes.length - 1)]
    setBirth({
      year: y,
      month: m.value,
      day: d.value,
      hour: h,
      minute: mi
    })
    setLunarLeap(Boolean(m.isLeap))
  }, [dayOptions, monthOptions, setBirth, setLunarLeap])

  return { pickerValue, handlePickerChange, monthOptions, dayOptions }
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
    setBirth,
    setCalendar,
    setTimeMode,
    setLunarLeap,
    setGender,
    setManualMode,
    setManualPillar,
    caseName,
    caseNote,
    setCaseName,
    setCaseNote,
    compute,
    setActiveTab,
    autoSave,
    setAutoSave
  } = useBaziStore()

  const { pickerValue, handlePickerChange, monthOptions, dayOptions } = useWheelModel({
    birth,
    calendar,
    lunarLeap,
    setBirth,
    setLunarLeap,
    dateModalOpen
  })

  React.useEffect(() => {
    if (!manualMode) return
    (['year', 'month', 'day', 'hour'] as Array<keyof typeof manualPillars>).forEach((key) => {
      const p = manualPillars[key]
      const allowed = getAllowedBranches(p.stem)
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

  const handleCompute = React.useCallback(async () => {
    try {
      await compute()
      setActiveTab('result')
    } catch (err) {
      // compute errors handled by store toast
    }
  }, [compute, setActiveTab])

  const applyNowAndCompute = React.useCallback(async () => {
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
    await handleCompute()
  }, [handleCompute, setBirth, setCalendar, setManualMode, setTimeMode])

  const instantData = buildInstantData()

  return (
    <section className="bazi-section">
      <div className="bazi-card bazi-input-card">
        <div className="bazi-input-header">
          <div className="bazi-title">灵枢 八字</div>
          <div className="bazi-subtitle">选择历法与出生信息，解构人生密码</div>
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
                  style={{ "visibility": "hidden" }}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span className="bazi-switch-track" />
                <span className="bazi-switch-thumb" />
              </label>
            </div>
          </div>
        </div>

        <div className="bazi-action-row">
          <button className="bazi-primary-btn" onClick={handleCompute}>开始排盘</button>
        </div>
      </div>

      {!manualMode && (
        <div className="bazi-card bazi-instant-card">
          <div className="instant-body">
            <div className="instant-row">
              <div className="instant-left">
                <div className="instant-pillars">
                  {instantData.pillars.map((p, idx) => (
                    <div key={`instant-${idx}`} className="instant-pillar">
                      <span>{p.stem}</span>
                      <span>{p.branch}</span>
                    </div>
                  ))}
                </div>
                <div className="instant-meta">
                  <div className="instant-note">{`农历 ${instantData.lunar.getYearInChinese()}年${instantData.lunar.getMonthInChinese()}月${instantData.lunar.getDayInChinese()} ${instantData.lunar.getTimeZhi()}时`}</div>
                  <div className="instant-note">{`公历 ${instantData.instantNow.getFullYear()}-${pad2(instantData.instantNow.getMonth() + 1)}-${pad2(instantData.instantNow.getDate())} ${pad2(instantData.instantNow.getHours())}:${pad2(instantData.instantNow.getMinutes())}`}</div>
                </div>
              </div>
              <div className="instant-right">
                <div className="instant-time">{`${pad2(instantData.instantNow.getHours())}:${pad2(instantData.instantNow.getMinutes())}`}</div>
                <button className="bazi-ghost-btn instant-btn" onClick={applyNowAndCompute}>即时排盘</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dateModalOpen && (
        <DateModal
          calendar={calendar}
          manualMode={manualMode}
          pickerValue={pickerValue}
          monthOptions={monthOptions}
          dayOptions={dayOptions}
          manualPillars={manualPillars}
          onClose={() => setDateModalOpen(false)}
          onPickerChange={handlePickerChange}
          onSelectSolar={() => { setManualMode(false); setCalendar('solar') }}
          onSelectLunar={() => { setManualMode(false); setCalendar('lunar') }}
          onSelectManual={() => setManualMode(true)}
          onSetManualPillar={setManualPillar}
        />
      )}
    </section>
  )
}

export default UserInput
