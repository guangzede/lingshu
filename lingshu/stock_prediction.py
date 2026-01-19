"""
股市预测 (Stock Market Prediction)
基于八字和五行的股市分析系统
"""

from datetime import datetime
from typing import Dict, List, Tuple
from .bazi import BaZi
from .tiangan_dizhi import WuXing, GanZhi
from .wuyun_liuqi import WuYunLiuQi


class StockPredictor:
    """股市预测器"""

    # 五行平衡判断阈值
    VARIANCE_BALANCED_THRESHOLD = 1.0  # 方差小于此值视为平衡
    WUXING_STRONG_THRESHOLD = 4  # 五行数量达到此值视为过旺
    
    # 五行对应的行业板块
    WUXING_SECTORS = {
        WuXing.MU: ["农业", "林业", "造纸", "家具", "纺织", "中药"],
        WuXing.HUO: ["能源", "电力", "化工", "军工", "电子", "传媒"],
        WuXing.TU: ["房地产", "建材", "水泥", "陶瓷", "农产品", "建筑"],
        WuXing.JIN: ["金融", "银行", "保险", "证券", "机械", "金属"],
        WuXing.SHUI: ["水务", "航运", "物流", "水产", "酒类", "饮料"]
    }

    # 五行相生相克关系对市场影响
    WUXING_IMPACT = {
        "strong": "旺盛，建议增持",
        "weak": "衰弱，建议减持",
        "balanced": "平衡，建议观望"
    }

    def __init__(self, analysis_date: datetime = None):
        """
        初始化股市预测器
        analysis_date: 分析日期，默认为当前日期
        """
        self.analysis_date = analysis_date or datetime.now()
        self.bazi = BaZi(self.analysis_date)
        self.wuyun_liuqi = WuYunLiuQi(self.analysis_date.year)

    def predict_market_trend(self) -> Dict:
        """预测市场整体趋势"""
        # 获取当日五行分布
        wuxing_count = self.bazi.get_wuxing_count()
        
        # 找出最旺和最弱的五行
        strongest = max(wuxing_count.items(), key=lambda x: x[1])
        weakest = min(wuxing_count.items(), key=lambda x: x[1])
        
        # 判断五行平衡度
        avg_count = sum(wuxing_count.values()) / len(wuxing_count)
        variance = sum((v - avg_count) ** 2 for v in wuxing_count.values()) / len(wuxing_count)
        
        if variance < self.VARIANCE_BALANCED_THRESHOLD:
            market_status = "平衡"
            trend = "震荡"
        elif strongest[1] >= self.WUXING_STRONG_THRESHOLD:
            market_status = "失衡"
            trend = "单边行情"
        else:
            market_status = "正常"
            trend = "结构性行情"

        return {
            "分析日期": self.analysis_date.strftime("%Y年%m月%d日"),
            "八字": str(self.bazi),
            "市场状态": market_status,
            "预测趋势": trend,
            "最旺五行": f"{strongest[0].value} (数量: {strongest[1]})",
            "最弱五行": f"{weakest[0].value} (数量: {weakest[1]})",
            "五行方差": round(variance, 2)
        }

    def predict_sectors(self) -> List[Dict]:
        """预测各行业板块表现"""
        wuxing_count = self.bazi.get_wuxing_count()
        predictions = []

        for wuxing, count in wuxing_count.items():
            # 计算该五行的强弱
            if count >= 3:
                strength = "strong"
                score = 85 + (count - 3) * 5
            elif count <= 1:
                strength = "weak"
                score = 40 + count * 10
            else:
                strength = "balanced"
                score = 60 + count * 5

            # 考虑相生相克关系
            score = self._adjust_score_by_shengke(wuxing, wuxing_count, score)

            predictions.append({
                "五行": wuxing.value,
                "相关板块": ", ".join(self.WUXING_SECTORS[wuxing]),
                "强度": count,
                "状态": strength,
                "预测评分": min(100, max(0, score)),
                "建议": self.WUXING_IMPACT[strength]
            })

        # 按评分排序
        predictions.sort(key=lambda x: x["预测评分"], reverse=True)
        return predictions

    def _adjust_score_by_shengke(self, target_wuxing: WuXing, 
                                  wuxing_count: Dict[WuXing, int], 
                                  base_score: float) -> float:
        """根据生克关系调整评分"""
        # 生我者（印）
        sheng_me = self._get_sheng_relation(target_wuxing, "generates_me")
        if sheng_me and wuxing_count[sheng_me] >= 2:
            base_score += 10  # 有生助

        # 我生者（食伤）
        wo_sheng = self._get_sheng_relation(target_wuxing, "i_generate")
        if wo_sheng and wuxing_count[wo_sheng] >= 3:
            base_score -= 5  # 泄气过多

        # 克我者（官杀）
        ke_me = self._get_ke_relation(target_wuxing, "controls_me")
        if ke_me and wuxing_count[ke_me] >= 3:
            base_score -= 15  # 受克严重

        # 我克者（财）
        wo_ke = self._get_ke_relation(target_wuxing, "i_control")
        if wo_ke and wuxing_count[wo_ke] >= 2:
            base_score += 5  # 有财可求

        return base_score

    def _get_sheng_relation(self, wuxing: WuXing, relation_type: str) -> WuXing:
        """获取相生关系"""
        sheng = {
            WuXing.MU: WuXing.HUO,
            WuXing.HUO: WuXing.TU,
            WuXing.TU: WuXing.JIN,
            WuXing.JIN: WuXing.SHUI,
            WuXing.SHUI: WuXing.MU
        }

        if relation_type == "i_generate":
            return sheng[wuxing]
        elif relation_type == "generates_me":
            for k, v in sheng.items():
                if v == wuxing:
                    return k
        return None

    def _get_ke_relation(self, wuxing: WuXing, relation_type: str) -> WuXing:
        """获取相克关系"""
        ke = {
            WuXing.MU: WuXing.TU,
            WuXing.TU: WuXing.SHUI,
            WuXing.SHUI: WuXing.HUO,
            WuXing.HUO: WuXing.JIN,
            WuXing.JIN: WuXing.MU
        }

        if relation_type == "i_control":
            return ke[wuxing]
        elif relation_type == "controls_me":
            for k, v in ke.items():
                if v == wuxing:
                    return k
        return None

    def get_trading_timing(self) -> Dict:
        """获取交易时机建议"""
        day_gan = self.bazi.day_pillar.ganzhi.gan
        day_zhi = self.bazi.day_pillar.ganzhi.zhi

        # 根据日干五行判断交易时机
        timing_advice = {
            WuXing.MU: "适合布局成长股，关注春季行情",
            WuXing.HUO: "适合短线操作，关注夏季行情",
            WuXing.TU: "适合稳健投资，关注四季末行情",
            WuXing.JIN: "适合价值投资，关注秋季行情",
            WuXing.SHUI: "适合逢低吸纳，关注冬季行情"
        }

        risk_level = self._calculate_risk_level()

        return {
            "日干": day_gan.chinese,
            "日支": day_zhi.chinese,
            "日干五行": day_gan.wuxing.value,
            "交易建议": timing_advice[day_gan.wuxing],
            "风险等级": risk_level,
            "最佳交易时辰": self._get_best_trading_hour()
        }

    def _calculate_risk_level(self) -> str:
        """计算风险等级"""
        wuxing_count = self.bazi.get_wuxing_count()
        max_count = max(wuxing_count.values())
        min_count = min(wuxing_count.values())
        
        if max_count - min_count >= 4:
            return "高风险"
        elif max_count - min_count >= 2:
            return "中等风险"
        else:
            return "低风险"

    def _get_best_trading_hour(self) -> str:
        """获取最佳交易时辰"""
        hour_zhi = self.bazi.hour_pillar.ganzhi.zhi
        
        # 根据时支推荐交易时间
        hour_advice = {
            "子": "23:00-01:00 (适合夜盘)",
            "丑": "01:00-03:00 (不建议交易)",
            "寅": "03:00-05:00 (不建议交易)",
            "卯": "05:00-07:00 (适合早盘)",
            "辰": "07:00-09:00 (适合开盘)",
            "巳": "09:00-11:00 (适合上午交易)",
            "午": "11:00-13:00 (适合午盘)",
            "未": "13:00-15:00 (适合下午交易)",
            "申": "15:00-17:00 (适合尾盘)",
            "酉": "17:00-19:00 (适合收盘后)",
            "戌": "19:00-21:00 (适合复盘)",
            "亥": "21:00-23:00 (适合夜盘)"
        }
        
        return hour_advice.get(hour_zhi.chinese, "全天均可")

    def generate_report(self) -> str:
        """生成完整的股市预测报告"""
        lines = []
        lines.append("=" * 60)
        lines.append("基于八字五行的股市预测报告")
        lines.append("=" * 60)
        lines.append("")

        # 1. 市场整体趋势
        trend = self.predict_market_trend()
        lines.append("【市场整体趋势】")
        for key, value in trend.items():
            lines.append(f"  {key}: {value}")
        lines.append("")

        # 2. 五运六气分析
        lines.append("【五运六气分析】")
        fortune = self.wuyun_liuqi.get_yearly_fortune()
        for key, value in fortune.items():
            lines.append(f"  {key}: {value}")
        lines.append("")

        # 3. 行业板块预测
        lines.append("【行业板块预测】")
        sectors = self.predict_sectors()
        for i, sector in enumerate(sectors, 1):
            lines.append(f"  {i}. {sector['五行']} - {sector['相关板块']}")
            lines.append(f"     评分: {sector['预测评分']}, {sector['建议']}")
        lines.append("")

        # 4. 交易时机建议
        lines.append("【交易时机建议】")
        timing = self.get_trading_timing()
        for key, value in timing.items():
            lines.append(f"  {key}: {value}")
        lines.append("")

        # 5. 风险提示
        lines.append("【风险提示】")
        lines.append("  本预测基于中国传统命理学说，仅供参考。")
        lines.append("  投资有风险，入市需谨慎。请结合基本面、技术面等多方分析。")
        lines.append("=" * 60)

        return "\n".join(lines)
