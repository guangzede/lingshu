灵枢 (LingShu) - 深度功能实现规格说明书
Version: 2.0 (Deep Dive) Status: Execution Ready Focus: 极低颗粒度功能拆解 & 核心代码逻辑

1. 核心交互组件：赛博罗盘 (The Cyber Luopan)
目标： 实现 B1Y (机械环枢 + 具象符箓 + 磁悬浮流转) 的视觉体验。

1.1 纹理生成工厂 (src/utils/luopanTexture.ts)
功能： 在内存中动态绘制高清透明纹理，避免加载大图片。

F1.1.1 画布初始化

创建 Offscreen Canvas (或 DOM Canvas)，尺寸 2048x128 (长条形)。

ctx.clearRect(0, 0, 2048, 128) 确保背景完全透明。

F1.1.2 符箓排版算法

输入： 字符数组 (如 ['甲','乙'...])。

计算： step = width / array.length。

绘制循环： 遍历数组，在 x = i * step + step/2，y = 64 处绘制文字。

F1.1.3 样式渲染细节 (Style)

font: "bold 60px 'Songti SC', serif" (宋体增强仪式感)。

fillStyle: "#FFD700" (纯金)。

shadowColor: "#FFD700", shadowBlur: 15 (关键：制造霓虹光晕)。

textBaseline: "middle", textAlign: "center"。

F1.1.4 特殊图层处理

Layer 2 (八卦): 需使用 Unicode 字符 ☰ ☱ ☲ ☳...。

Layer 4 (六十四卦): 需确保字体库支持 ䷀ 等特殊字符，若不支持，需回退到用“三长三短”的线条绘制逻辑。

1.2 3D 罗盘实体 (src/components/CyberLuopan.tsx)
功能： 承载纹理，实现机械结构与物理运动。

F1.2.1 几何构建 (Geometry)

生成 5 个 TorusGeometry。

参数锁定：

radius: [1.5, 2.0, 2.5, 3.0, 3.5]

tube: 0.2 (宽厚度)

radialSegments: 4 (核心点：设为 4 可将圆形截面变为矩形，模拟工业金属带)。

tubularSegments: 128 (保证圆环平滑)。

F1.2.2 材质系统 (Shader/Material)

使用 MeshStandardMaterial。

map: 对应层级的 CanvasTexture。

emissiveMap: 同上。

emissive: #FFD700, emissiveIntensity: 2.0 (过曝发光)。

alphaMap: 同上 (利用文字本身做透明通道)，或直接设置 transparent: true 配合 PNG 透明度。

side: DoubleSide (确保从环的内侧也能看到字)。

F1.2.3 物理动效状态机 (Physics)

变量： currentVel (当前速度向量), targetVel (目标速度向量)。

状态 A: 待机 (Idle)

targetVel = 0.0005 (极慢漂移)。

lerpFactor = 0.01 (极高阻尼，像在水银里)。

状态 B: 演算 (Computing)

targetVel = 0.1 (高速运转)。

lerpFactor = 0.05 (较低阻尼，快速响应)。

细节： 每一层的旋转轴 axis 必须不同 (如 Layer0 绕 Y, Layer1 绕 X)，制造错乱感。

状态 C: 归位 (Aligned)

目标旋转角度 targetRotation = 0。

使用 Quaternion.slerp 球面插值归位，产生“磁力吸附”的顿挫感。

1. 核心业务逻辑：AI 命理解析 (The AI Brain)
目标： 输入生辰 -> 转换八字 -> 生成赛博风格断语。

2.1 排盘引擎 (src/utils/baziHelper.ts)
功能： 将公历时间转换为干支数据。

F2.1.1 历法转换

调用 lunar-javascript 的 Solar.fromYmdHms() 转 Lunar。

获取八字：lunar.getBaZi() 返回 ['庚午', '乙酉', ...]。

F2.1.2 五行强弱计算

遍历八字天干地支。

映射五行：庚->金, 午->火...

输出统计：{ 金: 2, 木: 2, 水: 3, 火: 1, 土: 0 } -> 判定“缺土，水旺”。

F2.1.3 纳音与神煞 (进阶)

获取日柱纳音 (如“路旁土”)。

判断是否带“羊刃”、“桃花” (库中自带方法)，增加 AI Prompt 的精准度。

2.2 AI 服务层 (src/services/aiService.ts)
功能： 对接 DeepSeek API，管理 Prompt。

F2.2.1 Prompt 组装

System Prompt: 见 MASTER_SPEC.md 中的人设定义 (赛博道长)。

User Prompt 模板：

JSON
{
  "bazi": "庚午 乙酉 壬寅 癸卯",
  "wuxing": "水旺缺土",
  "current_date": "2026-01-20 (丙午年...)",
  "request": "分析本月财运，指出一个具体的焦虑点。"
}
F2.2.2 流式响应处理 (Stream)

使用 Taro.request (若不支持 stream) 或 Taro.cloud.callContainer。

前端维护一个 messageBuffer。

打字机特效： 收到数据后，不立即全显示，而是每隔 50ms 往 UI 上追加一个字，配合“哒哒哒”的音效。

1. 特色功能：玄学股市量化 (Stock Metaphysics)
目标： 历史数据可视化，规避荐股风险。

3.1 数据清洗脚本 (Python/Local)
功能： 离线处理历史数据，生成静态 JSON 或存入 DB。

F3.1.1 数据获取

使用 akshare 获取上证指数 (sh000001) 近 10 年日线。

获取申万一级行业指数 (31个行业) 日线。

F3.1.2 干支映射 (核心算法)

将每个交易日 2024-01-01 转换为干支 甲子。

提取纳音五行 (甲子 -> 金)。

F3.1.3 概率统计

Query: GROUP BY day_ganzhi (日干支)。

Calculate: 该干支日平均涨幅最高的 Top 3 行业。

Output Example:

JSON
{
  "key": "丙午",
  "element": "Fire",
  "bull_sectors": ["Electronics", "Media"],
  "win_rate": 0.68
}
3.2 前端展示组件 (src/pages/stock/index.tsx)
功能： 极简风格展示“能量天气”。

F3.2.1 能量仪表盘

显示今日干支 (如“丙午”)。

显示五行能量条 (Fire: 80%, Water: 20%)。

F3.2.2 历史回测卡片

文案模板： “历史上的今天 (共出现 12 次)”。

红黑榜： 左侧红字显示“宜关注：半导体”，右侧绿字显示“忌追高：银行”。

合规Footer： 必须吸底显示免责声明，字体颜色 #666。

1. 基础设施与用户系统 (Infrastructure)
4.1 Supabase 数据库设计 (Schema)
Table: profiles (用户表)

id: uuid (PK, ref auth.users)

douyin_openid: text (unique)

bazi_json: jsonb (存储用户的生辰，避免重复输入)

energy_coins: int (代币/积分)

Table: daily_energy (股市日历表)

date: date (PK)

ganzhi: text

energy_data: jsonb (存储 Python 算好的板块概率)

4.2 鉴权流程 (Auth Flow)
F4.2.1 静默登录

前端调用 tt.login() 获取 code。

调用 Supabase Edge Function douyin-login。

后端拿 code 换 openid，签发 Supabase JWT。

前端存储 JWT，后续请求自动带上。

1. 开发任务清单 (Checklist for Copilot)
你可以直接复制下面的任务发给 Copilot：

Task 1 (Visual):

"编写 src/utils/luopanTexture.ts，实现 F1.1 定义的 Canvas 绘图逻辑，支持 Layer 0-4 的不同字符集渲染，确保金色发光样式。"

Task 2 (3D):

"编写 src/components/CyberLuopan.tsx，实现 F1.2 定义的 5 层扁平圆环结构，应用 Task 1 的纹理，并实现 F1.2.3 的物理插值动画。"

Task 3 (Logic):

"编写 src/utils/baziHelper.ts，集成 lunar-javascript，实现公历转八字及五行统计功能。"

Task 4 (Data):

"设计 Supabase 的 profiles 和 daily_energy 表结构的 SQL 建表语句。"

Task 5 (UI):

"编写首页 src/pages/index.tsx，背景全黑，居中放置 CyberLuopan 组件，底部放置一个半透明的‘启动’按钮。"
