#!/usr/bin/env python3
"""
综合测试脚本 - 测试所有功能模块
"""

import sys
from datetime import datetime
from lingshu import (
    TianGan, DiZhi, GanZhi, WuXing, YinYang,
    WuYun, LiuQi, WuYunLiuQi,
    BaZi, Pillar,
    StockPredictor
)


def test_tiangan_dizhi():
    """测试天干地支模块"""
    print("=" * 60)
    print("测试天干地支模块")
    print("=" * 60)
    
    try:
        # 测试年份转换
        years = [2024, 2023, 2000, 1984]
        for year in years:
            gz = GanZhi.from_year(year)
            nayin = gz.get_nayin()
            print(f"{year}年: {gz} - {nayin}")
        
        # 测试六十甲子
        print("\n前十个甲子:")
        for i in range(10):
            gz = GanZhi.from_index(i)
            print(f"{i+1}. {gz}", end="  ")
            if (i+1) % 5 == 0:
                print()
        
        print("\n✓ 天干地支模块测试通过")
        return True
    except Exception as e:
        print(f"\n✗ 天干地支模块测试失败: {e}")
        return False


def test_wuyun_liuqi():
    """测试五运六气模块"""
    print("\n" + "=" * 60)
    print("测试五运六气模块")
    print("=" * 60)
    
    try:
        # 测试多个年份
        years = [2024, 2025, 2026]
        for year in years:
            wylq = WuYunLiuQi(year)
            print(f"\n{year}年: {wylq}")
            fortune = wylq.get_yearly_fortune()
            print(f"  五运: {fortune['五运']}")
            print(f"  主气: {fortune['主气']}")
            print(f"  气候: {fortune['气候特征']}")
        
        # 测试六气分布
        wylq = WuYunLiuQi(2024)
        seasons = wylq.get_seasonal_qi()
        print(f"\n2024年六气分布 (共{len(seasons)}个):")
        for season in seasons:
            print(f"  {season['序号']}: {season['名称']}")
        
        # 测试健康分析
        health = wylq.analyze_health_tendency()
        print(f"\n健康分析:")
        print(f"  运势影响数量: {len(health['运势影响'])}")
        print(f"  气候影响数量: {len(health['气候影响'])}")
        print(f"  养生建议数量: {len(health['养生建议'])}")
        
        print("\n✓ 五运六气模块测试通过")
        return True
    except Exception as e:
        print(f"\n✗ 五运六气模块测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_bazi():
    """测试八字排盘模块"""
    print("\n" + "=" * 60)
    print("测试八字排盘模块")
    print("=" * 60)
    
    try:
        # 测试多个生日
        test_cases = [
            (datetime(1990, 1, 1, 12, 0), "male"),
            (datetime(2000, 6, 15, 8, 30), "female"),
            (datetime(1985, 12, 25, 18, 45), "male"),
        ]
        
        for birth_dt, gender in test_cases:
            bazi = BaZi(birth_dt, gender)
            print(f"\n{birth_dt.strftime('%Y年%m月%d日 %H:%M')}")
            print(f"  八字: {bazi}")
            print(f"  日主: {bazi.rizhu.chinese} ({bazi.rizhu.wuxing.value})")
            
            # 测试五行统计
            wx_count = bazi.get_wuxing_count()
            total = sum(wx_count.values())
            print(f"  五行总数: {total}")
            
            # 测试十神
            shishen = bazi.get_shishen(bazi.year_pillar.ganzhi.gan)
            print(f"  年干十神: {shishen}")
        
        # 测试格式化输出
        bazi = BaZi(datetime(1990, 1, 1, 12, 0))
        chart = bazi.format_chart()
        print(f"\n格式化输出长度: {len(chart)} 字符")
        
        print("\n✓ 八字排盘模块测试通过")
        return True
    except Exception as e:
        print(f"\n✗ 八字排盘模块测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_stock_prediction():
    """测试股市预测模块"""
    print("\n" + "=" * 60)
    print("测试股市预测模块")
    print("=" * 60)
    
    try:
        # 测试多个日期
        test_dates = [
            datetime(2024, 1, 15, 10, 0),
            datetime(2024, 6, 20, 14, 30),
            datetime(2025, 3, 10, 9, 15),
        ]
        
        for dt in test_dates:
            predictor = StockPredictor(dt)
            
            print(f"\n{dt.strftime('%Y年%m月%d日 %H:%M')} 预测:")
            
            # 测试市场趋势
            trend = predictor.predict_market_trend()
            print(f"  市场状态: {trend['市场状态']}")
            print(f"  预测趋势: {trend['预测趋势']}")
            print(f"  最旺五行: {trend['最旺五行']}")
            
            # 测试板块预测
            sectors = predictor.predict_sectors()
            print(f"  板块预测数量: {len(sectors)}")
            top_sector = sectors[0]
            print(f"  最强板块: {top_sector['五行']} (评分: {top_sector['预测评分']})")
            
            # 测试交易时机
            timing = predictor.get_trading_timing()
            print(f"  风险等级: {timing['风险等级']}")
        
        # 测试完整报告生成
        predictor = StockPredictor(datetime(2024, 1, 15, 10, 0))
        report = predictor.generate_report()
        print(f"\n完整报告长度: {len(report)} 字符")
        
        # 验证报告包含关键部分
        assert "市场整体趋势" in report
        assert "五运六气分析" in report
        assert "行业板块预测" in report
        assert "交易时机建议" in report
        assert "风险提示" in report
        
        print("\n✓ 股市预测模块测试通过")
        return True
    except Exception as e:
        print(f"\n✗ 股市预测模块测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_integration():
    """集成测试"""
    print("\n" + "=" * 60)
    print("集成测试")
    print("=" * 60)
    
    try:
        # 测试各模块之间的配合
        dt = datetime(2024, 3, 21, 10, 30)
        
        # 1. 获取干支
        gz = GanZhi.from_year(dt.year)
        print(f"\n{dt.year}年干支: {gz}")
        
        # 2. 分析五运六气
        wylq = WuYunLiuQi(dt.year)
        print(f"五运六气: {wylq}")
        
        # 3. 排八字
        bazi = BaZi(dt)
        print(f"八字: {bazi}")
        
        # 4. 股市预测
        predictor = StockPredictor(dt)
        trend = predictor.predict_market_trend()
        print(f"市场趋势: {trend['预测趋势']}")
        
        # 验证五行一致性
        bazi_wx = bazi.get_wuxing_count()
        assert sum(bazi_wx.values()) == 8, "八字应该有8个天干地支"
        
        print("\n✓ 集成测试通过")
        return True
    except Exception as e:
        print(f"\n✗ 集成测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("灵枢百宝箱 - 综合测试")
    print("=" * 60)
    print()
    
    results = []
    
    # 运行所有测试
    results.append(("天干地支", test_tiangan_dizhi()))
    results.append(("五运六气", test_wuyun_liuqi()))
    results.append(("八字排盘", test_bazi()))
    results.append(("股市预测", test_stock_prediction()))
    results.append(("集成测试", test_integration()))
    
    # 统计结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{name}: {status}")
    
    print()
    print(f"总计: {passed}/{total} 测试通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！系统运行正常。")
        return 0
    else:
        print(f"\n⚠️  有 {total - passed} 个测试失败，请检查。")
        return 1


if __name__ == "__main__":
    sys.exit(main())
