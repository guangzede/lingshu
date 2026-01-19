"""
八字排盘 (BaZi Four Pillars Calculation)
生辰八字计算系统
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Tuple
from .tiangan_dizhi import TianGan, DiZhi, GanZhi, WuXing, YinYang


class Pillar:
    """四柱（年月日时）"""
    
    def __init__(self, gan: TianGan, zhi: DiZhi, pillar_type: str):
        self.ganzhi = GanZhi(gan, zhi)
        self.pillar_type = pillar_type  # 年柱/月柱/日柱/时柱

    def __str__(self):
        return f"{self.pillar_type}: {self.ganzhi}"

    def get_canggan(self) -> List[TianGan]:
        """获取地支藏干"""
        # 地支藏干对照表
        canggan_map = {
            DiZhi.ZI: [TianGan.GUI],
            DiZhi.CHOU: [TianGan.JI, TianGan.GUI, TianGan.XIN],
            DiZhi.YIN: [TianGan.JIA, TianGan.BING, TianGan.WU],
            DiZhi.MAO: [TianGan.YI],
            DiZhi.CHEN: [TianGan.WU, TianGan.YI, TianGan.GUI],
            DiZhi.SI: [TianGan.BING, TianGan.WU, TianGan.GENG],
            DiZhi.WU: [TianGan.DING, TianGan.JI],
            DiZhi.WEI: [TianGan.JI, TianGan.DING, TianGan.YI],
            DiZhi.SHEN: [TianGan.GENG, TianGan.REN, TianGan.WU],
            DiZhi.YOU: [TianGan.XIN],
            DiZhi.XU: [TianGan.WU, TianGan.XIN, TianGan.DING],
            DiZhi.HAI: [TianGan.REN, TianGan.JIA]
        }
        return canggan_map.get(self.ganzhi.zhi, [])


class ShiShen(Enum):
    """十神 (Ten Gods)"""
    BIJIAN = "比肩"      # Same element, same yin-yang
    JIECAI = "劫财"      # Same element, different yin-yang
    SHISHEN = "食神"     # I generate, same yin-yang
    SHANGGUAN = "伤官"   # I generate, different yin-yang
    PIANCAI = "偏财"     # I control, same yin-yang
    ZHENGCAI = "正财"    # I control, different yin-yang
    QISHA = "七杀"       # Controls me, same yin-yang
    ZHENGGUAN = "正官"   # Controls me, different yin-yang
    PIANYIN = "偏印"     # Generates me, same yin-yang
    ZHENGYIN = "正印"    # Generates me, different yin-yang


class BaZi:
    """八字命盘"""

    def __init__(self, birth_datetime: datetime, gender: str = "male"):
        """
        初始化八字
        birth_datetime: 出生时间
        gender: 性别 ('male' 或 'female')
        """
        self.birth_datetime = birth_datetime
        self.gender = gender
        
        # 计算四柱
        self.year_pillar = self._calc_year_pillar()
        self.month_pillar = self._calc_month_pillar()
        self.day_pillar = self._calc_day_pillar()
        self.hour_pillar = self._calc_hour_pillar()

        # 日主（日干）
        self.rizhu = self.day_pillar.ganzhi.gan

    def _calc_year_pillar(self) -> Pillar:
        """计算年柱"""
        year = self.birth_datetime.year
        # 注意：如果是立春前，年份需要减1
        # 这里简化处理，实际应该判断是否过立春
        gan = TianGan.from_year(year)
        zhi = DiZhi.from_year(year)
        return Pillar(gan, zhi, "年柱")

    def _calc_month_pillar(self) -> Pillar:
        """计算月柱"""
        month = self.birth_datetime.month
        year = self.birth_datetime.year
        
        # 月支
        zhi = DiZhi.from_month(month)
        
        # 月干：根据年干推算
        # 甲己之年丙作首，乙庚之岁戊为头
        # 丙辛必定寻庚起，丁壬壬位顺行流
        # 若问戊癸何处起，甲寅之上好追求
        year_gan = TianGan.from_year(year)
        month_gan_base = {
            TianGan.JIA: TianGan.BING, TianGan.JI: TianGan.BING,
            TianGan.YI: TianGan.WU, TianGan.GENG: TianGan.WU,
            TianGan.BING: TianGan.GENG, TianGan.XIN: TianGan.GENG,
            TianGan.DING: TianGan.REN, TianGan.REN: TianGan.REN,
            TianGan.WU: TianGan.JIA, TianGan.GUI: TianGan.JIA
        }
        base_gan = month_gan_base[year_gan]
        base_idx = list(TianGan).index(base_gan)
        month_idx = month - 1  # 寅月为正月
        gan = TianGan.from_index(base_idx + month_idx)
        
        return Pillar(gan, zhi, "月柱")

    def _calc_day_pillar(self) -> Pillar:
        """计算日柱（使用公历日期推算）
        
        使用基准日期推算法：
        - 基准日期：2000年1月1日为戊午日
        - 戊午在六十甲子中的序号为54（从0开始计数）
        - 通过计算与基准日期的天数差来推算当前日期的干支
        """
        # 基准：2000年1月1日为戊午日
        base_date = datetime(2000, 1, 1)
        # 戊午在六十甲子中的位置（0-based索引）
        # 甲子=0, 乙丑=1, ... 戊午=54
        BASE_JIAZI_INDEX = 54
        
        days_diff = (self.birth_datetime - base_date).days
        jiazi_index = (BASE_JIAZI_INDEX + days_diff) % 60
        
        gan = TianGan.from_index(jiazi_index)
        zhi = DiZhi.from_index(jiazi_index)
        
        return Pillar(gan, zhi, "日柱")

    def _calc_hour_pillar(self) -> Pillar:
        """计算时柱
        
        中国传统时辰系统：
        - 一天分为12个时辰，每个时辰2小时
        - 子时: 23:00-01:00, 丑时: 01:00-03:00, 寅时: 03:00-05:00...
        - 注意：子时从前一天23:00开始，所以需要+1来正确对齐
        """
        hour = self.birth_datetime.hour
        
        # 时支：根据小时数计算地支
        # (hour+1)//2 将24小时制转换为12时辰制
        # 例：23点 -> (23+1)//2=12, 12%12=0 -> 子时
        #     1点 -> (1+1)//2=1 -> 丑时
        zhi = DiZhi.from_hour(hour)
        
        # 时干：根据日干推算
        # 甲己还加甲，乙庚丙作初
        # 丙辛从戊起，丁壬庚子居
        # 戊癸何方发，壬子是真途
        day_gan = self.day_pillar.ganzhi.gan
        hour_gan_base = {
            TianGan.JIA: TianGan.JIA, TianGan.JI: TianGan.JIA,
            TianGan.YI: TianGan.BING, TianGan.GENG: TianGan.BING,
            TianGan.BING: TianGan.WU, TianGan.XIN: TianGan.WU,
            TianGan.DING: TianGan.GENG, TianGan.REN: TianGan.GENG,
            TianGan.WU: TianGan.REN, TianGan.GUI: TianGan.REN
        }
        base_gan = hour_gan_base[day_gan]
        base_idx = list(TianGan).index(base_gan)
        hour_idx = ((hour + 1) // 2) % 12
        gan = TianGan.from_index(base_idx + hour_idx)
        
        return Pillar(gan, zhi, "时柱")

    def get_wuxing_count(self) -> Dict[WuXing, int]:
        """统计五行个数"""
        count = {wx: 0 for wx in WuXing}
        
        # 统计天干
        for pillar in [self.year_pillar, self.month_pillar, 
                       self.day_pillar, self.hour_pillar]:
            count[pillar.ganzhi.gan.wuxing] += 1
            count[pillar.ganzhi.zhi.wuxing] += 1
        
        return count

    def get_shishen(self, target_gan: TianGan) -> str:
        """计算目标天干相对于日主的十神"""
        rizhu_wx = self.rizhu.wuxing
        target_wx = target_gan.wuxing
        rizhu_yy = self.rizhu.yinyang
        target_yy = target_gan.yinyang

        # 五行生克关系
        shengke = self._get_wuxing_relation(rizhu_wx, target_wx)
        same_yy = (rizhu_yy == target_yy)

        # 根据生克关系和阴阳确定十神
        if shengke == "same":
            return ShiShen.BIJIAN.value if same_yy else ShiShen.JIECAI.value
        elif shengke == "i_generate":
            return ShiShen.SHISHEN.value if same_yy else ShiShen.SHANGGUAN.value
        elif shengke == "i_control":
            return ShiShen.PIANCAI.value if same_yy else ShiShen.ZHENGCAI.value
        elif shengke == "controls_me":
            return ShiShen.QISHA.value if same_yy else ShiShen.ZHENGGUAN.value
        elif shengke == "generates_me":
            return ShiShen.PIANYIN.value if same_yy else ShiShen.ZHENGYIN.value
        
        return "未知"

    def _get_wuxing_relation(self, wx1: WuXing, wx2: WuXing) -> str:
        """获取五行关系"""
        if wx1 == wx2:
            return "same"
        
        # 生克关系
        sheng = {
            WuXing.MU: WuXing.HUO,
            WuXing.HUO: WuXing.TU,
            WuXing.TU: WuXing.JIN,
            WuXing.JIN: WuXing.SHUI,
            WuXing.SHUI: WuXing.MU
        }
        
        ke = {
            WuXing.MU: WuXing.TU,
            WuXing.TU: WuXing.SHUI,
            WuXing.SHUI: WuXing.HUO,
            WuXing.HUO: WuXing.JIN,
            WuXing.JIN: WuXing.MU
        }
        
        if sheng[wx1] == wx2:
            return "i_generate"
        elif sheng[wx2] == wx1:
            return "generates_me"
        elif ke[wx1] == wx2:
            return "i_control"
        elif ke[wx2] == wx1:
            return "controls_me"
        
        return "unknown"

    def format_chart(self) -> str:
        """格式化输出八字排盘"""
        lines = []
        lines.append("=" * 50)
        lines.append("八字排盘")
        lines.append("=" * 50)
        lines.append(f"出生时间: {self.birth_datetime.strftime('%Y年%m月%d日 %H时')}")
        lines.append(f"性别: {'男' if self.gender == 'male' else '女'}")
        lines.append("")
        
        # 四柱
        lines.append("四柱:")
        lines.append(f"  时柱    日柱    月柱    年柱")
        lines.append(f"  {self.hour_pillar.ganzhi}    {self.day_pillar.ganzhi}    "
                    f"{self.month_pillar.ganzhi}    {self.year_pillar.ganzhi}")
        lines.append("")
        
        # 日主
        lines.append(f"日主: {self.rizhu.chinese} ({self.rizhu.wuxing.value})")
        lines.append("")
        
        # 五行统计
        wx_count = self.get_wuxing_count()
        lines.append("五行统计:")
        for wx, count in wx_count.items():
            lines.append(f"  {wx.value}: {count}")
        lines.append("")
        
        # 十神
        lines.append("十神:")
        for pillar in [self.year_pillar, self.month_pillar, 
                       self.day_pillar, self.hour_pillar]:
            shishen = self.get_shishen(pillar.ganzhi.gan)
            lines.append(f"  {pillar.pillar_type} {pillar.ganzhi}: {shishen}")
        
        lines.append("=" * 50)
        return "\n".join(lines)

    def __str__(self):
        return (f"{self.year_pillar.ganzhi} {self.month_pillar.ganzhi} "
                f"{self.day_pillar.ganzhi} {self.hour_pillar.ganzhi}")
