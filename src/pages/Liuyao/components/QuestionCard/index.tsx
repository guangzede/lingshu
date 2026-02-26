'use client'

import React, { useState } from 'react'
import { useLiuyaoStore } from '@/store/liuyao'
import { View, Text, Input } from '@tarojs/components'
import { WORD_TREE, type CategoryId } from '../../constants/questionTree'
import './style.scss'

interface QuestionCardProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

type Step = 0 | 1 | 2

interface Selection {
  step: Step
  id: string
  label: string
  desc?: string
}

const QuestionCard: React.FC<QuestionCardProps> = ({ value, onChange, readOnly = false }) => {
  const safeValue = typeof value === 'string' ? value : ''
  const [selections, setSelections] = useState<Selection[]>([])
  const [step, setStep] = useState<Step>(0)
  const manualMode = useLiuyaoStore((s) => s.manualMode)
  const setManualMode = useLiuyaoStore((s) => s.setManualMode)
  const [manualInput, setManualInput] = useState(safeValue)

  // 解析 value 并重建 selections：统一逻辑，非手动模式下均尝试从 value 回显标签
  React.useEffect(() => {

    if (manualMode) return

    if (!safeValue || !safeValue.trim()) {
      // 当 value 为空且非只读，保持空状态；若是只读则也保持空
      return
    }

    const labels = safeValue.split(' · ').map((l: string) => l.trim()).filter((l: string) => l)
    if (labels.length === 0) return

    const newSelections: Selection[] = []
    const category = WORD_TREE.category.find((c: any) => c.label === labels[0])
    if (category) {
      newSelections.push({ step: 0, id: category.id, label: category.label, desc: category.desc })

      if (labels[1]) {
        const categoryId = category.id as CategoryId
        const details = WORD_TREE.detail[categoryId]
        const detail = Array.isArray(details) ? details.find((d: any) => d.label === labels[1]) : null
        if (detail) {
          newSelections.push({ step: 1, id: detail.id, label: detail.label, desc: detail.desc })

          if (labels[2]) {
            const questions = WORD_TREE.question[categoryId]
            const question = Array.isArray(questions) ? questions.find((q: any) => q.label === labels[2]) : null
            if (question) {
              newSelections.push({ step: 2, id: question.id, label: question.label, desc: question.desc })
            }
          }
        }
      }
    }

    if (newSelections.length > 0) {
      setSelections(newSelections)
      setStep((newSelections.length - 1) as Step)
    }
  }, [safeValue, manualMode])

  // 从只读模式切换回可编辑时，仅更新手动输入初始值（不清空 selections，避免覆盖回显）
  React.useEffect(() => {
    if (!readOnly) {
      setManualInput(safeValue)
    }
  }, [readOnly, safeValue])

  // 当 global manualMode 切换为手动模式时，用当前 value 填充输入框（以便继续编辑）
  React.useEffect(() => {
    if (manualMode) {
      setManualInput(safeValue)
    }
  }, [manualMode, safeValue])

  // 获取当前步骤可用的关键词
  const getCurrentKeywords = (): readonly any[] => {
    if (step === 0) {
      // Step 0: 显示所有分类
      return WORD_TREE.category
    } else if (step === 1) {
      // Step 1: 根据选中的分类ID获取详细场景
      const categoryId = selections[0]?.id as CategoryId
      const details = WORD_TREE.detail[categoryId]
      return Array.isArray(details) ? details : []
    } else {
      // Step 2: 根据分类ID获取问题，没有则回退到 common
      const categoryId = selections[0]?.id as CategoryId
      const categoryQuestions = WORD_TREE.question[categoryId]
      const questions = categoryQuestions
      return Array.isArray(questions) ? questions : []
    }
  }

  const handleKeywordClick = (keyword: any) => {
    if (readOnly || !keyword?.id || !keyword?.label) return

    const newSelection: Selection = {
      step,
      id: keyword.id,
      label: keyword.label,
      desc: keyword.desc || undefined
    }

    const newSelections = selections.filter((s) => s.step < step)
    newSelections.push(newSelection)
    setSelections(newSelections)

    // 移动到下一步或完成
    if (step < 2) {
      setStep((step + 1) as Step)
    } else {
      // 已完成 - 构建查询字符串并触发回调
      const queryString = newSelections.map((s) => s.label).join(' · ')
      onChange(queryString)
    }
  }

  const handleTagClick = (indexToRemove: number) => {
    if (readOnly) return

    // 移除此标签及之后的所有标签
    const newSelections = selections.slice(0, indexToRemove)
    setSelections(newSelections)
    setStep((indexToRemove) as Step)

    // 重置手动输入或最终查询
    if (indexToRemove === 0) {
      onChange('')
      setManualInput('')
    } else {
      const queryString = newSelections.map((s) => s.label).join(' · ')
      onChange(queryString)
    }
  }

  const handleManualInput = (text: string) => {
    if (readOnly) return
    setManualInput(text)
    onChange(text)
  }

  const currentKeywords = getCurrentKeywords()
  const isCompleted = selections.length === 3
  const showCloud = !isCompleted && !manualMode && !readOnly

  return (
    <View className='question-card-container'>
      {/* ==================== Energy Core: Input Area ==================== */}
      <View className='glass-card question-card energy-core'>
        <View className='card-header'>
          <Text className='card-section-title'>决策主题</Text>
          {/* <Text className="card-section-guide">
            {readOnly
              ? '📋 仅查看 - 已加载的卦例不可修改'
              : manualMode
              ? '手动输入占卜内容'
              : isCompleted
              ? '关键词已集合，可随时修改'
              : '点击泡泡组装问题'}
          </Text> */}
        </View>

        {/*统一的输入组件*/}
        <View className='input-with-button'>
          {/*输入容器*/}
          <View className='input-container'>
            {/*根据 manualMode 状态渲染不同内容*/}
            <Input
              className={`question-input ${manualMode ? 'manual' : 'tags-mode'}`}
              value={manualMode ? manualInput : (selections.length > 0 ? selections.map(s => s.label).join(' · ') : safeValue)}
              placeholder={manualMode ? "请输入主题内容..." : "请选择关键词..."}
              disabled={readOnly || !manualMode}
              style={{ height: '52px', lineHeight: '26px', width: '100%' }}
              onInput={(e) => manualMode && handleManualInput(e.detail.value)}
            />

            {/*标签模式下的标签显示*/}
            {!manualMode && (
              <View className='tags-overlay'>
                {selections.map((selection, idx) => (
                  <View
                    key={`tag-${selection.step}-${selection.id}`}
                    onClick={() => handleTagClick(idx)}
                    className='selected-tag'
                    style={{ opacity: readOnly ? 0.7 : 1, cursor: readOnly ? 'default' : 'pointer' }}
                  >
                    <View className='tag-content'>
                      <Text className='tag-text'>{selection.label}</Text>
                      {selection.desc && (
                        <Text className='tag-desc'>{selection.desc}</Text>
                      )}
                    </View>
                    {!readOnly && <Text className='tag-close'>✕</Text>}
                  </View>
                ))}

                {/* When there are no constructed tags, show existing value or placeholder dots */}
                {selections.length === 0 && (
                  value && value.trim() ? (
                    <View
                      className='selected-tag existing-value'
                      onClick={() => !readOnly && setManualMode(true)}
                      style={{ cursor: readOnly ? 'default' : 'pointer' }}
                    >
                      <View className='tag-content'>
                        <Text className='tag-text'>{value}</Text>
                      </View>
                      {!readOnly && (
                        <Text
                          className='tag-close'
                          onClick={(e: any) => {
                            e?.stopPropagation?.()
                            onChange('')
                            setManualInput('')
                          }}
                        >
                          ✕
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View className='placeholder-dots'>
                      <View></View>
                      <View></View>
                      <View></View>
                    </View>
                  )
                )}
              </View>
            )}
          </View>

          {/*切换按钮*/}
          {!readOnly && (
            <View
              onClick={() => setManualMode(!manualMode)}
              className='input-button'
            >
              {manualMode ? '返回选择' : '添加备注'}
            </View>
          )}
        </View>

        {/* ==================== Stardust Cloud: Keyword Selection ==================== */}
        {showCloud && (
          <View className='stardust-cloud'>
            <View className='cloud-header'>
              {step > 0 && (
                <View
                  onClick={() => {
                    setSelections(selections.slice(0, step - 1))
                    setStep((step - 1) as Step)
                  }}
                  className='back-arrow'
                >
                  ← 返回
                </View>
              )}
            </View>

            <View className='cloud-guide-text'>点击下方泡泡组合最符合您的想法</View>

            <View className='keywords-grid'>
              {currentKeywords.map((keyword) => (
                <View
                  key={`keyword-${step}-${keyword.id}`}
                  onClick={() => handleKeywordClick(keyword)}
                  className='keyword-item'
                >
                  <View className='keyword-content'>
                    <Text className='keyword-text'>{keyword.label}</Text>
                    {keyword.desc && (
                      <Text className='keyword-desc'>{keyword.desc}</Text>
                    )}
                  </View>
                  <View className='keyword-glow' />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default QuestionCard
