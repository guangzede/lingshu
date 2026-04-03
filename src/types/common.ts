/**
 * 灵枢项目 - 通用类型定义
 */

// Canvas 相关类型
export interface CanvasContext {
  canvas: any
  getContext(type: '2d'): CanvasRenderingContext2D | null
}

export interface CanvasSize {
  width: number
  height: number
  pixelRatio: number
}

// Taro 相关类型
export interface TaroWindowInfo {
  pixelRatio: number
  windowWidth: number
  windowHeight: number
}

export interface TaroCanvasNode {
  node: any
  width: number
  height: number
}

// 通用类型
export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// 函数类型
export type AsyncCallback<T = void> = () => Promise<T>
export type Callback<T = void> = (value: T) => void
