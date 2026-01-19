#!/usr/bin/env python3
"""
股市预测专用脚本
快速生成当日股市预测报告
"""

import sys
from datetime import datetime
from lingshu import StockPredictor


def main():
    """主函数"""
    # 获取分析日期
    if len(sys.argv) > 1:
        try:
            # 支持格式: YYYY-MM-DD
            date_str = sys.argv[1]
            analysis_date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            print("日期格式错误，请使用 YYYY-MM-DD 格式")
            print("例如: python predict_stock.py 2024-01-15")
            sys.exit(1)
    else:
        # 默认使用当前日期
        analysis_date = datetime.now()
    
    # 创建预测器
    predictor = StockPredictor(analysis_date)
    
    # 生成并输出报告
    report = predictor.generate_report()
    print(report)
    
    # 可选：保存到文件
    if len(sys.argv) > 2 and sys.argv[2] == "--save":
        filename = f"stock_prediction_{analysis_date.strftime('%Y%m%d')}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"\n报告已保存到: {filename}")


if __name__ == "__main__":
    main()
