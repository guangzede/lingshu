"""
天干地支 (Heavenly Stems and Earthly Branches)
中国传统历法的基础系统
"""

from enum import Enum
from typing import Tuple


class WuXing(Enum):
    """五行 (Five Elements)"""
    MU = "木"    # Wood
    HUO = "火"   # Fire
    TU = "土"    # Earth
    JIN = "金"   # Metal
    SHUI = "水"  # Water


class YinYang(Enum):
    """阴阳"""
    YANG = "阳"  # Yang
    YIN = "阴"   # Yin


class TianGan(Enum):
    """十天干 (10 Heavenly Stems)"""
    JIA = ("甲", WuXing.MU, YinYang.YANG)    # 1
    YI = ("乙", WuXing.MU, YinYang.YIN)      # 2
    BING = ("丙", WuXing.HUO, YinYang.YANG)  # 3
    DING = ("丁", WuXing.HUO, YinYang.YIN)   # 4
    WU = ("戊", WuXing.TU, YinYang.YANG)     # 5
    JI = ("己", WuXing.TU, YinYang.YIN)      # 6
    GENG = ("庚", WuXing.JIN, YinYang.YANG)  # 7
    XIN = ("辛", WuXing.JIN, YinYang.YIN)    # 8
    REN = ("壬", WuXing.SHUI, YinYang.YANG)  # 9
    GUI = ("癸", WuXing.SHUI, YinYang.YIN)   # 10

    def __init__(self, chinese: str, wuxing: WuXing, yinyang: YinYang):
        self.chinese = chinese
        self.wuxing = wuxing
        self.yinyang = yinyang

    @classmethod
    def from_index(cls, index: int):
        """从索引获取天干 (0-9)"""
        stems = list(cls)
        return stems[index % 10]

    @classmethod
    def from_year(cls, year: int):
        """从公历年份计算天干"""
        # 甲子年为1984年，天干周期为10
        return cls.from_index((year - 4) % 10)


class DiZhi(Enum):
    """十二地支 (12 Earthly Branches)"""
    ZI = ("子", WuXing.SHUI, YinYang.YANG, "鼠", 11)   # Rat
    CHOU = ("丑", WuXing.TU, YinYang.YIN, "牛", 1)     # Ox
    YIN = ("寅", WuXing.MU, YinYang.YANG, "虎", 3)     # Tiger
    MAO = ("卯", WuXing.MU, YinYang.YIN, "兔", 5)      # Rabbit
    CHEN = ("辰", WuXing.TU, YinYang.YANG, "龙", 7)    # Dragon
    SI = ("巳", WuXing.HUO, YinYang.YIN, "蛇", 9)      # Snake
    WU = ("午", WuXing.HUO, YinYang.YANG, "马", 11)    # Horse
    WEI = ("未", WuXing.TU, YinYang.YIN, "羊", 13)     # Goat
    SHEN = ("申", WuXing.JIN, YinYang.YANG, "猴", 15)  # Monkey
    YOU = ("酉", WuXing.JIN, YinYang.YIN, "鸡", 17)    # Rooster
    XU = ("戌", WuXing.TU, YinYang.YANG, "狗", 19)     # Dog
    HAI = ("亥", WuXing.SHUI, YinYang.YIN, "猪", 21)   # Pig

    def __init__(self, chinese: str, wuxing: WuXing, yinyang: YinYang, 
                 animal: str, month: int):
        self.chinese = chinese
        self.wuxing = wuxing
        self.yinyang = yinyang
        self.animal = animal
        self.month = month  # 对应的月份时辰

    @classmethod
    def from_index(cls, index: int):
        """从索引获取地支 (0-11)"""
        branches = list(cls)
        return branches[index % 12]

    @classmethod
    def from_year(cls, year: int):
        """从公历年份计算地支"""
        # 甲子年为1984年，地支周期为12
        return cls.from_index((year - 4) % 12)

    @classmethod
    def from_month(cls, month: int):
        """从月份计算地支 (1-12月)"""
        # 寅月为正月(立春后)
        month_to_zhi = {
            1: cls.YIN, 2: cls.MAO, 3: cls.CHEN, 4: cls.SI,
            5: cls.WU, 6: cls.WEI, 7: cls.SHEN, 8: cls.YOU,
            9: cls.XU, 10: cls.HAI, 11: cls.ZI, 12: cls.CHOU
        }
        return month_to_zhi.get(month, cls.ZI)

    @classmethod
    def from_hour(cls, hour: int):
        """从时辰计算地支 (0-23时)"""
        # 子时: 23-1, 丑时: 1-3, ...
        hour_index = ((hour + 1) // 2) % 12
        return cls.from_index(hour_index)


class GanZhi:
    """干支组合"""
    
    def __init__(self, gan: TianGan, zhi: DiZhi):
        self.gan = gan
        self.zhi = zhi

    def __str__(self):
        return f"{self.gan.chinese}{self.zhi.chinese}"

    def __repr__(self):
        return f"GanZhi({self.gan.chinese}{self.zhi.chinese})"

    @classmethod
    def from_year(cls, year: int):
        """从公历年份计算干支"""
        gan = TianGan.from_year(year)
        zhi = DiZhi.from_year(year)
        return cls(gan, zhi)

    @classmethod
    def from_index(cls, index: int):
        """从六十甲子序号获取干支 (0-59)"""
        gan = TianGan.from_index(index)
        zhi = DiZhi.from_index(index)
        return cls(gan, zhi)

    def get_nayin(self) -> str:
        """获取纳音五行
        
        纳音是根据六十甲子的位置计算得出的五行属性。
        传统口诀：甲子乙丑海中金，丙寅丁卯炉中火...
        """
        # 六十甲子纳音表（按顺序对应六十甲子）
        nayin_table = [
            "海中金", "炉中火", "大林木", "路旁土", "剑锋金",
            "山头火", "涧下水", "城头土", "白蜡金", "杨柳木",
            "井泉水", "屋上土", "霹雳火", "松柏木", "长流水",
            "沙中金", "山下火", "平地木", "壁上土", "金箔金",
            "覆灯火", "天河水", "大驿土", "钗钏金", "桑柘木",
            "大溪水", "沙中土", "天上火", "石榴木", "大海水"
        ]
        # 计算在六十甲子中的位置
        gan_idx = list(TianGan).index(self.gan)
        zhi_idx = list(DiZhi).index(self.zhi)
        # 六十甲子索引公式：根据天干地支位置推算
        # 使用中国剩余定理求解：满足 x ≡ gan_idx (mod 10) 且 x ≡ zhi_idx (mod 12)
        jiazi_index = (gan_idx * 6 + zhi_idx * 5) % 60
        # 纳音每两个甲子共享一个，所以除以2
        return nayin_table[jiazi_index // 2]

    @property
    def wuxing(self) -> Tuple[WuXing, WuXing]:
        """获取天干地支五行"""
        return (self.gan.wuxing, self.zhi.wuxing)

    @property
    def yinyang(self) -> Tuple[YinYang, YinYang]:
        """获取天干地支阴阳"""
        return (self.gan.yinyang, self.zhi.yinyang)


def year_to_ganzhi(year: int) -> str:
    """将公历年份转换为干支年"""
    ganzhi = GanZhi.from_year(year)
    return str(ganzhi)
