# 六爻排盘规划与实现说明

本文档记录六爻排盘的组件划分、规则来源与服务接口，以便快速迭代与测试。

## 组件与分层
- LiuyaoPage：页面容器与路由承载。
- LiuyaoInputPanel：日时选择、起卦方式、动爻切换、派系规则选择。
- LineEditor：单爻编辑（阴/阳、动/静），支持六条一致交互与批量操作。
- TrigramView：上下卦三爻可视化。
- HexagramView：本卦/变卦/互卦卡片切换。
- NaJiaTable：纳甲后的天干地支表。
- SixGodStrip：按“日干起六神”规则的六神排位。
- RelationsPanel：六亲、用神/忌神与旺衰摘要（后续迭代）。

## 领域类型与规则
- 类型定义：`src/types/liuyao.ts`
- 规则常量：`src/constants/liuyaoRules.ts`
	- 八卦纳甲（基础版）：乾甲、兑丁、离己、震庚、巽辛、坎戊、艮丙、坤乙。
	- 六神起例（按日干）：甲乙青龙、丙丁朱雀、戊勾陈、己腾蛇、庚辛白虎、壬癸玄武；顺序为青龙→朱雀→勾陈→腾蛇→白虎→玄武循环。
	- 地支排法：支持“按八卦定义六位地支序列（自下而上）”，未提供则回退默认序列。

### 地支序列（已确认）
- 乾：子 → 寅 → 辰 → 午 → 申 → 戌（自下至上 1~6 爻）
- 坎：寅 → 辰 → 午 → 申 → 戊 → 子
- 艮：辰 → 午 → 申 → 戍 → 子 → 寅
- 震：子 → 寅 → 辰 → 午 → 申 → 戌
- 巽：丑 → 亥 → 酉 → 未 → 巳 → 卯
- 離：卯 → 丑 → 亥 → 酉 → 未 → 巳
- 坤：未 → 巳 → 卯 → 丑 → 亥 → 酉
- 兌：巳 → 卯 → 丑 → 亥 → 酉 → 未

- 其余卦位请继续提供，我将补充到规则表。

## 服务接口
位于 `src/services/liuyao.ts`：
- `buildHexagram(lines)`：由六爻构建本卦（拆上下卦）。
- `deriveVariant(hex)`：动爻变卦。
- `deriveMutual(hex)`：互卦（取二三四为下，三四五为上）。
- `getDayStemBranch(date)`：使用 lunar-javascript 获取日干支。
- `assignSixGods(date, rule, yaos)`：按规则起六神并写入爻。
- `mapNaJia(hex, rule)`：纳甲（当前为基础版，支持扩展到位次细分）。
- `computeAll(lines, options)`：整合输出（本/变/互、纳甲、六神）。

## 说明
- 目前纳甲为基础映射，位次细分与地支排法将以派系规则扩展。
- 后续将补充六亲、世应、旺衰与旬空等计算模块及测试用例。

# 六爻排盘功能

## 文件路径规划

入口:src/pages/LiuYao/index.tsx
组件:



## 纳甲歌

乾金甲子外壬午，子寅辰午申戍；
坎水戊寅外戊申，寅辰午申戊子；
艮土丙辰外丙戍，辰午申戍子寅；
震木庚子外庚午，子寅辰午申戍；
巽木辛丑外辛未，丑亥酉未巳卯；
離火巳卯外巳酉，卯丑亥酉未巳；
坤土乙未外癸丑，未巳卯丑亥酉；
兌金丁巳外丁亥，巳卯丑亥酉未；






## 安放世应歌
八卦之首世六當，己下初爻輪上颺。游魂八位四爻立，歸魂八位三爻詳。

## 起六神訣
甲乙起青龍，丙丁起朱雀，戊日起勾陳，己日起螣蛇，庚辛起白虎，壬癸起玄武。


## 八宫卦

```javascript
const hexagrams = [
  // 世爻 应爻的数据是从下往上数第n个爻,从0开始为初爻,5为六爻

  // --- 乾宫 (金) ---
  { name: "乾为天", code: "111111", palace: "乾宫", element: "金", category: "本宫"}, // 世爻:上爻 应爻:三爻
  { name: "天风姤", code: "011111", palace: "乾宫", element: "金", category: "一世" }, // 世爻:初爻 应爻:四爻
  { name: "天山遁", code: "001111", palace: "乾宫", element: "金", category: "二世" }, // 世爻:二爻 应爻:五爻
  { name: "天地否", code: "000111", palace: "乾宫", element: "金", category: "三世" }, // 世爻:三爻 应爻:上爻
  { name: "风地观", code: "000011", palace: "乾宫", element: "金", category: "四世" }, // 世爻:四爻 应爻:初爻
  { name: "山地剥", code: "000001", palace: "乾宫", element: "金", category: "五世" }, // 世爻:五爻 应爻:二爻
  { name: "火地晋", code: "000101", palace: "乾宫", element: "金", category: "游魂" }, // 世爻:四爻 应爻:初爻
  { name: "火天大有", code: "111101", palace: "乾宫", element: "金", category: "归魂" }, // 世爻:三爻 应爻: 六爻

  // --- 震宫 (木) ---
  { name: "震为雷", code: "100100", palace: "震宫", element: "木", category: "本宫" },
  { name: "雷地豫", code: "000100", palace: "震宫", element: "木", category: "一世" },
  { name: "雷水解", code: "010100", palace: "震宫", element: "木", category: "二世" },
  { name: "雷风恒", code: "011100", palace: "震宫", element: "木", category: "三世" },
  { name: "地风升", code: "011000", palace: "震宫", element: "木", category: "四世" },
  { name: "水风井", code: "011010", palace: "震宫", element: "木", category: "五世" },
  { name: "泽风大过", code: "011110", palace: "震宫", element: "木", category: "游魂" },
  { name: "泽雷随", code: "100110", palace: "震宫", element: "木", category: "归魂" },

  // --- 坎宫 (水) ---
  { name: "坎为水", code: "010010", palace: "坎宫", element: "水", category: "本宫" },
  { name: "水泽节", code: "110010", palace: "坎宫", element: "水", category: "一世" },
  { name: "水雷屯", code: "100010", palace: "坎宫", element: "水", category: "二世" },
  { name: "水火既济", code: "101010", palace: "坎宫", element: "水", category: "三世" },
  { name: "泽火革", code: "101110", palace: "坎宫", element: "水", category: "四世" },
  { name: "雷火丰", code: "101100", palace: "坎宫", element: "水", category: "五世" },
  { name: "地火明夷", code: "101000", palace: "坎宫", element: "水", category: "游魂" },
  { name: "地水师", code: "010000", palace: "坎宫", element: "水", category: "归魂" },

  // --- 艮宫 (土) ---
  { name: "艮为山", code: "001001", palace: "艮宫", element: "土", category: "本宫" },
  { name: "山火贲", code: "101001", palace: "艮宫", element: "土", category: "一世" },
  { name: "山天大畜", code: "111001", palace: "艮宫", element: "土", category: "二世" },
  { name: "山泽损", code: "110001", palace: "艮宫", element: "土", category: "三世" },
  { name: "火泽睽", code: "110101", palace: "艮宫", element: "土", category: "四世" },
  { name: "天泽履", code: "110111", palace: "艮宫", element: "土", category: "五世" },
  { name: "风泽中孚", code: "110011", palace: "艮宫", element: "土", category: "游魂" },
  { name: "风山渐", code: "001011", palace: "艮宫", element: "土", category: "归魂" },

  // --- 坤宫 (土) ---
  { name: "坤为地", code: "000000", palace: "坤宫", element: "土", category: "本宫" },
  { name: "地雷复", code: "100000", palace: "坤宫", element: "土", category: "一世" },
  { name: "地泽临", code: "110000", palace: "坤宫", element: "土", category: "二世" },
  { name: "地天泰", code: "111000", palace: "坤宫", element: "土", category: "三世" },
  { name: "雷天大壮", code: "111100", palace: "坤宫", element: "土", category: "四世" },
  { name: "泽天夬", code: "111110", palace: "坤宫", element: "土", category: "五世" },
  { name: "水天需", code: "111010", palace: "坤宫", element: "土", category: "游魂" },
  { name: "水地比", code: "000010", palace: "坤宫", element: "土", category: "归魂" },

  // --- 巽宫 (木) ---
  { name: "巽为风", code: "011011", palace: "巽宫", element: "木", category: "本宫" },
  { name: "风天小畜", code: "111011", palace: "巽宫", element: "木", category: "一世" },
  { name: "风火家人", code: "101011", palace: "巽宫", element: "木", category: "二世" },
  { name: "风雷益", code: "100011", palace: "巽宫", element: "木", category: "三世" },
  { name: "天雷无妄", code: "100111", palace: "巽宫", element: "木", category: "四世" },
  { name: "火雷噬嗑", code: "100101", palace: "巽宫", element: "木", category: "五世" },
  { name: "山雷颐", code: "100001", palace: "巽宫", element: "木", category: "游魂" },
  { name: "山风蛊", code: "011001", palace: "巽宫", element: "木", category: "归魂" },

  // --- 离宫 (火) ---
  { name: "离为火", code: "101101", palace: "离宫", element: "火", category: "本宫" },
  { name: "火山旅", code: "001101", palace: "离宫", element: "火", category: "一世" },
  { name: "火风鼎", code: "011101", palace: "离宫", element: "火", category: "二世" },
  { name: "火水未济", code: "010101", palace: "离宫", element: "火", category: "三世" },
  { name: "山水蒙", code: "010001", palace: "离宫", element: "火", category: "四世" },
  { name: "风水涣", code: "010011", palace: "离宫", element: "火", category: "五世" },
  { name: "天水讼", code: "010111", palace: "离宫", element: "火", category: "游魂" },
  { name: "天火同人", code: "101111", palace: "离宫", element: "火", category: "归魂" },

  // --- 兑宫 (金) ---
  { name: "兑为泽", code: "110110", palace: "兑宫", element: "金", category: "本宫" },
  { name: "泽水困", code: "010110", palace: "兑宫", element: "金", category: "一世" },
  { name: "泽地萃", code: "000110", palace: "兑宫", element: "金", category: "二世" },
  { name: "泽山咸", code: "001110", palace: "兑宫", element: "金", category: "三世" },
  { name: "水山蹇", code: "001010", palace: "兑宫", element: "金", category: "四世" },
  { name: "地山谦", code: "001000", palace: "兑宫", element: "金", category: "五世" },
  { name: "雷山小过", code: "001100", palace: "兑宫", element: "金", category: "游魂" },
  { name: "雷泽归妹", code: "110100", palace: "兑宫", element: "金", category: "归魂" }
];
```

## 伏神逻辑

### 卦中若缺用神爻， 且向本宫首卦找。 同位借来伏飞下， 飞伏生克要记牢。

``` text
先看主卦是不是六亲不全。
缺了就去查这个卦所属“本宫”的纯卦（首卦）。
在首卦相同的位置（爻位）找到那个缺失的六亲，把它“伏”在主卦对应爻的下面。
```
