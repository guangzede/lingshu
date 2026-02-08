import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '../../types'
import './index.scss'

interface HexagramTableProps {
  result: LiuyaoResult
}

export const HexagramTable: React.FC<HexagramTableProps> = ({ result }) => {
  const table = result.hexagramTable
  if (!table) return null

  return (
    <View className="hexagram-table">
      <View className="table-header">
        <View className="header-left">
          <Text className="hex-name">{table.baseHeader.name}</Text>
          <Text className="section-title">本卦·{table.baseHeader.palace}·{table.baseHeader.palaceCategory}</Text>
        </View>
        <View className="header-right">
          <Text className="hex-name">{table.variantHeader.name}</Text>
          <Text className="section-title">变卦·{table.variantHeader.palace}·{table.variantHeader.palaceCategory}</Text>
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
      {table.rows.map((row) => {
        return (
          <View key={row.index} className="table-row">
            <View className="row-left">
              <Text className="cell">{row.left.sixGod}</Text>
              <Text className="cell fushen-cell">
                {row.left.fuShen}
              </Text>
              <Text className="cell">{row.left.relation}</Text>
              <View className="cell yao-cell">
                <View className={`yao-bar ${row.left.yaoClass}`} />
              </View>
              <Text className="cell">{row.left.fiveElement}</Text>
              <Text className="cell">{row.left.shiYing}</Text>
            </View>
            <View className="row-right">
              <Text className="cell">{row.right.relation}</Text>
              <View className="cell yao-cell">
                <View className={`yao-bar ${row.right.yaoClass}`} />
              </View>
              <Text className="cell">{row.right.fiveElement}</Text>
              <Text className="cell">{row.right.shiYing}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}


export default HexagramTable
