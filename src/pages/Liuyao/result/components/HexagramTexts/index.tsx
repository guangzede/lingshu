import React from 'react'
import { View, Text } from '@tarojs/components'
import type { LiuyaoResult } from '../../../types'
import { getHexagramTexts, getYaoObjectsReversed, getYongTexts } from '@/utils/hexagramYao'
import './index.scss'

interface HexagramTextsProps {
  result: LiuyaoResult
}

const YAO_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

type ActiveHex = 'base' | 'variant'

const HexagramTexts: React.FC<HexagramTextsProps> = ({ result }) => {
  const baseName = result?.hexagramTable?.baseHeader?.name || result?.hex?.name
  const variantName = result?.hexagramTable?.variantHeader?.name || result?.variant?.name

  const hasBase = !!baseName
  const hasVariant = !!variantName

  const [active, setActive] = React.useState<ActiveHex>('base')

  React.useEffect(() => {
    if (!hasBase && hasVariant && active !== 'variant') {
      setActive('variant')
      return
    }
    if (!hasVariant && active === 'variant') {
      setActive('base')
    }
  }, [hasBase, hasVariant, active])

  if (!hasBase && !hasVariant) {
    return (
      <View className='glass-card hex-texts-card'>
        <View className='hex-texts-header'>
          <View className='card-header'>
            <View className='hex-texts-title-wrap'>
              <Text className='card-section-title'>卦词·象曰·爻辞</Text>
              <Text className='card-section-guide'>暂无卦象</Text>
            </View>
          </View>
        </View>
        <View className='hex-texts-body'>
          <Text className='hex-texts-empty'>暂无卦辞数据，请先完成排盘</Text>
        </View>
      </View>
    )
  }

  const currentName = active === 'variant' ? variantName : baseName
  if (!currentName) return null

  const texts = getHexagramTexts(currentName)
  const yaoItems = getYaoObjectsReversed(currentName)
  const yongItems = getYongTexts(currentName)
  const tuan = (texts.tuan || '').trim()
  const xiang = (texts.xiang || '').trim()

  return (
    <View className='glass-card hex-texts-card'>
      <View className='hex-texts-header'>
        <View className='card-header'>
          <View className='hex-texts-title-wrap'>
            <Text className='card-section-title'>卦词·象曰·爻辞</Text>
            <Text className='card-section-guide'>{currentName}</Text>
          </View>
        </View>
        <View className='hex-texts-tabs'>
          {hasBase && (
            <View
              className={`hex-texts-tab ${active === 'base' ? 'active' : ''}`}
              onClick={() => setActive('base')}
            >
              <Text>本卦</Text>
            </View>
          )}
          {hasVariant && (
            <View
              className={`hex-texts-tab ${active === 'variant' ? 'active' : ''}`}
              onClick={() => setActive('variant')}
            >
              <Text>变卦</Text>
            </View>
          )}
        </View>
      </View>

      <View className='hex-texts-body'>
        <View className='hex-texts-block'>
          <Text className='hex-texts-block-title'>卦词</Text>
          <Text className='hex-texts-block-content'>
            {tuan || `暂无卦词：${currentName}`}
          </Text>
        </View>

        <View className='hex-texts-block'>
          <Text className='hex-texts-block-title'>象曰</Text>
          <Text className='hex-texts-block-content'>
            {xiang || `暂无象曰：${currentName}`}
          </Text>
        </View>

        <View className='hex-texts-block'>
          <Text className='hex-texts-block-title'>爻辞</Text>
          <View className='hex-texts-yao-list'>
            {yaoItems.length > 0 ? (
              yaoItems.map((item, index) => (
                <View key={`${currentName}-${index}`} className='hex-texts-yao-item'>
                  <Text className='hex-texts-yao-label'>
                    {YAO_LABELS[index] || `第${index + 1}爻`}
                  </Text>
                  <Text className='hex-texts-yao-text'>
                    {item.text || `暂无爻辞：${currentName}`}
                  </Text>
                  {item.marker && (
                    <Text className='hex-texts-yao-marker'>{item.marker}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text className='hex-texts-empty'>暂无爻辞</Text>
            )}
            {yongItems.map((text, index) => (
              <View key={`${currentName}-yong-${index}`} className='hex-texts-yao-item hex-texts-yong-item'>
                <Text className='hex-texts-yao-label'>用爻</Text>
                <Text className='hex-texts-yao-text'>{text}</Text>
                <Text className='hex-texts-yao-marker'>
                  {text.includes('用九') ? '用九' : text.includes('用六') ? '用六' : '用爻'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default HexagramTexts
