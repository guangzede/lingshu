# 六爻排盘服务模块化重构说明

## 📁 新的文件结构

```
src/services/liuyao/
├── index.ts          # 统一导出入口
├── constants.ts      # 所有常量配置（五行、地支、长生等）
├── shensha.ts        # 神煞计算（桃花、驿马、文昌等）
├── wuxing.ts         # 五行生克相关功能
├── branch.ts         # 地支关系分析（六合、六冲、三合、三刑）
└── core.ts           # 核心卦象构建和计算逻辑
```

## 🎯 设计原则

### 1. **关注点分离**
- 每个文件专注于单一领域
- 常量配置独立管理
- 业务逻辑模块化

### 2. **高内聚低耦合**
- 相关功能集中在同一模块
- 模块间通过清晰的接口交互
- 减少不必要的依赖

### 3. **易于维护**
- 文件大小控制在 200-300 行
- 清晰的命名和注释
- 统一的导出方式

## 📦 模块详解

### `constants.ts` - 常量配置
存放所有不变的配置数据：
```typescript
// 五行映射
export const STEM_WUXING: Record<Stem, WuXing>
export const BRANCH_WUXING: Record<Branch, WuXing>
export const GENERATES: Record<WuXing, WuXing>
export const OVERCOMES: Record<WuXing, WuXing>

// 地支关系
export const SIX_HARMONY: Record<Branch, Branch>
export const SIX_CLASH: Record<Branch, Branch>
export const TRIPLE_HARMONY: Record<Branch, Branch[]>
export const TRIPLE_PUNISHMENT: Record<Branch, Branch[]>

// 长生十二宫
export const CHANGSHENG_SEQ
export const BRANCH_ORDER
```

### `shensha.ts` - 神煞计算
统一管理所有神煞的取法：
```typescript
// 神煞配置对象（便于查阅和修改）
const SHENSHA_CONFIG = {
  桃花: { '申子辰': '酉', ... },
  驿马: { '申子辰': '寅', ... },
  文昌贵人: { '甲': '巳', ... },
  禄神: { '甲': '寅', ... },
  ...
}

// 对外接口
export function computeShenSha(
  dayStem: Stem,
  dayBranch: Branch,
  monthBranch?: Branch,
  yearBranch?: Branch
): ShenShaResult

export function computeXunKong(
  dayStem: Stem,
  dayBranch: Branch
): [Branch, Branch]
```

**优势**：
- 所有神煞取法集中在配置对象中
- 易于核对和修正
- 添加新神煞只需扩展配置

### `wuxing.ts` - 五行功能
五行相关的计算和判断：
```typescript
// 六亲关系判定
export function getRelation(
  self: WuXing,
  yaoBranch?: Branch,
  yaoStem?: Stem
): Relation | undefined

// 五行属性赋值
export function assignFiveElement(yaos: Yao[])

// 长生十二宫赋值
export function assignChangsheng(dayStem: Stem, yaos: Yao[])

// 四时旺衰
export function getSeasonElement(monthBranch: Branch): WuXing
export function seasonStatus(season: WuXing, elem: WuXing): Status

// 爻位五行分析
export function analyzeYaoInteractions(
  baseYaos: Yao[],
  variantYaos: Yao[]
): YaoInteraction[]
```

### `branch.ts` - 地支关系
地支的合冲刑害分析：
```typescript
export interface BranchRelation {
  branch: Branch
  harmony?: Branch         // 六合
  clash?: Branch           // 六冲
  tripleHarmony?: Branch[] // 三合
  triplePunishment?: Branch[] // 三刑
}

export function analyzeBranchRelation(
  dayBranch: Branch,
  hourBranch: Branch,
  hexBranches: Branch[]
): {
  dayRelations: BranchRelation[]
  hourRelations: BranchRelation[]
}
```

### `core.ts` - 核心逻辑
卦象构建和综合计算：
```typescript
// 卦象构建
export function buildHexagram(lines: LineInput[]): Hexagram
export function deriveVariant(hex: Hexagram): Hexagram
export function deriveMutual(hex: Hexagram): Hexagram

// 时间干支
export function getDayStemBranch(date: Date)
export function getTimeGanZhi(date: Date)

// 纳甲装卦
export function mapNaJia(hex: Hexagram, rule: SchoolRuleSet)
export function assignSixGods(date: Date, rule: SchoolRuleSet, yaos: Yao[])

// 综合计算
export function computeAll(lines: LineInput[], options: ComputeOptions)
```

### `index.ts` - 统一导出
集中导出所有公共API：
```typescript
export * from './core'
export * from './shensha'
export * from './wuxing'
export * from './branch'
export * from './constants'
```

## 🔧 使用方式

### 方式 1：从主入口导入（推荐）
```typescript
import {
  computeAll,
  buildHexagram,
  computeShenSha,
  analyzeBranchRelation
} from '@/services/liuyao'
```

### 方式 2：从子模块导入（明确依赖）
```typescript
import { computeShenSha } from '@/services/liuyao/shensha'
import { getRelation } from '@/services/liuyao/wuxing'
import { BRANCH_WUXING } from '@/services/liuyao/constants'
```

## ✅ 重构收益

### 代码质量提升
- ✅ 单文件代码从 678 行拆分为 5 个文件（150-250行/文件）
- ✅ 函数职责更清晰，符合单一职责原则
- ✅ 配置数据集中管理，易于维护和查阅

### 可维护性提升
- ✅ 修改神煞取法只需编辑配置对象
- ✅ 添加新功能不影响现有模块
- ✅ 问题定位更快速（知道去哪个文件找）

### 可测试性提升
- ✅ 每个模块可独立测试
- ✅ 依赖关系清晰
- ✅ Mock 更容易

### 协作效率提升
- ✅ 多人可同时修改不同模块
- ✅ 代码冲突减少
- ✅ 代码审查更聚焦

## 🚀 后续优化建议

### 1. 添加单元测试
```typescript
// shensha.test.ts
describe('神煞计算', () => {
  test('桃花按三合局取', () => {
    const result = computeShenSha('甲', '子')
    expect(result.桃花).toBe('酉')
  })
})
```

### 2. 类型安全增强
```typescript
// 使用字面量类型而非 Record<string, ...>
type SanHeJu = '申子辰' | '亥卯未' | '寅午戌' | '巳酉丑'
const taoHuaMap: Record<SanHeJu, Branch> = { ... }
```

### 3. 文档生成
使用 JSDoc 或 TypeDoc 自动生成 API 文档

### 4. 性能优化
对频繁调用的函数（如长生十二宫映射）使用 memoization

## 📝 迁移指南

所有现有代码无需修改！原 `liuyao.ts` 文件已改为重新导出，完全向后兼容：

```typescript
// 原来的导入方式仍然有效
import { computeAll } from '@/services/liuyao'
```

实际上会从 `@/services/liuyao/index.ts` 获取，该文件统一导出所有子模块。

## 🎓 总结

通过模块化重构，我们实现了：

1. **代码组织**：从单文件 678 行变为 6 个职责清晰的模块
2. **配置管理**：神煞取法集中在配置对象，一目了然
3. **易于扩展**：添加新神煞或修改现有逻辑更简单
4. **向后兼容**：现有代码无需修改

这为后续功能迭代和团队协作打下了良好基础。

## deepSeek API 密钥

1. sk-c4a5a166346e40439b6ac8ed20dac9c9
