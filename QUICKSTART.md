# 快速开始指南

这是一个快速开始使用灵枢百宝箱的指南。

## 安装

```bash
# 克隆仓库
git clone https://github.com/guangzede/lingshu.git
cd lingshu

# 可选：创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装（开发模式）
pip install -e .
```

## 5分钟入门

### 1. 计算今天的干支

```python
from datetime import datetime
from lingshu import GanZhi

# 获取今年的干支
year = datetime.now().year
ganzhi = GanZhi.from_year(year)
print(f"{year}年是: {ganzhi}年")
# 输出: 2024年是: 甲辰年
```

### 2. 查看今年的五运六气

```python
from lingshu import WuYunLiuQi

wylq = WuYunLiuQi(2024)
print(wylq)
# 输出: 2024年 甲辰 土运 太阳寒水

fortune = wylq.get_yearly_fortune()
print(f"五运: {fortune['五运']}")
print(f"主气: {fortune['主气']}")
print(f"气候: {fortune['气候特征']}")
```

### 3. 排一个八字

```python
from datetime import datetime
from lingshu import BaZi

# 例如：1990年1月1日中午12点出生
birth = datetime(1990, 1, 1, 12, 0)
bazi = BaZi(birth, gender="male")

# 查看八字
print(bazi.format_chart())
```

### 4. 预测今日股市

```python
from datetime import datetime
from lingshu import StockPredictor

# 创建今日预测
predictor = StockPredictor(datetime.now())

# 查看完整报告
report = predictor.generate_report()
print(report)
```

## 命令行工具

### 查看完整示例

```bash
python examples.py
```

### 生成股市预测

```bash
# 今日预测
python predict_stock.py

# 指定日期预测
python predict_stock.py 2024-03-21

# 保存报告到文件
python predict_stock.py 2024-03-21 --save
```

### 运行测试

```bash
python test_all.py
```

## 常用功能示例

### 查询六十甲子

```python
from lingshu import GanZhi

# 打印前10个甲子
for i in range(10):
    gz = GanZhi.from_index(i)
    nayin = gz.get_nayin()
    print(f"{i+1}. {gz} - {nayin}")
```

### 分析五行强弱

```python
from datetime import datetime
from lingshu import BaZi

bazi = BaZi(datetime(1990, 1, 1, 12, 0))
wuxing_count = bazi.get_wuxing_count()

print("五行分布:")
for wx, count in wuxing_count.items():
    print(f"  {wx.value}: {count}")
```

### 获取交易建议

```python
from datetime import datetime
from lingshu import StockPredictor

predictor = StockPredictor(datetime.now())

# 市场趋势
trend = predictor.predict_market_trend()
print(f"市场趋势: {trend['预测趋势']}")
print(f"最旺五行: {trend['最旺五行']}")

# 板块预测
sectors = predictor.predict_sectors()
print("\n推荐板块:")
for sector in sectors[:3]:  # 前3个
    print(f"  {sector['五行']}: {sector['相关板块']}")
    print(f"    评分: {sector['预测评分']}, {sector['建议']}")

# 交易时机
timing = predictor.get_trading_timing()
print(f"\n交易建议: {timing['交易建议']}")
print(f"风险等级: {timing['风险等级']}")
```

## 进阶使用

### 批量分析

```python
from datetime import datetime, timedelta
from lingshu import StockPredictor

# 分析未来一周的市场趋势
today = datetime.now()
for i in range(7):
    date = today + timedelta(days=i)
    predictor = StockPredictor(date)
    trend = predictor.predict_market_trend()
    print(f"{date.strftime('%m-%d')}: {trend['预测趋势']}")
```

### 比较不同年份

```python
from lingshu import WuYunLiuQi

years = [2024, 2025, 2026]
for year in years:
    wylq = WuYunLiuQi(year)
    fortune = wylq.get_yearly_fortune()
    print(f"{year}: {fortune['五运']} - {fortune['主气']}")
```

## 注意事项

1. **投资风险**: 本工具仅供参考，不构成投资建议
2. **准确性**: 八字计算采用简化算法，可能存在误差
3. **文化背景**: 建议了解中国传统文化后使用

## 获取帮助

- 查看 [完整文档](README.md)
- 查看 [API 文档](README.md#api-文档)
- 运行示例: `python examples.py`
- 运行测试: `python test_all.py`

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**免责声明**: 投资有风险，入市需谨慎！
