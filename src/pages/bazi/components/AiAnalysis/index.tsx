import React from 'react'
import Taro from '@tarojs/taro'
import { useBaziStore } from '@/store/bazi'
import { fetchBaziAiReport } from '@/services/bazi'
import { getToken } from '@/services/auth'
import './index.scss'

const AiAnalysis: React.FC = () => {
  const {
    result,
    manualMode,
    manualPillars,
    gender,
    directionRule,
    birth,
    calendar,
    timeMode,
    manualStartAge,
    manualStartYear
  } = useBaziStore()

  const [report, setReport] = React.useState('')
  const [preview, setPreview] = React.useState('')
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = React.useState('')

  const token = getToken()
  const isLoggedIn = Boolean(token)

  React.useEffect(() => {
    setReport('')
    setPreview('')
    setIsUnlocked(false)
    setStatus('idle')
    setError('')
  }, [
    result?.pillars?.year?.stem,
    result?.pillars?.year?.branch,
    result?.pillars?.month?.stem,
    result?.pillars?.month?.branch,
    result?.pillars?.day?.stem,
    result?.pillars?.day?.branch,
    result?.pillars?.hour?.stem,
    result?.pillars?.hour?.branch
  ])

  const buildPayload = () => {
    if (!result?.pillars) return null
    const pillars = {
      year: { stem: result.pillars.year.stem, branch: result.pillars.year.branch },
      month: { stem: result.pillars.month.stem, branch: result.pillars.month.branch },
      day: { stem: result.pillars.day.stem, branch: result.pillars.day.branch },
      hour: { stem: result.pillars.hour.stem, branch: result.pillars.hour.branch }
    }
    const luckStart = {
      startAge: manualMode ? manualStartAge : result.luck?.startAge,
      startYear: manualMode ? manualStartYear : result.luck?.startYear,
      isForward: result.luck?.direction === 'forward'
    }
    const birthMeta = manualMode ? undefined : {
      date: `${birth.year}-${String(birth.month).padStart(2, '0')}-${String(birth.day).padStart(2, '0')}`,
      time: `${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')}`,
      calendar,
      timeMode
    }
    return {
      pillars: manualMode ? manualPillars : pillars,
      gender,
      directionRule,
      luckStart,
      birth: birthMeta
    }
  }

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录后查看', icon: 'none' })
      return
    }
    const payload = buildPayload()
    if (!payload) {
      Taro.showToast({ title: '请先完成排盘', icon: 'none' })
      return
    }
    setStatus('loading')
    setError('')
    try {
      const data = await fetchBaziAiReport(payload, '生成AI详解中...')
      setReport(data.report || '')
      setPreview(data.preview || '')
      setIsUnlocked(Boolean(data.isUnlocked))
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || '生成失败')
    }
  }

  const placeholder = '登录后可生成AI详解2026年运势报告，涵盖流年、大运、用神与关键提示。'

  const previewDisplay = (() => {
    if (status === 'loading') return '正在生成摘要...'
    if (status === 'error') return `生成失败：${error}`
    if (status === 'done') return preview || '暂无摘要预览'
    return '生成后将在这里展示摘要重点'
  })()

  const fullDisplay = (() => {
    if (status === 'loading') return '正在生成报告...'
    if (status === 'error') return `生成失败：${error}`
    if (status === 'done') return report || preview || placeholder
    return placeholder
  })()

  return (
    <section className='bazi-section ai-analysis'>
      <div className='bazi-card'>
        <div className='section-title'>AI详解2026年运势报告</div>
        <div className='ai-actions'>
          <button className='bazi-primary-btn' onClick={handleGenerate}>生成报告</button>
          {!isLoggedIn && <span className='ai-hint'>未登录仅展示摘要与模糊全文</span>}
        </div>

        <div className='ai-report-grid'>
          <div className='ai-panel'>
            <div className='ai-panel-title'>摘要预览</div>
            <div className='ai-panel-body'>{previewDisplay}</div>
          </div>

          <div className='ai-panel ai-panel-full'>
            <div className='ai-panel-title'>完整报告</div>
            <div className={`ai-panel-body ${isLoggedIn && isUnlocked ? '' : 'blur'}`}>
              {fullDisplay}
            </div>
            {!isLoggedIn && (
              <div className='ai-mask'>
                <div>登录后解锁完整内容</div>
              </div>
            )}
            {isLoggedIn && !isUnlocked && status === 'done' && (
              <div className='ai-mask'>
                <div>充值会员后可解锁全文（暂未开放充值）</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AiAnalysis
