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

  const displayText = isUnlocked ? report : (report || preview)
  const placeholder = '登录后可生成AI详解2026年运势报告，涵盖流年、大运、用神与关键提示。'

  return (
    <section className="bazi-section ai-analysis">
      <div className="bazi-card">
        <div className="section-title">AI详解2026年运势报告</div>
        <div className="ai-actions">
          <button className="bazi-primary-btn" onClick={handleGenerate}>生成报告</button>
          {!isLoggedIn && <span className="ai-hint">未登录用户仅展示模糊预览</span>}
        </div>

        <div className="ai-report-wrap">
          <div className={`ai-report ${!isLoggedIn ? 'blur' : ''}`}>
            {status === 'loading' && <div className="ai-text">正在生成报告...</div>}
            {status === 'error' && <div className="ai-text">生成失败：{error}</div>}
            {status === 'idle' && <div className="ai-text">{placeholder}</div>}
            {status === 'done' && <div className="ai-text">{displayText || placeholder}</div>}
          </div>

          {!isLoggedIn && (
            <div className="ai-mask">
              <div>登录后解锁完整内容</div>
            </div>
          )}
        </div>

        {isLoggedIn && status === 'done' && !isUnlocked && (
          <div className="ai-lock-tip">已生成完整报告，充值会员后可解锁全文（暂未开放充值）</div>
        )}
      </div>
    </section>
  )
}

export default AiAnalysis
