import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

type DialField = 'year' | 'month' | 'day' | 'hour'

type DialState = Record<DialField, string>

const pad2 = (n: number) => String(n).padStart(2, '0')

const getYearOptions = (): string[] => {
  const start = 1900
  const end = 2100
  const len = end - start + 1
  return Array.from({ length: len }, (_, i) => `${start + i}年`)
}

const getMonthOptions = (): string[] => Array.from({ length: 12 }, (_, i) => `${pad2(i + 1)}月`)

const getDaysInMonth = (yearNum: number, monthNum: number): number => {
  // 公历的天数计算：monthNum 下一个月的第 0 天即为当前月最后一天
  return new Date(yearNum, monthNum, 0).getDate()
}

const getDayOptions = (yearLabel: string, monthLabel: string): string[] => {
  const yearNum = parseInt(yearLabel.replace('年', ''), 10) || 1990
  const monthNum = parseInt(monthLabel.replace('月', ''), 10) || 1
  const days = getDaysInMonth(yearNum, monthNum)
  return Array.from({ length: days }, (_, i) => `${pad2(i + 1)}日`)
}

const getHourOptions = (): string[] => Array.from({ length: 24 }, (_, i) => `${pad2(i)}时`)

const ringMeta: Record<DialField, { label: string; hint: string }> = {
  year: { label: '年', hint: 'Birth Year' },
  month: { label: '月', hint: 'Month' },
  day: { label: '日', hint: 'Day' },
  hour: { label: '时', hint: 'Hour Branch' }
}

const BaZiPage: React.FC = () => {
  const [calendar, setCalendar] = React.useState<'solar' | 'lunar'>('solar')
  const [gender, setGender] = React.useState<'male' | 'female'>('male')
  const [dial, setDial] = React.useState<DialState>({
    year: '1990年',
    month: '05月',
    day: '18日',
    hour: '08时'
  })
  const [spinDir, setSpinDir] = React.useState<Record<DialField, '' | 'left' | 'right'>>({
    year: '',
    month: '',
    day: '',
    hour: ''
  })
  const touchStartY = React.useRef<Record<DialField, number>>({ year: 0, month: 0, day: 0, hour: 0 })

  const triggerSpin = (field: DialField, dir: 'left' | 'right') => {
    setSpinDir((prev) => ({ ...prev, [field]: '' }))
    setTimeout(() => {
      setSpinDir((prev) => ({ ...prev, [field]: dir }))
    }, 16)
  }

  const getVisibleItems = (field: DialField) => {
    const list =
      field === 'year'
        ? getYearOptions()
        : field === 'month'
        ? getMonthOptions()
        : field === 'day'
        ? getDayOptions(dial.year, dial.month)
        : getHourOptions()
    const centerIdx = Math.max(0, list.indexOf(dial[field]))
    const read = (offset: number) => {
      const idx = (centerIdx + offset + list.length) % list.length
      return list[idx]
    }
    return [-2, -1, 0, 1, 2].map(read)
  }

  const cycleDial = (field: DialField, delta: 1 | -1) => {
    const list =
      field === 'year'
        ? getYearOptions()
        : field === 'month'
        ? getMonthOptions()
        : field === 'day'
        ? getDayOptions(dial.year, dial.month)
        : getHourOptions()
    const idx = list.indexOf(dial[field])
    if (idx === -1) return
    const next = list[(idx + delta + list.length) % list.length]
    setDial((prev) => ({ ...prev, [field]: next }))
    triggerSpin(field, delta === -1 ? 'left' : 'right')
  }

  const selectValue = (field: DialField, value: string) => {
    setDial((prev) => ({ ...prev, [field]: value }))
  }

  const getTouchY = (e: any) => {
    return e?.touches?.[0]?.clientY ?? e?.changedTouches?.[0]?.clientY ?? 0
  }

  const handleTouchStart = (field: DialField) => (e: any) => {
    touchStartY.current[field] = getTouchY(e)
  }

  const handleTouchMove = (field: DialField) => (e: any) => {
    const currentY = getTouchY(e)
    const startY = touchStartY.current[field]
    const delta = currentY - startY
    const threshold = 30
    if (Math.abs(delta) >= threshold) {
      cycleDial(field, delta > 0 ? 1 : -1)
      touchStartY.current[field] = currentY
    }
  }

  const handleTouchEnd = (field: DialField) => () => {
    touchStartY.current[field] = 0
  }

  const handleToggle = (type: 'calendar' | 'gender') => {
    if (type === 'calendar') {
      setCalendar((prev) => (prev === 'solar' ? 'lunar' : 'solar'))
    } else {
      setGender((prev) => (prev === 'male' ? 'female' : 'male'))
    }
  }

  const handleSubmit = () => {
    Taro.showToast({ title: '排盘即将上线，敬请期待', icon: 'none' })
  }

  // 当年/月变化时，确保日期不越界（例如从 31 天切到 30 天）
  React.useEffect(() => {
    const days = getDayOptions(dial.year, dial.month)
    if (!days.includes(dial.day)) {
      setDial((prev) => ({ ...prev, day: days[days.length - 1] }))
    }
  }, [dial.year, dial.month, calendar])

  return (
    <View className="bazi-page">
      <View className="space-layer" aria-hidden>
        <View className="starfield" />
        <View className="nebula" />
        <View className="grain" />
      </View>

      <View className="content">
        <View className="hero">
          <Text className="eyebrow">New Chinese Cyber-Zen</Text>
          <Text className="title">八字排盘 · 输入</Text>
          <Text className="subtitle">深邃宇宙下的水晶天机仪，承载年、月、日、时的流转。</Text>
        </View>

        <View className="dial-row">
          <View className="side-switch" onClick={() => handleToggle('calendar')}>
            <View className={`capsule ${calendar === 'solar' ? 'active' : ''}`}>
              <Text className="label">公历</Text>
              <View className="divider" />
              <Text className="label">农历</Text>
              <View className="pattern cloud" />
            </View>
            <Text className="hint">细描金线 · 云纹</Text>
          </View>

          <View className="crystal-core">
            <View className="halo" aria-hidden />
            <View className="halo inner" aria-hidden />
            <View className="ring-stack">
              {(Object.keys(ringMeta) as DialField[]).map((field) => {
                const items = getVisibleItems(field)
                const meta = ringMeta[field]
                return (
                  <View
                    key={field}
                    className={`ring ${spinDir[field] ? `spin-${spinDir[field]}` : ''}`}
                    onTouchStart={handleTouchStart(field)}
                    onTouchMove={handleTouchMove(field)}
                    onTouchEnd={handleTouchEnd(field)}
                  >
                    <View className="ring-glass" />
                    <View className="ring-label">
                      <Text className="cn">{meta.label}</Text>
                      <Text className="en">{meta.hint}</Text>
                    </View>
                    <View className="ring-items">
                      {items.map((item, idx) => {
                        const isActive = item === dial[field]
                        const level = idx === 2 ? 'center' : idx === 1 || idx === 3 ? 'mid' : 'far'
                        return (
                          <View
                            key={`${field}-${item}-${idx}`}
                            className={`ring-item ${level} ${isActive ? 'active' : ''}`}
                            onClick={() => selectValue(field, item)}
                          >
                            <Text>{item}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <View className="side-switch" onClick={() => handleToggle('gender')}>
            <View className={`capsule ${gender === 'male' ? 'active' : ''}`}>
              <Text className="label">男</Text>
              <View className="divider" />
              <Text className="label">女</Text>
              <View className="pattern taiji" />
            </View>
            <Text className="hint">太极纹理 · 氤氲</Text>
          </View>
        </View>

        <View className="cta-row">
          <View className="ghost-button" onClick={handleSubmit}>
            <Text>排盘</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default BaZiPage
