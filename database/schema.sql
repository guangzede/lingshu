-- =============================================
-- 灵枢 (LingShu) 数据库表结构设计
-- Supabase PostgreSQL Schema
-- =============================================

-- =============================================
-- 1. 用户档案表 (profiles)
-- 存储用户基本信息和八字数据
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- 主键：关联 Supabase Auth
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 抖音用户标识
  douyin_openid TEXT UNIQUE NOT NULL,

  -- 用户昵称和头像
  nickname TEXT,
  avatar_url TEXT,

  -- 八字数据（JSONB 格式存储）
  -- 示例: {"year": "庚午", "month": "乙酉", "day": "壬寅", "hour": "癸卯"}
  bazi_json JSONB,

  -- 能量币/积分系统
  energy_coins INTEGER DEFAULT 0 CHECK (energy_coins >= 0),

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引优化查询
CREATE INDEX IF NOT EXISTS idx_profiles_douyin_openid ON public.profiles(douyin_openid);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 添加注释
COMMENT ON TABLE public.profiles IS '用户档案表 - 存储用户基本信息和八字数据';
COMMENT ON COLUMN public.profiles.bazi_json IS '用户八字 JSON 数据，避免重复输入';
COMMENT ON COLUMN public.profiles.energy_coins IS '能量币/积分，用于解锁高级功能';

-- =============================================
-- 2. 股市日历表 (daily_energy)
-- 存储每日干支对应的板块能量数据
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_energy (
  -- 主键：日期
  date DATE PRIMARY KEY,

  -- 干支标识
  ganzhi TEXT NOT NULL,

  -- 五行属性
  element TEXT CHECK (element IN ('金', '木', '水', '火', '土')),

  -- 能量数据（JSONB 格式存储）
  -- 示例: {"bull_sectors": ["半导体", "新能源"], "bear_sectors": ["银行"], "win_rate": 0.68}
  energy_data JSONB,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_daily_energy_ganzhi ON public.daily_energy(ganzhi);
CREATE INDEX IF NOT EXISTS idx_daily_energy_element ON public.daily_energy(element);
CREATE INDEX IF NOT EXISTS idx_daily_energy_date ON public.daily_energy(date DESC);

-- 添加注释
COMMENT ON TABLE public.daily_energy IS '股市日历表 - 存储干支对应的板块能量数据';
COMMENT ON COLUMN public.daily_energy.energy_data IS 'Python 算好的板块概率数据';

-- =============================================
-- 3. 占卜记录表 (fortune_records)
-- 存储用户占卜历史
-- =============================================
CREATE TABLE IF NOT EXISTS public.fortune_records (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 关联用户
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 占卜类型
  fortune_type TEXT NOT NULL CHECK (fortune_type IN ('daily', 'career', 'finance', 'health', 'relationship')),

  -- 占卜结果（AI 生成的文本）
  result_text TEXT NOT NULL,

  -- 输入的八字数据
  input_bazi JSONB,

  -- 占卜日期的干支
  divination_ganzhi TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_fortune_records_user_id ON public.fortune_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fortune_records_created_at ON public.fortune_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fortune_records_type ON public.fortune_records(fortune_type);

-- 添加注释
COMMENT ON TABLE public.fortune_records IS '占卜记录表 - 存储用户占卜历史';

-- =============================================
-- 4. 行级安全策略 (Row Level Security)
-- =============================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fortune_records ENABLE ROW LEVEL SECURITY;

-- profiles 表策略：用户只能查看和修改自己的数据
CREATE POLICY "用户可以查看自己的档案"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的档案"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的档案"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- fortune_records 表策略：用户只能查看自己的占卜记录
CREATE POLICY "用户可以查看自己的占卜记录"
  ON public.fortune_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的占卜记录"
  ON public.fortune_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- daily_energy 表策略：所有认证用户可以查看
CREATE POLICY "所有用户可以查看股市日历"
  ON public.daily_energy FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 5. 触发器：自动更新 updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 6. 示例数据插入（可选）
-- =============================================

-- 插入示例股市日历数据
INSERT INTO public.daily_energy (date, ganzhi, element, energy_data)
VALUES
  ('2026-01-20', '丙午', '火', '{
    "bull_sectors": ["半导体", "新能源"],
    "bear_sectors": ["银行", "房地产"],
    "win_rate": 0.68,
    "description": "火旺之日，科技板块表现活跃"
  }'::jsonb)
ON CONFLICT (date) DO NOTHING;

-- =============================================
-- 完成提示
-- =============================================
-- 表结构创建完成！
-- 下一步：
-- 1. 在 Supabase Dashboard 中执行此 SQL
-- 2. 配置 Edge Functions 用于鉴权
-- 3. 实现前端 API 调用
