#!/usr/bin/env python3
"""
灵枢百宝箱 - 使用示例
演示如何使用各个模块
"""

from datetime import datetime
from lingshu import TianGan, DiZhi, GanZhi, WuYunLiuQi, BaZi, StockPredictor


def demo_tiangan_dizhi():
    """演示天干地支功能"""
    print("=" * 60)
    print("天干地支示例")
    print("=" * 60)
    
    # 计算2024年的干支
    year = 2024
    ganzhi = GanZhi.from_year(year)
    print(f"\n{year}年的干支: {ganzhi}")
    print(f"天干: {ganzhi.gan.chinese} ({ganzhi.gan.wuxing.value})")
    print(f"地支: {ganzhi.zhi.chinese} ({ganzhi.zhi.animal})")
    print(f"纳音: {ganzhi.get_nayin()}")
    print()


def demo_wuyun_liuqi():
    """演示五运六气功能"""
    print("=" * 60)
    print("五运六气示例")
    print("=" * 60)
    
    # 分析2024年的五运六气
    year = 2024
    wylq = WuYunLiuQi(year)
    
    print(f"\n{wylq}")
    print("\n年度运气:")
    fortune = wylq.get_yearly_fortune()
    for key, value in fortune.items():
        print(f"  {key}: {value}")
    
    print("\n六气分布:")
    seasons = wylq.get_seasonal_qi()
    for season in seasons:
        print(f"  {season['序号']} - {season['名称']} ({season['气候']})")
    
    print("\n健康倾向分析:")
    health = wylq.analyze_health_tendency()
    print(f"  运势影响: {', '.join(health['运势影响'])}")
    print(f"  气候影响: {', '.join(health['气候影响'])}")
    print(f"  养生建议: {', '.join(health['养生建议'])}")
    print()


def demo_bazi():
    """演示八字排盘功能"""
    print("=" * 60)
    print("八字排盘示例")
    print("=" * 60)
    
    # 示例：1990年1月1日 12:00 出生
    birth_time = datetime(1990, 1, 1, 12, 0)
    bazi = BaZi(birth_time, gender="male")
    
    print(bazi.format_chart())
    print()


def demo_stock_prediction():
    """演示股市预测功能"""
    print("=" * 60)
    print("股市预测示例")
    print("=" * 60)
    
    # 使用当前日期进行预测
    predictor = StockPredictor(datetime.now())
    
    # 生成完整报告
    report = predictor.generate_report()
    print(report)
    print()


def main():
    """主函数"""
    print("\n灵枢百宝箱 - 功能演示\n")
    
    # 1. 天干地支
    demo_tiangan_dizhi()
    
    # 2. 五运六气
    demo_wuyun_liuqi()
    
    # 3. 八字排盘
    demo_bazi()
    
    # 4. 股市预测
    demo_stock_prediction()
    
    print("演示完成！")


if __name__ == "__main__":
    main()
