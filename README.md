# 灵枢百宝箱 (Lingshu Treasure Box)

基于中国传统命理学说的综合系统，包含五运六气、天干地支、八字排盘和股市预测功能。

## 功能特性

### 1. 天干地支 (Heavenly Stems and Earthly Branches)
- 十天干、十二地支系统
- 六十甲子干支计算
- 纳音五行推算
- 五行阴阳属性分析

### 2. 五运六气 (Five Movements and Six Qi)
- 年度运气分析
- 六气季节分布
- 健康倾向预测
- 养生建议生成

### 3. 八字排盘 (BaZi Four Pillars)
- 年月日时四柱计算
- 十神关系分析
- 五行强弱统计
- 地支藏干推算

### 4. 股市预测 (Stock Market Prediction)
- 基于五行的行业板块分析
- 市场整体趋势预测
- 交易时机建议
- 风险等级评估

## 安装

```bash
# 克隆仓库
git clone https://github.com/guangzede/lingshu.git
cd lingshu

# 安装包
pip install -e .
```

## 快速开始

### 基本使用

```python
from datetime import datetime
from lingshu import GanZhi, WuYunLiuQi, BaZi, StockPredictor

# 1. 计算年份的干支
year = 2024
ganzhi = GanZhi.from_year(year)
print(f"{year}年: {ganzhi}")  # 输出: 2024年: 甲辰

# 2. 分析五运六气
wylq = WuYunLiuQi(2024)
fortune = wylq.get_yearly_fortune()
print(fortune)

# 3. 排八字
birth_time = datetime(1990, 1, 1, 12, 0)
bazi = BaZi(birth_time)
print(bazi.format_chart())

# 4. 预测股市
predictor = StockPredictor(datetime.now())
report = predictor.generate_report()
print(report)
```

### 使用示例脚本

```bash
# 运行完整示例
python examples.py

# 生成股市预测报告
python predict_stock.py

# 指定日期预测
python predict_stock.py 2024-01-15

# 保存报告到文件
python predict_stock.py 2024-01-15 --save
```

## API 文档

### 天干地支模块

```python
from lingshu import TianGan, DiZhi, GanZhi

# 从年份获取天干地支
gan = TianGan.from_year(2024)
zhi = DiZhi.from_year(2024)
ganzhi = GanZhi.from_year(2024)

# 获取五行属性
print(gan.wuxing)  # 五行
print(gan.yinyang)  # 阴阳

# 获取纳音
print(ganzhi.get_nayin())
```

### 五运六气模块

```python
from lingshu import WuYunLiuQi

wylq = WuYunLiuQi(2024)

# 获取年度运气
fortune = wylq.get_yearly_fortune()

# 获取六气分布
seasons = wylq.get_seasonal_qi()

# 获取健康倾向
health = wylq.analyze_health_tendency()
```

### 八字模块

```python
from datetime import datetime
from lingshu import BaZi

# 创建八字
birth = datetime(1990, 1, 1, 12, 0)
bazi = BaZi(birth, gender="male")

# 获取四柱
print(bazi.year_pillar)   # 年柱
print(bazi.month_pillar)  # 月柱
print(bazi.day_pillar)    # 日柱
print(bazi.hour_pillar)   # 时柱

# 统计五行
wuxing_count = bazi.get_wuxing_count()

# 格式化输出
print(bazi.format_chart())
```

### 股市预测模块

```python
from datetime import datetime
from lingshu import StockPredictor

# 创建预测器
predictor = StockPredictor(datetime.now())

# 预测市场趋势
trend = predictor.predict_market_trend()

# 预测行业板块
sectors = predictor.predict_sectors()

# 获取交易时机
timing = predictor.get_trading_timing()

# 生成完整报告
report = predictor.generate_report()
```

## 五行对应行业

- **木**: 农业、林业、造纸、家具、纺织、中药
- **火**: 能源、电力、化工、军工、电子、传媒
- **土**: 房地产、建材、水泥、陶瓷、农产品、建筑
- **金**: 金融、银行、保险、证券、机械、金属
- **水**: 水务、航运、物流、水产、酒类、饮料

## 注意事项

1. **免责声明**: 本系统基于中国传统命理学说，预测结果仅供参考，不构成投资建议。
2. **投资风险**: 股市有风险，投资需谨慎。请结合基本面、技术面等多方面进行分析。
3. **准确性**: 八字计算涉及复杂的历法转换，本系统采用简化算法，可能存在误差。
4. **文化理解**: 建议对中国传统文化有一定了解后使用本系统。

## 开发计划

- [ ] 添加更精确的节气计算
- [ ] 支持大运、流年分析
- [ ] 添加更多股市技术指标
- [ ] 支持历史数据回测
- [ ] 开发Web界面
- [ ] 添加更多命理分析功能

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 作者

guangzede

---

**警告**: 投资有风险，入市需谨慎！本工具仅供学习和研究使用。
