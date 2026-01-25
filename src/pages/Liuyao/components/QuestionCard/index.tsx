'use client'

import React, { useState } from 'react'
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
  const [selections, setSelections] = useState<Selection[]>([])
  const [step, setStep] = useState<Step>(0)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState(value)

  // 当处于只读模式且有已保存的 value 时，解析并重建 selections
  React.useEffect(() => {
    if (readOnly && value && value.trim()) {
      // 解析 value 字符串（格式：label1 · label2 · label3）
      const labels = value.split(' · ').map(l => l.trim()).filter(l => l)
      
      if (labels.length > 0) {
        const newSelections: Selection[] = []
        
        // Step 0: 查找分类
        const category = WORD_TREE.category.find((c: any) => c.label === labels[0])
        if (category) {
          newSelections.push({
            step: 0,
            id: category.id,
            label: category.label,
            desc: category.desc
          })
          
          // Step 1: 查找详细场景
          if (labels[1]) {
            const categoryId = category.id as CategoryId
            const details = WORD_TREE.detail[categoryId]
            const detail = Array.isArray(details) 
              ? details.find((d: any) => d.label === labels[1])
              : null
            if (detail) {
              newSelections.push({
                step: 1,
                id: detail.id,
                label: detail.label,
                desc: detail.desc
              })
              
              // Step 2: 查找问题
              if (labels[2]) {
                const questions = WORD_TREE.question[categoryId] || WORD_TREE.question.common
                const question = Array.isArray(questions)
                  ? questions.find((q: any) => q.label === labels[2])
                  : null
                if (question) {
                  newSelections.push({
                    step: 2,
                    id: question.id,
                    label: question.label,
                    desc: question.desc
                  })
                }
              }
            }
          }
        }
        
        setSelections(newSelections)
        setStep((newSelections.length - 1) as Step)
      }
    }
  }, [readOnly, value])

  // 从只读模式切换回可编辑时，清空旧的选中状态
  React.useEffect(() => {
    if (!readOnly) {
      setSelections([])
      setStep(0)
      setManualInput(value)
    }
  }, [readOnly])

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
      const questions = categoryQuestions || WORD_TREE.question.common
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
    <View className="question-card-container">
      {/* ==================== Energy Core: Input Area ==================== */}
      <View className="glass-card question-card energy-core">
        <View className="card-header">
          <Text className="card-section-title">求测事项</Text>
          <Text className="card-section-guide">
            {readOnly 
              ? '📋 仅查看 - 已加载的卦例不可修改'
              : manualMode 
              ? '手动输入占卜内容'
              : isCompleted 
              ? '关键词已集合，可随时修改'
              : '点击泡泡组装问题'}
          </Text>
        </View>

        {/* Manual Input Mode */}
        {manualMode ? (
          <View className="manual-input-wrapper">
            <Input
              className="question-input manual"
              value={manualInput}
              placeholder="请输入占卜内容..."
              disabled={readOnly}
              style={{ height: '52px', lineHeight: '26px' }}
              onInput={(e) => handleManualInput(e.detail.value)}
            />
            <View
              onClick={() => !readOnly && setManualMode(false)}
              className="back-button"
              style={{ opacity: readOnly ? 0.5 : 1, cursor: readOnly ? 'not-allowed' : 'pointer' }}
            >
              返回选择
            </View>
          </View>
        ) : (
          <>
            {/* Selected Tags Container */}
            <View className="tags-container">
              {selections.map((selection, idx) => (
                <View
                  key={`tag-${selection.step}-${selection.id}`}
                  onClick={() => handleTagClick(idx)}
                  className="selected-tag"
                  style={{ opacity: readOnly ? 0.7 : 1, cursor: readOnly ? 'default' : 'pointer' }}
                >
                  <View className="tag-content">
                    <Text className="tag-text">{selection.label}</Text>
                    {selection.desc && (
                      <Text className="tag-desc">{selection.desc}</Text>
                    )}
                  </View>
                  {!readOnly && <Text className="tag-close">✕</Text>}
                </View>
              ))}

              {/* Placeholder dots when empty */}
              {selections.length === 0 && (
                <View className="placeholder-dots">
                  <View></View>
                  <View></View>
                  <View></View>
                </View>
              )}
            </View>

            {/* Manual Input Trigger Button */}
            {!isCompleted && !readOnly && (
              <View
                onClick={() => setManualMode(true)}
                className="manual-trigger-button"
              >
                手动输入
              </View>
            )}
          </>
        )}

        {/* ==================== Stardust Cloud: Keyword Selection ==================== */}
        {showCloud && (
          <View className="stardust-cloud">
            <View className="cloud-header">
              {step > 0 && (
                <View
                  onClick={() => {
                    setSelections(selections.slice(0, step - 1))
                    setStep((step - 1) as Step)
                  }}
                  className="back-arrow"
                >
                  ← 返回
                </View>
              )}
            </View>

            <View className="cloud-guide-text">点击下方泡泡继续组装问题</View>

            <View className="keywords-grid">
              {currentKeywords.map((keyword) => (
                <View
                  key={`keyword-${step}-${keyword.id}`}
                  onClick={() => handleKeywordClick(keyword)}
                  className="keyword-item"
                >
                  <View className="keyword-content">
                    <Text className="keyword-text">{keyword.label}</Text>
                    {keyword.desc && (
                      <Text className="keyword-desc">{keyword.desc}</Text>
                    )}
                  </View>
                  <View className="keyword-glow" />
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
