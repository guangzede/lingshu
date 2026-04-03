/**
 * 灵枢项目 - 通用 Hooks
 */

import React from 'react'

/**
 * Canvas 初始化 Hook
 */
export function useCanvasInit(canvasId: string) {
  const canvasRef = React.useRef<any>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const init = async () => {
      try {
        const query = Taro.createSelectorQuery()
        query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res: any) => {
          const data = res?.[0]
          if (data && data.node) {
            canvasRef.current = data.node
            ctxRef.current = data.node.getContext('2d')
          } else {
            setError('Canvas node not found')
          }
        })
      } catch (e) {
        setError('Failed to initialize canvas')
      }
    }

    init()
  }, [canvasId])

  return { canvasRef, ctxRef, error }
}

/**
 * 动画帧 Hook
 */
export function useAnimationFrame(callback: (deltaTime: number) => void, isRunning: boolean) {
  const frameRef = React.useRef<number | null>(null)
  const lastTimeRef = React.useRef<number>(0)

  React.useEffect(() => {
    if (!isRunning) return

    const animate = (time: number) => {
      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time
      callback(deltaTime)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [callback, isRunning])
}

/**
 * 状态管理 Hook
 */
export function useStateWithCallback<T>(
  initialState: T,
  callback: (state: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState(initialState)

  React.useEffect(() => {
    callback(state)
  }, [state, callback])

  return [state, setState]
}
