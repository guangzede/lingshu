import React from 'react'
import { View, Text, Button, Picker, Input } from '@tarojs/components'
import THEME from '@/constants/theme'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'
import { analyzeBranchRelation, analyzeYaoInteractions } from '@/services/liuyao'
import { HexagramTable } from './components/HexagramTable'
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
    setLineState,
    setDateValue,
    setTimeValue,
    compute
  } = useLiuyaoStore((s) => s)

  const [mode, setMode] = React.useState<PaipanMode>('manual')
  const [countNumbers, setCountNumbers] = React.useState('')

  const todayStr = React.useMemo(() => {
    const now = new Date()
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const { handlePaipan } = usePaipan({ mode, countNumbers, setLineState, compute })

  return (
    <View className="liuyao-page">
      <Text style={{ fontSize: '18px', fontWeight: 'bold', color: THEME.Gold }}>六爻排盘</Text>

      <View className="mode-row">
        <Button size="mini" className={mode === 'manual' ? 'btn-active' : ''} onClick={() => setMode('manual')}>手动输入</Button>
        <Button size="mini" className={mode === 'count' ? 'btn-active' : ''} onClick={() => setMode('count')}>报数起卦</Button>
        <Button size="mini" className={mode === 'auto' ? 'btn-active' : ''} onClick={() => setMode('auto')}>自动排盘</Button>
      </View>

      {/* 输入区 */}
      <View className="input-section">
        <View className="datetime-row">
          <Text className="input-label" style={{ fontSize: '15px' }}>日期</Text>
          <Picker mode="date" value={dateValue} end={todayStr} onChange={(e) => setDateValue(e.detail.value)}>
            <View className="picker-box">{dateValue}</View>
          </Picker>
          <Text className="input-label" style={{ fontSize: '15px' }}>时间</Text>
          <Picker mode="time" value={timeValue} onChange={(e) => setTimeValue(e.detail.value)}>
            <View className="picker-box">{timeValue}</View>
          </Picker>
        </View>

        {mode === 'count' && (
          <View className="count-input-section">
            <Text className="input-label" style={{ fontSize: '15px' }}>请输入数字（梅花易数起卦）：</Text>
            <Input
              className="number-input"
              type="number"
              value={countNumbers}
              placeholder="输入任意长度数字"
              style={{ fontSize: '15px' }}
              onInput={(e) => setCountNumbers(e.detail.value)}
            />
          </View>
        )}

        {mode === 'manual' && YAO_LABEL_ORDER.map((label, displayIndex) => {
          const realIndex = lines.length - 1 - displayIndex
          const l = lines[realIndex] || {}
          return (
            <View key={label} className="line-item">
              <Text className="line-label">{label}</Text>
              <Button size="mini" className={`yao-btn ${l.isYang && l.isMoving ? 'yao-btn-active' : ''}`} onClick={() => setLineState(realIndex, 'taiyang')}>太阳</Button>
              <Button size="mini" className={`yao-btn ${l.isYang && !l.isMoving ? 'yao-btn-active' : ''}`} onClick={() => setLineState(realIndex, 'shaoyang')}>少阳</Button>
              <Button size="mini" className={`yao-btn ${!l.isYang && !l.isMoving ? 'yao-btn-active' : ''}`} onClick={() => setLineState(realIndex, 'shaoyin')}>少阴</Button>
              <Button size="mini" className={`yao-btn ${!l.isYang && l.isMoving ? 'yao-btn-active' : ''}`} onClick={() => setLineState(realIndex, 'taiyin')}>太阴</Button>
            </View>
          )
        })}

        <View className="action-buttons">
          <Button onClick={handlePaipan} className="btn-compute">排盘</Button>
        </View>
      </View>

      {/* 结果区 */}
      {result && (
        <View style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <View style={{ padding: '10px', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{dateValue} {timeValue}</Text>
              <Text>{result.lunar.month}月{result.lunar.day}日{result.lunar.jieQi ? `（${result.lunar.jieQi}）` : ''}</Text>
            </View>
            <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Text>{result.timeGanZhi.year.stem}{result.timeGanZhi.year.branch}</Text>
              <Text>{result.timeGanZhi.month.stem}{result.timeGanZhi.month.branch}</Text>
              <Text>{result.timeGanZhi.day.stem}{result.timeGanZhi.day.branch}</Text>
              <Text>{result.timeGanZhi.hour.stem}{result.timeGanZhi.hour.branch}</Text>
              <Text style={{ color: '#ff6b6b' }}>旬空：{result.xunKong[0]} {result.xunKong[1]}</Text>
            </View>
            <View style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Text>天乙贵人：{Array.isArray(result.shenSha.天乙贵人) ? result.shenSha.天乙贵人.join('、') : result.shenSha.天乙贵人}</Text>
              <Text>桃花：{result.shenSha.桃花}</Text>
              <Text>驿马：{result.shenSha.驿马}</Text>
              <Text>禄神：{result.shenSha.禄神}</Text>
              <Text>文昌贵人：{result.shenSha.文昌贵人}</Text>
              <Text>将星：{result.shenSha.将星}</Text>
              <Text>华盖：{result.shenSha.华盖}</Text>
              <Text>天医：{result.shenSha.天医}</Text>
              <Text>咸池：{result.shenSha.咸池}</Text>
              <Text>孤辰：{result.shenSha.孤辰}</Text>
              <Text>寡宿：{result.shenSha.寡宿}</Text>
            </View>
          </View>

          <View className="result-card">
            <Text className="card-title">本卦/变卦对照（变卦无六神）</Text>
            <Text className="hex-info">{result.hex.name} · 卦宫：{result.hex.palace} · {result.hex.palaceCategory || ''} {result.youHun ? '· 游魂' : ''}{result.guiHun ? '· 归魂' : ''}</Text>
            <Text className="hex-info">{result.variant.name} · 卦宫：{result.variant.palace} · {result.variant.palaceCategory || ''}</Text>
            <Text className="description-text">说明：六亲以卦宫五行为"我"，按每爻地支五行生克判定（无支则回退天干）。</Text>            {(() => {
              const allRelations = new Set(['父母', '官鬼', '子孙', '妻财', '兄弟'])
              const existingRelations = new Set(result.yaos.map((y: any) => y.relation).filter(Boolean))
              const missingRelations = Array.from(allRelations).filter(r => !existingRelations.has(r))

              if (missingRelations.length > 0) {
                const fushenLines = result.yaos
                  .map((y: any, i: number) => ({ y, i }))
                  .filter(({ y }: any) => y.fuShen && missingRelations.includes(y.fuShen.relation || ''))

                if (fushenLines.length > 0) {
                  return (
                    <View className="fushen-notice">
                      <Text className="fushen-title">缺失六亲及伏神：</Text>
                      <View className="fushen-list">
                        {fushenLines.map(({ y, i }: any) => (
                          <Text key={i} className="fushen-text">
                            {['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i]}：{y.fuShen?.relation || ''}{y.fuShen?.stem || ''}{y.fuShen?.branch || ''}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )
                }
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
                <View style={{ marginTop: '12px', padding: '10px', border: '1px solid #555', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
                  <Text style={{ color: THEME.Gold, fontWeight: 'bold', marginBottom: '10px' }}>日支/时支与本卦地支关系</Text>

                  {/* 日支关系 */}
                  <View style={{ marginBottom: '12px' }}>
                    <Text style={{ color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>日支分析：</Text>
                    {dayRelations.map((rel, idx) => {
                      if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
                      const relationStr = formatRelation(rel)
                      return (
                        <Text key={idx} style={{ fontSize: '12px', color: '#ddd', marginBottom: '4px', lineHeight: 1.6 }}>
                          ({dayBranch})({rel.branch}) {relationStr} · {labelMap[idx]}
                        </Text>
                      )
                    })}
                  </View>

                  {/* 时支关系 */}
                  <View>
                    <Text style={{ color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>时支分析：</Text>
                    {hourRelations.map((rel, idx) => {
                      if (!rel.isHarmony && !rel.isClash && !rel.isTriple && !rel.isPunish) return null
                      const relationStr = formatRelation(rel)
                      return (
                        <Text key={idx} style={{ fontSize: '12px', color: '#ddd', marginBottom: '4px', lineHeight: 1.6 }}>
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
                <View style={{ marginTop: '12px', padding: '10px', border: '1px solid #555', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
                  <Text style={{ color: THEME.Gold, fontWeight: 'bold', marginBottom: '10px' }}>六爻详细分析</Text>

                  {interactions.map((interaction) => {
                    const yao = result.yaos[interaction.yaoIndex] as YaoData
                    const isMoving = yao?.isMoving
                    const seasonStrength = yao?.seasonStrength || ''
                    const changsheng = yao?.changsheng || ''
                    const analysis = yaoAnalyses[interaction.yaoIndex]

                    return (
                      <View key={interaction.yaoIndex} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #444' }}>
                        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                            {interaction.yaoLabel} {interaction.yaoInfo}
                            {isMoving ? <Text style={{ color: '#ff9800' }}>（动爻）</Text> : null}
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#aaa' }}>
                            {seasonStrength ? `${seasonStrength}` : ''}{seasonStrength && changsheng ? ' · ' : ''}{changsheng}
                          </Text>
                        </View>

                        {/* 动爻分析：以当前动爻为主语 */}
                        {isMoving && analysis && analysis.relations.length > 0 && (
                          <Text style={{ fontSize: '11px', color: '#bbb', marginBottom: '6px', lineHeight: 1.8 }}>
                            {analysis.yaoBranch}{analysis.yaoWuxing}：{analysis.relations.join('，')}
                          </Text>
                        )}

                        {/* 与变卦同位爻的关系（仅动爻显示） */}
                        {isMoving && interaction.variantRelation && (
                          <Text style={{ fontSize: '11px', color: '#bbb' }}>
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
    </View>
  )
}

export default LiuyaoPage
