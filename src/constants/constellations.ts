// 星座数据 - 使用相对位置(0-1)方便适配不同屏幕
export interface Star {
  x: number // 相对位置 0-1
  y: number // 相对位置 0-1
  brightness: number // 亮度 0.5-1.5
  name?: string
}

export interface Constellation {
  name: string
  stars: Star[]
  connections: number[][] // 连线索引对 [starIndex1, starIndex2]
  color?: string
}

// 北斗七星 (Big Dipper) - 按参考图相对位置，放置在右上区域
export const beidou: Constellation = {
  name: '北斗七星',
  color: 'rgba(255, 223, 100, 0.95)', // 暖黄色，贴合示例图
  stars: [
    // 按图顺序：摇光 → 开阳 → 玉衡 → 天权 → 天玑 → 天璇 → 天枢
    { x: 0.62, y: 0.14, brightness: 1.55, name: '摇光' }, // 柄端最高点
    { x: 0.68, y: 0.16, brightness: 1.50, name: '开阳' },
    { x: 0.72, y: 0.20, brightness: 1.65, name: '玉衡' },
    { x: 0.76, y: 0.26, brightness: 1.70, name: '天权' }, // 折点
    { x: 0.72, y: 0.34, brightness: 1.55, name: '天玑' },
    { x: 0.70, y: 0.40, brightness: 1.45, name: '天璇' },
    { x: 0.78, y: 0.44, brightness: 1.60, name: '天枢' }, // 斗口最下方
  ],
  connections: [
    [0, 1], [1, 2], [2, 3], // 柄到折点
    [3, 4], [4, 5], [5, 6], // 折点到斗口
  ]
}

// 南斗六星 (实际是六星，传统称七星) - 斗形
export const nandou: Constellation = {
  name: '南斗六星',
  color: 'rgba(255, 215, 0, 0.95)', // 明亮的金色
  stars: [
    { x: 0.78, y: 0.68, brightness: 1.6, name: '天府' },
    { x: 0.74, y: 0.66, brightness: 1.5, name: '天梁' },
    { x: 0.70, y: 0.70, brightness: 1.4, name: '天机' },
    { x: 0.72, y: 0.75, brightness: 1.5, name: '天同' },
    { x: 0.76, y: 0.73, brightness: 1.5, name: '天相' },
    { x: 0.80, y: 0.71, brightness: 1.6, name: '七杀' },
  ],
  connections: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  ]
}

// 中天星宿 - 简化为代表性的12颗主星，形成天球中央带
export const zhongtian: Constellation = {
  name: '中天十二星',
  color: 'rgba(255, 182, 193, 0.85)', // 淡粉色
  stars: [
    { x: 0.50, y: 0.08, brightness: 1.2 },
    { x: 0.60, y: 0.12, brightness: 1.1 },
    { x: 0.68, y: 0.20, brightness: 1.3 },
    { x: 0.73, y: 0.32, brightness: 1.1 },
    { x: 0.74, y: 0.45, brightness: 1.2 },
    { x: 0.70, y: 0.56, brightness: 1.1 },
    { x: 0.62, y: 0.64, brightness: 1.3 },
    { x: 0.52, y: 0.68, brightness: 1.0 },
    { x: 0.42, y: 0.66, brightness: 1.2 },
    { x: 0.34, y: 0.58, brightness: 1.1 },
    { x: 0.30, y: 0.46, brightness: 1.2 },
    { x: 0.32, y: 0.32, brightness: 1.0 },
  ],
  connections: [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [4, 5], [5, 6], [6, 7], [7, 8],
    [8, 9], [9, 10], [10, 11], [11, 0],
  ]
}

// 装饰星点 - 补充星空的丰富度
export const decorativeStars: Star[] = [
  { x: 0.08, y: 0.12, brightness: 0.6 },
  { x: 0.12, y: 0.45, brightness: 0.7 },
  { x: 0.20, y: 0.55, brightness: 0.5 },
  { x: 0.25, y: 0.75, brightness: 0.8 },
  { x: 0.38, y: 0.85, brightness: 0.6 },
  { x: 0.50, y: 0.90, brightness: 0.7 },
  { x: 0.62, y: 0.88, brightness: 0.5 },
  { x: 0.75, y: 0.82, brightness: 0.6 },
  { x: 0.85, y: 0.70, brightness: 0.7 },
  { x: 0.90, y: 0.55, brightness: 0.6 },
  { x: 0.88, y: 0.38, brightness: 0.8 },
  { x: 0.82, y: 0.20, brightness: 0.5 },
  { x: 0.72, y: 0.10, brightness: 0.7 },
  { x: 0.55, y: 0.08, brightness: 0.6 },
  { x: 0.42, y: 0.40, brightness: 0.5 },
]

export const allConstellations = [beidou]
