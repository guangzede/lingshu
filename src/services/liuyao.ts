/**
 * 六爻排盘服务 - 统一导出入口
 *
 * 此文件已重构为模块化结构，所有功能从子模块导入：
 *
 * @module liuyao/core - 核心卦象构建和计算逻辑
 * @module liuyao/shensha - 神煞计算（桃花、驿马、文昌等）
 * @module liuyao/wuxing - 五行生克关系分析
 * @module liuyao/branch - 地支关系分析（六合、六冲、三合、三刑）
 * @module liuyao/constants - 所有配置常量
 *
 * @example
 * import { computeAll, buildHexagram } from '@/services/liuyao'
 */
export * from './liuyao/index'

