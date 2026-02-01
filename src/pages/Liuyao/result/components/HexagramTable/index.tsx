import React from 'react'
import { View, Text } from '@tarojs/components'
import type { YaoData, HexData } from '../../types'
import './index.scss'

interface HexagramTableProps {
  base: YaoData[]
  variant: YaoData[]
  baseHex: HexData
  variantHex: HexData
}

export const HexagramTable: React.FC<HexagramTableProps> = ({ base, variant, baseHex, variantHex }) => {
  const getYaoState = (y: YaoData) => {
    const isYang = y.isYang !== undefined ? y.isYang : true
    const isMoving = y.isMoving || false
    let cls = isYang ? 'yang' : 'yin'
    if (isMoving) cls += ' moving'
    return { cls }
  }

  return (
    <View className="hexagram-table">
      <View className="table-header">
        <View className="header-left">
          <Text className="hex-name">{baseHex?.name || '本卦'}</Text>
          <Text className="section-title">本卦·{baseHex?.palace || ''}·{baseHex?.palaceCategory || ''}</Text>
        </View>
        <View className="header-right">
          <Text className="hex-name">{variantHex?.name || '变卦'}</Text>
          <Text className="section-title">变卦·{variantHex?.palace || ''}·{variantHex?.palaceCategory || ''}</Text>
        </View>
      </View>
      <View className="table-subheader">
        <View className="subheader-left">
          <Text className="col-label">六神</Text>
          <Text className="col-label">伏神</Text>
          <Text className="col-label">六亲</Text>
          <Text className="col-label">爻</Text>
          <Text className="col-label">五行</Text>
          <Text className="col-label">世应</Text>
        </View>
        <View className="subheader-right">
          <Text className="col-label">六亲</Text>
          <Text className="col-label">爻</Text>
          <Text className="col-label">五行</Text>
          <Text className="col-label">世应</Text>
        </View>
      </View>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = base[i] || {}
        const v = variant[i] || {}
        const state = getYaoState(y)
        const variantState = getYaoState(v)
        const baseShi = baseHex?.shiIndex === i
        const baseYing = baseHex?.yingIndex === i
        const variantShi = variantHex?.shiIndex === i
        const variantYing = variantHex?.yingIndex === i
        return (
          <View key={i} className="table-row">
            <View className="row-left">
              <Text className="cell">{y.sixGod || '--'}</Text>
              <Text className="cell fushen-cell">
                {y.fuShen ? `${y.fuShen.relation || ''}${y.fuShen.stem || ''}${y.fuShen.branch || ''}` : ''}
              </Text>
              <Text className="cell">{(y.relation || '--')}{y.stem || ''}{y.branch || ''}</Text>
              <View className="cell yao-cell">
                <View className={`yao-bar ${state.cls}`} />
              </View>
              <Text className="cell">{y.fiveElement || '--'}</Text>
              <Text className="cell">{baseShi ? '世' : baseYing ? '应' : ''}</Text>
            </View>
            <View className="row-right">
              <Text className="cell">{(v.relation || '--')}{v.stem || ''}{v.branch || ''}</Text>
              <View className="cell yao-cell">
                <View className={`yao-bar ${variantState.cls}`} />
              </View>
              <Text className="cell">{v.fiveElement || '--'}</Text>
              <Text className="cell">{variantShi ? '世' : variantYing ? '应' : ''}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}


export default HexagramTable