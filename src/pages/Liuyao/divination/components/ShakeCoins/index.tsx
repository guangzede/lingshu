import React from 'react'
import { View, Button, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import coinFront from '@/assets/coins/coin-front.svg'
import coinBack from '@/assets/coins/coin-back.svg'
import type { LineState } from '../../../types'

interface ShakeCoinsProps {
  step: number
  lines: LineState[]
  disabled?: boolean
  onDone: (yaoValue: 6 | 7 | 8 | 9) => void
}

interface CoinSpinState {
  id: number
  angle: number
  duration: number
  delay: number
  tossing: boolean
}

const normalizeAngle = (deg: number) => {
  const m = deg % 360
  return m < 0 ? m + 360 : m
}

const settleAngle = (deg: number) => {
  const current = normalizeAngle(deg)
  return current >= 90 && current < 270 ? 180 : 0
}

const buildInitialCoins = (): CoinSpinState[] => [0, 1, 2].map((id) => ({
  id,
  angle: 0,
  duration: 0,
  delay: 0,
  tossing: false
}))

const YAO_LABELS = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻']

// 纯 CSS + JS 实现：三枚铜板绕 Y 轴旋转，替代 Canvas，提升端兼容性
export const ShakeCoins: React.FC<ShakeCoinsProps> = ({ step, lines, disabled, onDone }) => {
  const [coins, setCoins] = React.useState<CoinSpinState[]>(() => buildInitialCoins())
  const [isShaking, setIsShaking] = React.useState(false)

  const coinsRef = React.useRef<CoinSpinState[]>(coins)
  const finishTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    coinsRef.current = coins
  }, [coins])

  React.useEffect(() => {
    return () => {
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current)
      }
    }
  }, [])

  const finishShake = React.useCallback((yaoValue: 6 | 7 | 8 | 9) => {
    setCoins((prev) => prev.map((coin) => ({
      ...coin,
      tossing: false,
      duration: 0,
      delay: 0,
      angle: settleAngle(coin.angle)
    })))
    setIsShaking(false)
    onDone(yaoValue)
  }, [onDone])

  const startShake = React.useCallback(() => {
    if (isShaking || disabled) return

    const faceResults = [0, 1, 2].map(() => Math.random() >= 0.5)
    const total = faceResults.reduce<number>((sum, isFront) => sum + (isFront ? 2 : 3), 0)
    const yaoValue: 6 | 7 | 8 | 9 = total === 6 || total === 7 || total === 8 ? total : 9

    const nextCoins = coinsRef.current.map((coin, idx) => {
      const currentAngle = settleAngle(coin.angle)
      const extraTurns = 6 + Math.floor(Math.random() * 5)
      const targetFace = faceResults[idx] ? 0 : 180
      const targetDelta = targetFace - currentAngle
      const duration = 960 + Math.floor(Math.random() * 460)
      const delay = idx * 85 + Math.floor(Math.random() * 70)
      return {
        ...coin,
        angle: currentAngle + extraTurns * 360 + targetDelta,
        duration,
        delay,
        tossing: true
      }
    })

    const totalDuration = Math.max(...nextCoins.map((coin) => coin.duration + coin.delay))

    setIsShaking(true)
    setCoins(nextCoins)

    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current)
    }
    finishTimerRef.current = setTimeout(() => {
      finishShake(yaoValue)
    }, totalDuration + 120)
  }, [disabled, finishShake, isShaking])

  // 设备摇一摇触发
  React.useEffect(() => {
    let last = 0
    const threshold = 1.6
    const cooldown = 900

    const handler = (res: any) => {
      if (disabled || isShaking) return
      const g = Math.sqrt(res.x * res.x + res.y * res.y + res.z * res.z)
      const now = Date.now()
      if (g > threshold && now - last > cooldown) {
        last = now
        startShake()
      }
    }

    const canAccel = typeof (Taro as any).onAccelerometerChange === 'function'
    if (!canAccel) return

    try {
      // @ts-ignore taro typing may differ by end
      Taro.startAccelerometer?.({ interval: 'game' })
    } catch (e) {
      // ignore
    }

    // @ts-ignore
    Taro.onAccelerometerChange(handler)

    return () => {
      // @ts-ignore
      Taro.offAccelerometerChange?.(handler)
      try {
        // @ts-ignore
        Taro.stopAccelerometer?.()
      } catch (e) {
        // ignore
      }
    }
  }, [disabled, isShaking, startShake])

  return (
    <View className='shake-coins'>
      <Text className='shake-tip'>
        摇卦：点击「摇一摇」六次，依次生成自下而上的六爻
      </Text>

      <View className='coins-stage'>
        <View className='coins-row'>
          {coins.map((coin) => (
            <View
              key={coin.id}
              className={`coin-shell ${coin.tossing ? 'is-tossing' : ''}`}
              style={{
                animationDuration: `${coin.duration}ms`,
                animationDelay: `${coin.delay}ms`
              }}
            >
              <View
                className='coin-inner'
                style={{
                  transform: `rotateY(${coin.angle}deg)`,
                  transitionDuration: `${coin.duration}ms`,
                  transitionDelay: `${coin.delay}ms`
                }}
              >
                <Image className='coin-face coin-face-front' src={coinFront} mode='aspectFit' />
                <Image className='coin-face coin-face-back' src={coinBack} mode='aspectFit' />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className='shake-runtime'>
        <View className='shake-runtime-half shake-runtime-half-lines'>
          <View className='shake-lines'>
            <Text className='shake-lines-title'>当前摇卦（自下而上）</Text>
            <View className='shake-lines-board'>
              {YAO_LABELS.map((label, index) => {
                const isGenerated = step > (5 - index)
                const line = lines[index]
                return (
                  <View key={label} className='shake-line-row'>
                    <Text className='shake-line-label'>{label}</Text>
                    <View className={`shake-line-symbol ${isGenerated ? '' : 'is-pending'}`}>
                      {isGenerated ? (
                        <>
                          {line?.isYang ? (
                            <View className='shake-line-yang'>
                              <View className='line-segment full' />
                            </View>
                          ) : (
                            <View className='shake-line-yin'>
                              <View className='line-segment left' />
                              <View className='line-segment right' />
                            </View>
                          )}
                          {line?.isMoving && (
                            <Text className='shake-line-mark'>
                              {line?.isYang ? '○' : '×'}
                            </Text>
                          )}
                        </>
                      ) : (
                        <View className='shake-line-placeholder'>待摇</View>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {step < 6 && (
          <View className='shake-runtime-half shake-runtime-half-action'>
            <View className='shake-actions-card'>
              <View className='shake-action-copy'>
                <Text className='shake-action-title'>逐爻起卦</Text>
                <Text className='shake-action-desc'>
                  每次摇动三枚铜钱，依次生成一爻。
                </Text>
                <Text className='shake-action-next'>
                  当前进度：{step}/6，下一爻：{YAO_LABELS[5 - step]}
                </Text>
              </View>
              <View className='shake-action-cta'>
                <Text className='shake-action-cta-dot'>●</Text>
                <Text className='shake-action-cta-text'>请点击下方按钮完成本次摇卦</Text>
              </View>
              <View className={`shake-btn-wrap ${isShaking ? 'disabled' : 'is-float'}`}>
                <Button
                  size='default'
                  className={`btn-shake btn-shake-compact ${isShaking ? 'disabled' : 'is-attention'}`}
                  disabled={isShaking || disabled}
                  onClick={startShake}
                >
                  <View className='btn-shake-content'>
                    <Text className='btn-shake-main'>立即摇一摇</Text>
                    <Text className='btn-shake-step'>（{step + 1}/6）</Text>
                  </View>
                </Button>
              </View>
              <Text className='shake-action-footnote'>也可以轻晃手机触发摇卦</Text>
            </View>
          </View>
        )}
        {step >= 6 && (
          <View className='shake-runtime-half shake-runtime-half-action'>
            <View className='shake-ready-card'>
              <Text className='shake-ready-title'>六爻已成</Text>
              <Text className='shake-ready-desc'>请点击下方「开始排盘」进入结果页</Text>
            </View>
          </View>
        )}
      </View>

    </View>
  )
}

export default ShakeCoins
