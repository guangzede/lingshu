"""
五运六气 (Five Movements and Six Qi)
中医运气学说系统
"""

from enum import Enum
from typing import Dict, List
from .tiangan_dizhi import TianGan, DiZhi, WuXing, GanZhi


class WuYun(Enum):
    """五运 (Five Movements)"""
    MU = ("木运", WuXing.MU, "肝胆", "风")
    HUO = ("火运", WuXing.HUO, "心小肠", "热")
    TU = ("土运", WuXing.TU, "脾胃", "湿")
    JIN = ("金运", WuXing.JIN, "肺大肠", "燥")
    SHUI = ("水运", WuXing.SHUI, "肾膀胱", "寒")

    def __init__(self, yun_name: str, wuxing: WuXing, zangfu: str, qi: str):
        self.yun_name = yun_name
        self.wuxing = wuxing
        self.zangfu = zangfu  # 脏腑
        self.qi = qi  # 气候

    @classmethod
    def from_tiangan(cls, gan: TianGan):
        """从天干推算五运"""
        # 甲己化土，乙庚化金，丙辛化水，丁壬化木，戊癸化火
        mapping = {
            TianGan.JIA: cls.TU, TianGan.JI: cls.TU,
            TianGan.YI: cls.JIN, TianGan.GENG: cls.JIN,
            TianGan.BING: cls.SHUI, TianGan.XIN: cls.SHUI,
            TianGan.DING: cls.MU, TianGan.REN: cls.MU,
            TianGan.WU: cls.HUO, TianGan.GUI: cls.HUO
        }
        return mapping[gan]


class LiuQi(Enum):
    """六气 (Six Qi)"""
    JUEYIN = ("厥阴风木", "风", WuXing.MU, "初之气")
    SHAOYIN = ("少阴君火", "热", WuXing.HUO, "二之气")
    SHAOYANG = ("少阳相火", "火", WuXing.HUO, "三之气")
    TAIYIN = ("太阴湿土", "湿", WuXing.TU, "四之气")
    YANGMING = ("阳明燥金", "燥", WuXing.JIN, "五之气")
    TAIYANG = ("太阳寒水", "寒", WuXing.SHUI, "终之气")

    def __init__(self, qi_name: str, qi: str, wuxing: WuXing, season: str):
        self.qi_name = qi_name
        self.qi = qi
        self.wuxing = wuxing
        self.season = season

    @classmethod
    def from_dizhi(cls, zhi: DiZhi):
        """从地支推算主气"""
        # 子午少阴君火，丑未太阴湿土，寅申少阳相火
        # 卯酉阳明燥金，辰戌太阳寒水，巳亥厥阴风木
        mapping = {
            DiZhi.ZI: cls.SHAOYIN, DiZhi.WU: cls.SHAOYIN,
            DiZhi.CHOU: cls.TAIYIN, DiZhi.WEI: cls.TAIYIN,
            DiZhi.YIN: cls.SHAOYANG, DiZhi.SHEN: cls.SHAOYANG,
            DiZhi.MAO: cls.YANGMING, DiZhi.YOU: cls.YANGMING,
            DiZhi.CHEN: cls.TAIYANG, DiZhi.XU: cls.TAIYANG,
            DiZhi.SI: cls.JUEYIN, DiZhi.HAI: cls.JUEYIN
        }
        return mapping[zhi]


class WuYunLiuQi:
    """五运六气系统"""

    def __init__(self, year: int):
        self.year = year
        self.ganzhi = GanZhi.from_year(year)
        self.wuyun = WuYun.from_tiangan(self.ganzhi.gan)
        self.liuqi = LiuQi.from_dizhi(self.ganzhi.zhi)

    def get_yearly_fortune(self) -> Dict[str, str]:
        """获取年度运气特征"""
        return {
            "年份": str(self.year),
            "干支": str(self.ganzhi),
            "五运": self.wuyun.yun_name,
            "运之五行": self.wuyun.wuxing.value,
            "主气": self.liuqi.qi_name,
            "气候特征": f"{self.wuyun.qi}、{self.liuqi.qi}",
            "相关脏腑": self.wuyun.zangfu
        }

    def get_seasonal_qi(self) -> List[Dict[str, str]]:
        """获取六气分布（六个季节）"""
        liuqi_order = [
            LiuQi.JUEYIN, LiuQi.SHAOYIN, LiuQi.SHAOYANG,
            LiuQi.TAIYIN, LiuQi.YANGMING, LiuQi.TAIYANG
        ]
        
        seasons = []
        for i, qi in enumerate(liuqi_order, 1):
            seasons.append({
                "序号": f"第{i}气",
                "名称": qi.qi_name,
                "气候": qi.qi,
                "五行": qi.wuxing.value,
                "时令": qi.season
            })
        return seasons

    def analyze_health_tendency(self) -> Dict[str, List[str]]:
        """分析健康倾向"""
        # 根据五运六气分析可能的健康问题
        wuyun_health = {
            WuYun.MU: ["肝气郁结", "眩晕", "筋脉不利"],
            WuYun.HUO: ["心火亢盛", "失眠", "口舌生疮"],
            WuYun.TU: ["脾胃虚弱", "湿困", "消化不良"],
            WuYun.JIN: ["肺燥", "咳嗽", "皮肤干燥"],
            WuYun.SHUI: ["肾虚", "怕冷", "水肿"]
        }

        liuqi_health = {
            LiuQi.JUEYIN: ["风邪", "头痛", "关节痛"],
            LiuQi.SHAOYIN: ["热病", "烦躁", "出汗"],
            LiuQi.SHAOYANG: ["相火妄动", "目赤", "咽痛"],
            LiuQi.TAIYIN: ["湿盛", "身重", "腹胀"],
            LiuQi.YANGMING: ["燥邪", "便秘", "鼻干"],
            LiuQi.TAIYANG: ["寒邪", "畏寒", "腰痛"]
        }

        return {
            "运势影响": wuyun_health.get(self.wuyun, []),
            "气候影响": liuqi_health.get(self.liuqi, []),
            "养生建议": self._get_yangsheng_advice()
        }

    def _get_yangsheng_advice(self) -> List[str]:
        """获取养生建议"""
        advice_map = {
            WuYun.MU: ["疏肝理气", "适当运动", "保持心情舒畅"],
            WuYun.HUO: ["清心降火", "避免熬夜", "饮食清淡"],
            WuYun.TU: ["健脾祛湿", "饮食规律", "避免生冷"],
            WuYun.JIN: ["润肺养阴", "多喝水", "避免辛辣"],
            WuYun.SHUI: ["温肾壮阳", "注意保暖", "适量补益"]
        }
        return advice_map.get(self.wuyun, [])

    def __str__(self):
        return f"{self.year}年 {self.ganzhi} {self.wuyun.yun_name} {self.liuqi.qi_name}"
