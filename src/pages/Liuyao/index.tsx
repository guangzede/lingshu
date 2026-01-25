import React from 'react'
import { View, Text, Button, Picker, Input } from '@tarojs/components'
import Taro, { useDidShow, getCurrentInstance } from '@tarojs/taro'
import THEME from '@/constants/theme'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'
import { analyzeBranchRelation, analyzeYaoInteractions } from '@/services/liuyao'
import { HexagramTable } from './components/HexagramTable'
import ShakeCoins from './components/ShakeCoins'
import QuestionCard from './components/QuestionCard'
import AIAnalysisCard from './components/AIAnalysisCard'
import HumanQACard from './components/HumanQACard'
import { analyzeYao } from './hooks/useYaoAnalysis'
import { usePaipan } from './hooks/usePaipan'
import { YAO_LABEL_ORDER, YAO_LABELS } from './constants/yaoConstants'
import type { PaipanMode, YaoData } from './types'

// 六爻排盘页面：调用 store 管理行、时间与结果
const LiuyaoPage: React.FC = () => {
  const {
    lines,
    result,
    dateValue,
    timeValue,
    isLoadingHistory,
    question,
    setLineState,
    setDateValue,
    setTimeValue,
    setQuestion,
    setIsLoadingHistory,
    reset,
    compute
  } = useLiuyaoStore((s) => s)

  const [mode, setMode] = React.useState<PaipanMode | 'shake'>('manual')
  const [countNumbers, setCountNumbers] = React.useState('')
  const [shakeStep, setShakeStep] = React.useState(0)
  const modeStatesRef = React.useRef<Record<PaipanMode | 'shake', { lines: any[]; result: any }> | null>(null)

  const todayStr = React.useMemo(() => {
    const now = new Date()
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const modeForPaipan: PaipanMode = mode === 'shake' ? 'manual' : mode
  const computeAndSave = React.useCallback(() => {
    compute()
    const s = useLiuyaoStore.getState()
    if (!modeStatesRef.current) return
    modeStatesRef.current[mode] = { lines: s.lines, result: s.result }
  }, [compute, mode])

  const { handlePaipan } = usePaipan({ mode: modeForPaipan, countNumbers, setLineState, compute: computeAndSave })
  const hasShownRef = React.useRef(false)

  const emptyLines = React.useMemo(() => (
    [
      { isYang: true, isMoving: false },
      { isYang: false, isMoving: false },
      { isYang: true, isMoving: false },
      { isYang: false, isMoving: false },
      { isYang: true, isMoving: false },
      { isYang: false, isMoving: false }
    ]
  ), [])

  // 初始化各模式独立状态容器
  if (!modeStatesRef.current) {
    const s = useLiuyaoStore.getState()
    modeStatesRef.current = {
      manual: { lines: s.lines, result: s.result },
      count: { lines: emptyLines, result: null },
      auto: { lines: emptyLines, result: null },
      shake: { lines: emptyLines, result: null }
    }
  }

  // 首页进入时还原到默认状态（带 source=home 参数）；从历史返回时保留结果
  useDidShow(() => {
    const source = getCurrentInstance()?.router?.params?.source
    if (source === 'home') {
      if (!hasShownRef.current || !isLoadingHistory) {
        reset()
        setIsLoadingHistory(false)
      }
    }
    if (!hasShownRef.current) {
      hasShownRef.current = true
    }
  })

  const handleModeChange = (m: PaipanMode | 'shake') => {
    // 保存当前模式的状态
    if (modeStatesRef.current) {
      const s = useLiuyaoStore.getState()
      modeStatesRef.current[mode] = { lines: s.lines, result: s.result }
    }

    setMode(m as PaipanMode)

    // 切换到目标模式：恢复其独立状态
    if (modeStatesRef.current) {
      const saved = modeStatesRef.current[m]
      if (saved) {
        const api = useLiuyaoStore.getState()
        api.setLines(saved.lines)
        api.setResult(saved.result || null)
      }
    }

    // 摇卦步骤根据是否已有结果简化处理
    if (m === 'shake') {
      const hasResult = !!modeStatesRef.current?.shake.result
      setShakeStep(hasResult ? 6 : 0)
    }

    if (m !== 'manual') {
      setIsLoadingHistory(false)
    }
  }

  const applyShakeResult = (heads: number, targetIndex: number) => {
    // 摇卦生成的概率与自动排盘一致：太阴12.5%、少阳37.5%、少阴37.5%、太阳12.5%
    const r = Math.random()
    let state: 'taiyin' | 'taiyang' | 'shaoyin' | 'shaoyang'
    if (r < 0.125) state = 'taiyin'
    else if (r < 0.5) state = 'shaoyang' // 0.125 + 0.375
    else if (r < 0.875) state = 'shaoyin' // 0.5 + 0.375
    else state = 'taiyang' // 0.875 + 0.125
    setLineState(targetIndex, state)
  }

  const handleShakeDone = (heads: number) => {
    if (shakeStep >= 6) return
    applyShakeResult(heads, shakeStep)
    const nextStep = shakeStep + 1
    setShakeStep(nextStep)
    if (nextStep >= 6) {
      setTimeout(() => compute(), 50)
    }
  }

  return (
    <View className="liuyao-page">


      {/* 顶部：极简模式选择器 - 仅编辑模式 */}
      {!isLoadingHistory && (
        <View className="top-section">
          <View className="mode-selector">
            <Text
              className={`mode-tab ${mode === 'manual' ? 'mode-tab-active' : ''}`}
              onClick={() => handleModeChange('manual')}
            >
              手动输入
            </Text>
            <Text
              className={`mode-tab ${mode === 'count' ? 'mode-tab-active' : ''}`}
              onClick={() => handleModeChange('count')}
            >
              报数起卦
            </Text>
            <Text
              className={`mode-tab ${mode === 'auto' ? 'mode-tab-active' : ''}`}
              onClick={() => handleModeChange('auto')}
            >
              自动排盘
            </Text>
            <Text
              className={`mode-tab ${mode === 'shake' ? 'mode-tab-active' : ''}`}
              onClick={() => handleModeChange('shake' as any)}
            >
              摇卦
            </Text>
          </View>

          {/* 优雅输入区 */}
          <View className="input-area">
            {/* 时间输入区 - 卡片形式 - 仅手动模式 */}

            {mode === 'count' && (
              <View className="glass-card count-input-card">
                <View className="card-header">
                  <Text className="card-section-title">报数起卦</Text>
                  <Text className="card-section-guide">根据数字起卦</Text>
                </View>
                <Input
                  className="number-input-elegant"
                  type="number"
                  value={countNumbers}
                  placeholder="输入任意长度数字（梅花易数）"
                  style={{ height: '52px', lineHeight: '26px' }}
                  onInput={(e) => setCountNumbers(e.detail.value)}
                />
              </View>
            )}
          </View>

        </View>
      )}
      {!result && mode === 'manual' && (
        <View className="glass-card datetime-card">
          <View className="card-header">
            <Text className="card-section-title">求测时间</Text>
            <Text className="card-section-guide">点击时间和日期选择</Text>
          </View>
          <View className="datetime-inputs">
            <View className="input-group">
              <Text className="input-label-elegant">日期</Text>
              <Picker mode="date" value={dateValue} end={todayStr} onChange={(e) => setDateValue(e.detail.value)}>
                <View className="value-with-underline">
                  <Text className="value-text">{dateValue.replace(/-/g, '年').replace(/年(\d+)$/, '年$1月').replace(/月(\d+)$/, '月$1日')}</Text>

                </View>
              </Picker>
            </View>

            <View className="input-group">
              <Text className="input-label-elegant">时间</Text>
              <Picker mode="time" value={timeValue} onChange={(e) => setTimeValue(e.detail.value)}>
                <View className="value-with-underline">
                  <Text className="value-text">{timeValue}</Text>

                </View>
              </Picker>
            </View>
          </View>
        </View>
      )}

      {/* 求测事项卡片 - 始终展示（无论是否加载历史） */}
      <View >
        <QuestionCard value={question} onChange={setQuestion} readOnly={isLoadingHistory} />
      </View>

      {/* 中部：爻位排盘卡片 - 仅手动模式 */}
      {!isLoadingHistory && !result && mode === 'manual' && (
        <View className="glass-card yao-matrix-section">
          <View className="card-header">
            <Text className="card-section-title">爻位排盘</Text>
            <Text className="card-section-guide">点击爻位切换阴阳动静</Text>
          </View>
          {YAO_LABEL_ORDER.map((label, displayIndex) => {
            const realIndex = lines.length - 1 - displayIndex
            const l = lines[realIndex] || {}
            const isMoving = l.isMoving

            // 计算爻的状态文字
            const getYaoState = () => {
              if (l.isYang && !l.isMoving) return '少阳'
              if (l.isYang && l.isMoving) return '太阳'
              if (!l.isYang && !l.isMoving) return '少阴'
              if (!l.isYang && l.isMoving) return '太阴'
              return ''
            }

            return (
              <View key={label} className="yao-row">
                <Text className="yao-label-elegant">{label}（{getYaoState()}）</Text>

                <View
                  className={`yao-symbol ${l.isYang ? 'yang' : 'yin'} ${isMoving ? 'moving' : ''}`}
                  onClick={() => {
                    // 循环切换：少阳 → 太阳 → 少阴 → 太阴 → 少阳
                    if (l.isYang && !l.isMoving) setLineState(realIndex, 'taiyang')
                    else if (l.isYang && l.isMoving) setLineState(realIndex, 'shaoyin')
                    else if (!l.isYang && !l.isMoving) setLineState(realIndex, 'taiyin')
                    else setLineState(realIndex, 'shaoyang')
                  }}
                >
                  {l.isYang ? (
                    <View className="yang-line">
                      <View className="line-segment full" />
                      {isMoving && <View className="moving-indicator" />}
                    </View>
                  ) : (
                    <View className="yin-line">
                      <View className="line-segment left" />
                      <View className="line-segment right" />
                      {isMoving && <View className="moving-indicator" />}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* 摇卦区域 - 仅摇卦模式 */}
      {!isLoadingHistory && !result && mode === 'shake' && (
        <View className="glass-card shake-section">
          <View className="card-header">
            <Text className="card-section-title">摇卦起卦</Text>
            <Text className="card-section-guide">点击铜钱进行摇卦</Text>
          </View>
          <ShakeCoins step={shakeStep} disabled={shakeStep >= 6} onDone={handleShakeDone} />
        </View>
      )}

      {/* 排盘按钮 */}
      {!isLoadingHistory && !result && (mode === 'manual' || mode === 'count' || mode === 'auto') && (
        <View className="divinate-button-container">
          <View
            className="divinate-button"
            onClick={handlePaipan}
          >
            <Text className="divinate-text">排盘</Text>
            <View className="energy-flow" />
          </View>
        </View>
      )}

      {/* 底部：结果展示（毛玻璃卡片） */}
      {result && (
        <View className="result-section">

          {/* AI 分析与人工答疑 */}
          <AIAnalysisCard question={question} result={result} />
          <HumanQACard question={question} />


          {/* 干支信息卡片 */}
          <View className="glass-card info-grid-card">
            <View className="card-header">
              <Text className="card-section-title">占象信息</Text>
              <Text className="card-section-guide">时间和神煞信息</Text>
            </View>
            <View className="info-row">
              <Text>{dateValue} {timeValue}</Text>
              <Text>农历 {result.lunar.month}月{result.lunar.day}日{result.lunar.jieQi ? `（${result.lunar.jieQi}）` : ''}</Text>
            </View>

            <View className="ganzhi-row">
              <View className="ganzhi-item">
                <Text className="ganzhi-label">年</Text>
                <Text className="ganzhi-value">{result.timeGanZhi.year.stem}{result.timeGanZhi.year.branch}</Text>
              </View>
              <View className="ganzhi-item">
                <Text className="ganzhi-label">月</Text>
                <Text className="ganzhi-value">{result.timeGanZhi.month.stem}{result.timeGanZhi.month.branch}</Text>
              </View>
              <View className="ganzhi-item">
                <Text className="ganzhi-label">日</Text>
                <Text className="ganzhi-value">{result.timeGanZhi.day.stem}{result.timeGanZhi.day.branch}</Text>
              </View>
              <View className="ganzhi-item">
                <Text className="ganzhi-label">时</Text>
                <Text className="ganzhi-value">{result.timeGanZhi.hour.stem}{result.timeGanZhi.hour.branch}</Text>
              </View>
            </View>

            <View className="xunkong-row">
              <Text className="xunkong-label">旬空</Text>
              <Text className="xunkong-value">{result.xunKong[0]}{result.xunKong[1]}</Text>
            </View>

            <View className="shensha-grid">
              <View className="shensha-item"><Text className="shensha-key">天乙贵人</Text><Text className="shensha-val">{Array.isArray(result.shenSha.天乙贵人) ? result.shenSha.天乙贵人.join('、') : result.shenSha.天乙贵人}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">驿马</Text><Text className="shensha-val">{result.shenSha.驿马}</Text></View>
              <View className="shensha-item highlight-jade"><Text className="shensha-key">禄神</Text><Text className="shensha-val">{result.shenSha.禄神}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">文昌</Text><Text className="shensha-val">{result.shenSha.文昌贵人}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">将星</Text><Text className="shensha-val">{result.shenSha.将星}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">华盖</Text><Text className="shensha-val">{result.shenSha.华盖}</Text></View>
              <View className="shensha-item highlight-jade"><Text className="shensha-key">天医</Text><Text className="shensha-val">{result.shenSha.天医}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">孤辰</Text><Text className="shensha-val">{result.shenSha.孤辰}</Text></View>
              <View className="shensha-item"><Text className="shensha-key">寡宿</Text><Text className="shensha-val">{result.shenSha.寡宿}</Text></View>
              <View className="shensha-item highlight-red"><Text className="shensha-key">桃花</Text><Text className="shensha-val">{result.shenSha.桃花}</Text></View>
              <View className="shensha-item highlight-red"><Text className="shensha-key">咸池</Text><Text className="shensha-val">{result.shenSha.咸池}</Text></View>
            </View>
          </View>

          {/* 卦象详细分析卡片 */}
          <View className="glass-card analysis-card">
            <View className="card-header">
              <Text className="card-section-title">六爻详细分析</Text>
              <Text className="card-section-guide">本卦、变卦及爻位的详细信息</Text>
            </View>
            {(() => {
              const allRelations = new Set(['父母', '官鬼', '子孙', '妻财', '兄弟'])
              const existingRelations = new Set(result.yaos.map((y: any) => y.relation).filter(Boolean))
              const missingRelations = Array.from(allRelations).filter(r => !existingRelations.has(r))

              if (missingRelations.length > 0) {
                const fushenLines = result.yaos
                  .map((y: any, i: number) => ({ y, i }))
                  .filter(({ y }: any) => y.fuShen && missingRelations.includes(y.fuShen.relation || ''))
              }
              return null
            })()}            <HexagramTable base={result.yaos} variant={result.variantYaos || result.variant.yaos} baseHex={result.hex} variantHex={result.variant} />

            {/* 日支时支与本卦地支关系分析 */}
            {(() => {
              const dayBranch = result.timeGanZhi.day.branch
              const hourBranch = result.timeGanZhi.hour.branch
              const hexBranches = result.yaos
                .map((y: any) => y.branch)
                .filter(Boolean) as string[]

              const { dayRelations, hourRelations } = analyzeBranchRelation(dayBranch as any, hourBranch as any, hexBranches as any)

              const labelMap: Record<number, string> = { 0: '初爻', 1: '二爻', 2: '三爻', 3: '四爻', 4: '五爻', 5: '上爻' }

              const formatRelation = (rel: any) => {
                const relations: string[] = []
                if (rel.isClash) relations.push(`六冲`)
                if (rel.isHarmony) relations.push(`六合`)
                if (rel.isTriple) relations.push(`三合`)
                if (rel.isPunish) relations.push(`三刑`)
                return relations.join('、')
              }

              return (
                <View className="branch-relation-section">
                  <View className="branch-relation-header">
                    <Text className="branch-relation-title">日支/时支关系</Text>
                  </View>

                  {/* 日支关系 */}
                  <View className="relation-group">
                    <Text className="relation-group-title">日支分析：</Text>
                    {dayRelations.map((rel, idx) => {
                      if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
                      const relationStr = formatRelation(rel)
                      return (
                        <Text key={idx} className="relation-item">
                          ({dayBranch})({rel.branch}) {relationStr} · {labelMap[idx]}
                        </Text>
                      )
                    })}
                  </View>

                  {/* 时支关系 */}
                  <View className="relation-group">
                    <Text className="relation-group-title">时支分析：</Text>
                    {hourRelations.map((rel, idx) => {
                      if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
                      const relationStr = formatRelation(rel)
                      return (
                        <Text key={idx} className="relation-item">
                          ({hourBranch})({rel.branch}) {relationStr} · {labelMap[idx]}
                        </Text>
                      )
                    })}
                  </View>
                </View>
              )
            })()}

            {/* 每一爻的详细分析 */}
            {(() => {
              const interactions = analyzeYaoInteractions(result.yaos, result.variantYaos || result.variant.yaos)

              // 预先计算所有动爻的分析结果
              const yaoAnalyses = result.yaos.map((yao: YaoData, index: number) =>
                analyzeYao(
                  yao as YaoData,
                  index,
                  result.yaos as YaoData[],
                  result.timeGanZhi.day.stem,
                  result.timeGanZhi.day.branch,
                  result.timeGanZhi.month.stem,
                  result.timeGanZhi.month.branch
                )
              )

              return (
                <View className="yao-analysis-section">
                  <View className="yao-analysis-header">
                    <Text className="yao-analysis-title">爻位动态</Text>
                  </View>

                  {interactions.map((interaction) => {
                    const yao = result.yaos[interaction.yaoIndex] as YaoData
                    const isMoving = yao?.isMoving
                    const seasonStrength = yao?.seasonStrength || ''
                    const changsheng = yao?.changsheng || ''
                    const analysis = yaoAnalyses[interaction.yaoIndex]

                    return (
                      <View key={interaction.yaoIndex} className="yao-analysis-item">
                        <View className="yao-analysis-item-header">
                          <Text className="yao-analysis-label">
                            {interaction.yaoLabel} {interaction.yaoInfo}
                            {isMoving ? <Text className="moving-tag">（动爻）</Text> : null}
                          </Text>
                          <Text className="yao-analysis-strength">
                            {seasonStrength ? `${seasonStrength}` : ''}{seasonStrength && changsheng ? ' · ' : ''}{changsheng}
                          </Text>
                        </View>

                        {/* 动爻分析：以当前动爻为主语 */}
                        {isMoving && analysis && analysis.relations.length > 0 && (
                          <Text className="yao-analysis-relations">
                            {analysis.yaoBranch}{analysis.yaoWuxing}：{analysis.relations.join('，')}
                          </Text>
                        )}

                        {/* 与变卦同位爻的关系（仅动爻显示） */}
                        {isMoving && interaction.variantRelation && (
                          <Text className="yao-analysis-variant">
                            与变卦：{interaction.variantRelation}
                          </Text>
                        )}
                      </View>
                    )
                  })}
                </View>
              )
            })()}
          </View>
        </View>
      )}

      {/* 保存和列表按钮：仅在非历史模式显示 */}
      {!isLoadingHistory && (
        <View style={{ margin: '20px 16px', display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '20px' }}>
          <Button
            onClick={() => {
              const { saveCurrentCase } = useLiuyaoStore.getState()
              const doSave = () => {
                const id = saveCurrentCase()
                Taro.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
                return id
              }

              if (!question.trim()) {
                Taro.showModal({
                  title: '提示',
                  content: '求测事项为空，确认仍要保存吗？',
                  confirmText: '保存',
                  cancelText: '取消',
                  success: (res) => {
                    if (res.confirm) doSave()
                  }
                })
              } else {
                doSave()
              }
            }}
            disabled={!result}
            className="btn-save-case"
          >
            保存卦例
          </Button>
          <Button
            onClick={() => {
              Taro.navigateTo({ url: '/pages/LiuyaoHistory/index' })
            }}
            className="btn-view-history"
          >
            查看历史
          </Button>
        </View>
      )}

      {isLoadingHistory && (
        <View style={{ margin: '20px 16px', display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '20px' }}>
          <Button
            onClick={() => {
              Taro.navigateTo({ url: '/pages/LiuyaoHistory/index' })
            }}
            className="btn-view-history"
          >
            查看历史
          </Button>
        </View>
      )}
    </View>
  )
}

export default LiuyaoPage
