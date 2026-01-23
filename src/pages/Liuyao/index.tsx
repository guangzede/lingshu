import React from 'react'
import { View, Text, Button, Picker } from '@tarojs/components'
import THEME from '@/constants/theme'
import { useLiuyaoStore } from '@/store/liuyao'
import './index.scss'
import { getBranchOrder } from '@/services/liuyao'

// 六爻排盘页面：调用 store 管理行、时间与结果
const LiuyaoPage: React.FC = () => {
  const {
    lines,
    result,
    dateValue,
    timeValue,
    setLineState,
    toggleYang,
    toggleMoving,
    setDateValue,
    setTimeValue,
    compute,
    reset
  } = useLiuyaoStore((s) => s)

  const [mode, setMode] = React.useState<'manual' | 'count' | 'auto'>('manual')

  const todayStr = React.useMemo(() => {
    const now = new Date()
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const getYaoState = (y: any) => {
    if (y.isYang && y.isMoving) return { name: '太阳', cls: 'yang moving' }
    if (y.isYang && !y.isMoving) return { name: '少阳', cls: 'yang' }
    if (!y.isYang && y.isMoving) return { name: '太阴', cls: 'yin moving' }
    return { name: '少阴', cls: 'yin' }
  }

  const formatFuShen = (fs?: any) => {
    if (!fs) return '--'
    const rel = fs.relation || ''
    const sb = `${fs.stem || ''}${fs.branch || ''}`
    return `${rel}${sb}` || '--'
  }

  const [reverse, setReverse] = React.useState(false)

  const HexagramTable: React.FC<{ base: any[]; variant: any[]; baseHex: any; variantHex: any; reverse?: boolean }> = ({ base, variant, baseHex, variantHex, reverse }) => (
    <View className="hexagram-table">
      <View className="hex-row hex-names">
        <Text className="hex-names-left">{baseHex?.name || '--'}</Text>
        <Text className="separator" />
        <Text className="hex-names-right">{variantHex?.name || '--'}</Text>
      </View>
      <View className="hex-row hex-header">
        <Text>六神</Text>
        <Text>伏神</Text>
        <Text></Text>
        <Text>六亲</Text>
        <Text>纳甲</Text>
        <Text />
        <Text />
        <Text className="separator" />
        <Text />
        <Text>六亲</Text>
        <Text>纳甲</Text>
        <Text />
        <Text />
      </View>
      {(reverse ? [5,4,3,2,1,0] : [0,1,2,3,4,5]).map((i) => {
        const y = base[i] || {}
        const v = variant[i] || {}
        const state = getYaoState(y)
        const variantCls = v.isYang ? 'yang' : 'yin'
        const baseShi = baseHex?.shiIndex === i
        const baseYing = baseHex?.yingIndex === i
        const variantShi = variantHex?.shiIndex === i
        const variantYing = variantHex?.yingIndex === i
        return (
          <View key={i} className="hex-row">
            <Text>{y.sixGod || '--'}</Text>
            <Text>{formatFuShen(y.fuShen)}</Text>
            <View className="yao-line">
              <View className={`yao-bar ${state.cls}`} />
            </View>
            <Text>{y.relation || '--'}</Text>
            <Text>{`${y.stem || ''}${y.branch || ''}` || '--'}</Text>
            <Text>{y.fiveElement || '--'}</Text>
            <Text>{baseShi ? '世' : baseYing ? '应' : ''}</Text>
            <Text className="separator" />
            <View className="yao-line">
              <View className={`yao-bar ${variantCls}`} />
            </View>
            <Text>{v.relation || '--'}</Text>
            <Text>{`${v.stem || ''}${v.branch || ''}` || '--'}</Text>
            <Text>{v.fiveElement || '--'}</Text>
            <Text>{variantShi ? '世' : variantYing ? '应' : ''}</Text>
          </View>
        )
      })}
    </View>
  )

  const labelOrder = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻']

  return (
    <View className="liuyao-page">
      <Text style={{ fontSize: '18px', fontWeight: 'bold', color: THEME.Gold }}>六爻排盘</Text>

      <View className="mode-row">
        <Button size="mini" className={mode === 'manual' ? 'btn-active' : ''} onClick={() => setMode('manual')}>手动输入</Button>
        <Button size="mini" className={mode === 'count' ? 'btn-active' : ''} onClick={() => setMode('count')}>报数起卦</Button>
        <Button size="mini" className={mode === 'auto' ? 'btn-active' : ''} onClick={() => setMode('auto')}>自动排盘</Button>
        <Button size="mini" onClick={reset}>重置</Button>
      </View>

      {/* 输入区 */}
      <View style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <View style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Text>日期</Text>
          <Picker mode="date" value={dateValue} end={todayStr} onChange={(e) => setDateValue(e.detail.value)}>
            <View style={{ padding: '6px 10px', border: '1px solid #444', borderRadius: '6px' }}>{dateValue}</View>
          </Picker>
          <Text>时间</Text>
          <Picker mode="time" value={timeValue} onChange={(e) => setTimeValue(e.detail.value)}>
            <View style={{ padding: '6px 10px', border: '1px solid #444', borderRadius: '6px' }}>{timeValue}</View>
          </Picker>
        </View>
        {labelOrder.map((label, displayIndex) => {
          const realIndex = lines.length - 1 - displayIndex
          const l = lines[realIndex] || {}
          return (
            <View key={label} className="line-item">
              <Text className="line-label">{label}</Text>
              <Button size="mini" className={l.isYang && l.isMoving ? 'btn-active' : ''} onClick={() => setLineState(realIndex, 'taiyang')}>太阳</Button>
              <Button size="mini" className={l.isYang && !l.isMoving ? 'btn-active' : ''} onClick={() => setLineState(realIndex, 'shaoyang')}>少阳</Button>
              <Button size="mini" className={!l.isYang && !l.isMoving ? 'btn-active' : ''} onClick={() => setLineState(realIndex, 'shaoyin')}>少阴</Button>
              <Button size="mini" className={!l.isYang && l.isMoving ? 'btn-active' : ''} onClick={() => setLineState(realIndex, 'taiyin')}>太阴</Button>
            </View>
          )
        })}
        <View style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <Button onClick={compute} style={{ flex: 1, backgroundColor: THEME.Gold }}>排盘</Button>
          <Button onClick={reset} style={{ flex: 1, backgroundColor: '#444' }}>重置</Button>
        </View>
      </View>

      {/* 结果区 */}
      {result && (
        <View style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <View style={{ padding: '10px', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Text style={{ color: THEME.Gold, fontWeight: 'bold' }}>年月日时</Text>
            <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Text>公历：{dateValue} {timeValue}</Text>
              <Text>年：{result.timeGanZhi.year.stem}{result.timeGanZhi.year.branch}</Text>
              <Text>月：{result.timeGanZhi.month.stem}{result.timeGanZhi.month.branch}</Text>
              <Text>日：{result.timeGanZhi.day.stem}{result.timeGanZhi.day.branch}</Text>
              <Text>时：{result.timeGanZhi.hour.stem}{result.timeGanZhi.hour.branch}</Text>
              <Text>农历：{result.lunar.year}年{result.lunar.month}月{result.lunar.day}日</Text>
              {result.lunar.jieQi && <Text>节气：{result.lunar.jieQi}</Text>}
            </View>
            <Text style={{ color: THEME.Gold, fontWeight: 'bold' }}>神煞（日上查）</Text>
            <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Text>桃花：{result.shenSha.桃花}</Text>
              <Text>驿马：{result.shenSha.驿马}</Text>
              <Text>文昌：{result.shenSha.文昌}</Text>
              <Text>禄神：{result.shenSha.禄神}</Text>
            </View>
          </View>

          <View style={{ padding: '10px', border: '1px solid #333', borderRadius: '8px' }}>
            <Text style={{ color: THEME.NeonCyan, fontWeight: 'bold' }}>本卦/变卦对照（变卦无六神）</Text>
            <Text>{result.hex.name} · 卦宫：{result.hex.palace} · {result.hex.palaceCategory || ''} {result.youHun ? '· 游魂' : ''}{result.guiHun ? '· 归魂' : ''}</Text>
            <Text>{result.variant.name} · 卦宫：{result.variant.palace} · {result.variant.palaceCategory || ''}</Text>
            <Text style={{ color: '#aaa' }}>说明：六亲以卦宫五行为“我”，按每爻地支五行生克判定（无支则回退天干）。</Text>
            <View style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
              <Text style={{ color: '#ccc' }}>本卦地支序（自下至上）：{getBranchOrder(result.hex, result.rule).join(' ')}</Text>
              <Text style={{ color: '#ccc' }}>变卦地支序（自下至上）：{getBranchOrder(result.variant, result.rule).join(' ')}</Text>
              <Button size="mini" onClick={() => setReverse(r => !r)}>
                {reverse ? '下→上显示' : '上→下显示'}
              </Button>
            </View>
            <HexagramTable base={result.yaos} variant={result.variantYaos || result.variant.yaos} baseHex={result.hex} variantHex={result.variant} reverse={reverse} />
          </View>
        </View>
      )}
    </View>
  )
}

export default LiuyaoPage
