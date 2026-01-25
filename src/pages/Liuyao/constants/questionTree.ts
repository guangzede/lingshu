/**
 * 占卜关键词决策树 (完整版)
 * 结构说明：
 * 1. category: 第一级大类 (用户意图)
 * 2. detail: 第二级具体场景 (根据 category.id 索引)
 * 3. question: 第三级核心疑问 (根据 category.id 索引，若无匹配则使用 common)
 */
export const WORD_TREE = {
  // ==========================================
  // Level 1: 核心大类 (Category)
  // ==========================================
  category: [
    { id: 'love', label: '问情', desc: '姻缘·复合·桃花' },
    { id: 'cai', label: '求财', desc: '投资·讨债·薪水' },
    { id: 'work', label: '事业', desc: '工作·官司·前程' },
    { id: 'study', label: '学业', desc: '考试·升学·考证' },
    { id: 'family', label: '家宅', desc: '婚姻·子女·家务' },
    { id: 'health', label: '平安', desc: '健康·美容·养生' },
    { id: 'fortune', label: '运势', desc: '流年·月运·去晦' },
    { id: 'feng_shui', label: '风水', desc: '阳宅·阴宅·堪舆' },
    { id: 'lost_found', label: '寻物', desc: '失物·寻人·失踪' },
    { id: 'compatibility', label: '合婚', desc: '八字·生肖·配对' }
  ],

  // ==========================================
  // Level 2: 具体场景 (Detail / Scenario)
  // ==========================================
  detail: {
    // --- 问情场景 ---
    love: [
      { id: 'crush', label: '暗恋', desc: '未确立关系' },
      { id: 'ex', label: '前任', desc: '分手/断联' },
      { id: 'partner', label: '对象', desc: '现任/伴侣' },
      { id: 'marriage', label: '婚姻', desc: '已婚关系' },
      { id: 'single', label: '脱单', desc: '单身求偶' },
      { id: 'affair', label: '暧昧', desc: '模糊不清' },
      { id: 'trouble', label: '烂桃花', desc: '纠缠干扰' },
      { id: 'blind_date', label: '相亲', desc: '新人接触' }
    ],

    // --- 求财场景 ---
    cai: [
      { id: 'invest', label: '投资', desc: '股票/基金/理财' },
      { id: 'debt', label: '讨债', desc: '外债/借款' },
      { id: 'salary', label: '正财', desc: '涨薪/奖金' },
      { id: 'side_job', label: '偏财', desc: '兼职/副业/彩票' },
      { id: 'business', label: '生意', desc: '开店/经营/订单' },
      { id: 'property', label: '买卖', desc: '房产/车产交易' },
      { id: 'coop', label: '合伙', desc: '合作求财' }
    ],

    // --- 事业场景 ---
    work: [
      { id: 'interview', label: '面试', desc: '求职/新工作' },
      { id: 'promotion', label: '升迁', desc: '职位变动/竞聘' },
      { id: 'hop', label: '跳槽', desc: '离职/去留抉择' },
      { id: 'startup', label: '创业', desc: '下海/新项目' },
      { id: 'official', label: '公职', desc: '考公/编制' },
      { id: 'lawsuit', label: '官司', desc: '诉讼/合同纠纷' },
      { id: 'politics', label: '小人', desc: '人际关系/排挤' },
      { id: 'project', label: '项目', desc: '工程/任务成败' }
    ],

    // --- 学业场景 ---
    study: [
      { id: 'exam', label: '大考', desc: '高考/考研/考博' },
      { id: 'cert', label: '考证', desc: '资格证/技能' },
      { id: 'abroad', label: '留学', desc: '出国/申请' },
      { id: 'school', label: '择校', desc: '志愿填报' },
      { id: 'thesis', label: '论文', desc: '毕业/答辩' }
    ],

    // --- 家宅场景 ---
    family: [
      { id: 'pregnancy', label: '求子', desc: '怀孕/生产/备孕' },
      { id: 'marriage_quality', label: '婚姻质量', desc: '夫妻关系/感情冷淡' },
      { id: 'parent_child', label: '亲子教育', desc: '孩子叛逆/亲子沟通' },
      { id: 'housework', label: '家务分工', desc: '家务纠纷/家庭分工' },
      { id: 'elder_care', label: '赡养长辈', desc: '父母健康/养老规划' },
      { id: 'sibling', label: '兄弟姐妹', desc: '手足矛盾/遗产分配' },
      { id: 'moving', label: '搬家迁居', desc: '搬家择日/新家风水' },
      { id: 'pets', label: '宠物照顾', desc: '宠物走失/宠物健康' }
    ],

    // --- 平安场景 ---
    health: [
      { id: 'self_illness', label: '身体不适', desc: '病症/疼痛/不适' },
      { id: 'surgery', label: '手术治疗', desc: '手术吉凶/医疗方案' },
      { id: 'mental', label: '心理健康', desc: '抑郁/焦虑/压力' },
      { id: 'beauty', label: '美容养颜', desc: '护肤/祛斑/祛痘' },
      { id: 'weight', label: '减肥塑形', desc: '减肥计划/体重管理' },
      { id: 'sleep', label: '睡眠问题', desc: '失眠/多梦/疲劳' },
      { id: 'fitness', label: '健身运动', desc: '运动计划/锻炼效果' },
      { id: 'travel_safety', label: '出行安全', desc: '出差/旅游/回家安危' },
      { id: 'accident', label: '意外事故', desc: '血光/惊吓/磕碰' }
    ],

    // --- 运势场景 ---
    fortune: [
      { id: 'year_luck', label: '年运', desc: '本年总运势' },
      { id: 'month_luck', label: '月运', desc: '本月运势' },
      { id: 'bad_luck', label: '去晦', desc: '最近倒霉' },
      { id: 'choice', label: '抉择', desc: '两难选择' }
    ],

    // --- 风水堪舆场景 ---
    feng_shui: [
      { id: 'yang_house', label: '阳宅', desc: '住宅风水' },
      { id: 'yin_house', label: '阴宅', desc: '坟墓风水' },
      { id: 'direction', label: '方位', desc: '东南西北·福位' },
      { id: 'renovation', label: '装修', desc: '改建·布局·调整' },
      { id: 'entrance', label: '门位', desc: '大门·玄关·格局' },
      { id: 'bedroom', label: '卧室', desc: '床位·朝向·禁忌' },
      { id: 'office', label: '办公', desc: '办公室·座位·格局' },
      { id: 'shop', label: '店铺', desc: '生意·风水·位置' }
    ],

    // --- 寻物寻人场景 ---
    lost_found: [
      { id: 'lost_item', label: '失物', desc: '丢失物品位置' },
      { id: 'lost_person', label: '寻人', desc: '失踪人员踪迹' },
      { id: 'stolen', label: '失盗', desc: '被偷物品追踪' },
      { id: 'pet_lost', label: '宠物走失', desc: '宠物去向' },
      { id: 'document', label: '证件', desc: '身份证·护照·证件' },
      { id: 'valuables', label: '贵重物品', desc: '首饰·现金·古董' },
      { id: 'missing_child', label: '失踪儿童', desc: '儿童去向·安全' }
    ],

    // --- 合婚配对场景 ---
    compatibility: [
      { id: 'eight_char', label: '八字合婚', desc: '四柱八字配对' },
      { id: 'zodiac', label: '生肖配对', desc: '十二生肖相合相冲' },
      { id: 'name_match', label: '姓名配对', desc: '笔画·五格·姓名学' },
      { id: 'five_element', label: '五行配对', desc: '五行属性·相生相克' },
      { id: 'date_auspicious', label: '结婚日期', desc: '择日·吉日·婚期' },
      { id: 'divorce_sign', label: '婚变信号', desc: '是否会离婚·危机' },
      { id: 'third_party', label: '第三者', desc: '有无第三者·介入' }
    ]
  },

  // ==========================================
  // Level 3: 核心疑问 (Key Question) - 映射表
  // ==========================================
  question: {
    // [Love] 专属提问
    love: [
      { id: 'feeling', label: '对方心意', desc: 'Ta还爱我吗/怎么想的' },
      { id: 'result', label: '最终结果', desc: '能成吗/会结婚吗' },
      { id: 'reunion', label: '能否复合', desc: '还有机会在一起吗' },
      { id: 'cheating', label: '有无他人', desc: '是否有第三者/出轨' },
      { id: 'timing', label: '何时出现', desc: '正缘什么时候来' },
      { id: 'crisis', label: '能否化解', desc: '矛盾解决/不离婚' },
      { id: 'sincerity', label: '是否真心', desc: '是玩玩还是认真' }
    ],

    // [Cai] 专属提问
    cai: [
      { id: 'profit', label: '能否获利', desc: '赚还是赔/盈亏' },
      { id: 'recover', label: '能否回本', desc: '钱能要回来吗' },
      { id: 'timing', label: '何时进账', desc: '资金什么时候到位' },
      { id: 'risk', label: '有无风险', desc: '会不会被坑/套牢' },
      { id: 'direction', label: '求财方位', desc: '去哪个方向发展' },
      { id: 'amount', label: '财运多寡', desc: '能赚多少/大财小财' }
    ],

    // [Work] 专属提问
    work: [
      { id: 'success', label: '能否成功', desc: '能考上吗/能赢吗' },
      { id: 'choice', label: '如何选择', desc: '去A还是去B/留还是走' },
      { id: 'timing', label: '何时变动', desc: '什么时候升职/调动' },
      { id: 'trend', label: '吉凶趋势', desc: '未来发展前景如何' },
      { id: 'enemy', label: '谁是小人', desc: '阻碍来自哪里' },
      { id: 'offer', label: '能否录用', desc: '面试能过吗' }
    ],

    // [Study] 专属提问
    study: [
      { id: 'pass', label: '能否考过', desc: '上岸/及格' },
      { id: 'rank', label: '名次如何', desc: '考得好不好' },
      { id: 'school', label: '能否录取', desc: '能去心仪学校吗' },
      { id: 'suit', label: '是否适合', desc: '这个专业适合我吗' }
    ],

    // [Family] 专属提问
    family: [
      { id: 'pregnancy_status', label: '求子吉凶', desc: '能否怀孕/顺利吗' },
      { id: 'marriage_quality', label: '婚姻质量', desc: '夫妻感情好吗' },
      { id: 'parent_child_harmony', label: '亲子关系', desc: '孩子听话吗/能沟通吗' },
      { id: 'housework_fair', label: '家务分工', desc: '分工公平吗/谁有怨言' },
      { id: 'elder_health', label: '长辈安康', desc: '父母健康如何/需要帮助' },
      { id: 'sibling_dispute', label: '手足纠纷', desc: '能否和解/分配公平' },
      { id: 'moving_timing', label: '搬家吉日', desc: '何时搬家最好/新家如何' },
      { id: 'pet_safety', label: '宠物安全', desc: '宠物能找回吗/健康吗' }
    ],

    // [Health] 专属提问
    health: [
      { id: 'illness_severity', label: '病情轻重', desc: '严重吗/平安吗' },
      { id: 'recovery_timing', label: '康复时间', desc: '什么时候能好' },
      { id: 'treatment_suitable', label: '医疗方案', desc: '医生/方案对不对' },
      { id: 'mental_status', label: '心理状态', desc: '能走出抑郁吗/压力大吗' },
      { id: 'beauty_effect', label: '美容效果', desc: '能成功吗/多久见效' },
      { id: 'weight_loss_success', label: '减肥成效', desc: '能减肥成功吗/多久见效' },
      { id: 'sleep_improve', label: '睡眠改善', desc: '失眠能治好吗/何时好转' },
      { id: 'fitness_progress', label: '健身计划', desc: '锻炼有效吗/能坚持吗' },
      { id: 'travel_safety', label: '出行平安', desc: '路上顺利吗/安全吗' },
      { id: 'accident_severity', label: '意外吉凶', desc: '严重吗/能化解吗' }
    ],

    // [Fortune] 专属提问
    fortune: [
      { id: 'overview', label: '整体运势', desc: '运气打分' },
      { id: 'bad', label: '何时转运', desc: '倒霉日子什么时候头' },
      { id: 'advice', label: '趋吉避凶', desc: '有什么要注意的' }
    ],

    // [Feng Shui] 风水专属提问
    feng_shui: [
      { id: 'good_bad', label: '风水吉凶', desc: '此地风水好不好' },
      { id: 'problem', label: '存在问题', desc: '有什么风水问题' },
      { id: 'improve', label: '如何改善', desc: '如何调整布局' },
      { id: 'best_position', label: '最佳位置', desc: '床/桌/门放哪里' },
      { id: 'color_element', label: '色彩五行', desc: '用什么颜色·摆件' },
      { id: 'lucky_direction', label: '吉位吉方', desc: '家中吉位在哪里' },
      { id: 'renovation_timing', label: '装修时机', desc: '什么时候装修好' }
    ],

    // [Lost & Found] 寻物寻人专属提问
    lost_found: [
      { id: 'location', label: '物品位置', desc: '在哪里·东西掉哪了' },
      { id: 'person_location', label: '人员位置', desc: '此人在何处·哪个方向' },
      { id: 'can_find', label: '能否找到', desc: '还能找到吗·有希望吗' },
      { id: 'find_timing', label: '何时找到', desc: '什么时候能找到' },
      { id: 'person_status', label: '人员状态', desc: '此人现在如何·安全否' },
      { id: 'who_took', label: '谁拿的', desc: '偷盗者身份·线索' },
      { id: 'recovery_hope', label: '恢复希望', desc: '找回的几率·概率' }
    ],

    // [Compatibility] 合婚配对专属提问
    compatibility: [
      { id: 'suitable', label: '是否相配', desc: '两人是否匹配' },
      { id: 'conflict_area', label: '冲突点', desc: '可能的矛盾·分歧' },
      { id: 'marriage_year', label: '婚期', desc: '何时结婚最好' },
      { id: 'long_term', label: '长期前景', desc: '婚后能否幸福·白头' },
      { id: 'children_fortune', label: '子女运', desc: '有无子女·子女运势' },
      { id: 'repair_chance', label: '修复机会', desc: '感情出问题能否修复' },
      { id: 'best_way', label: '最佳相处', desc: '怎样相处最和谐' }
    ],

    // [Common] 通用兜底 (当上述分类未匹配时使用)
    common: [
      { id: 'luck', label: '吉凶如何', desc: '成败/得失' },
      { id: 'timing', label: '应期何时', desc: '时间/节点' },
      { id: 'advice', label: '有何建议', desc: '行动指南' },
      { id: 'yesno', label: '可否行之', desc: '能不能做' },
      { id: 'cause', label: '所因何事', desc: '起因是什么' }
    ]
  }
} as const;

// ========== 类型定义导出 ==========
export type WordTree = typeof WORD_TREE;

// 提取 category 数组的元素类型
export type CategoryItem = (typeof WORD_TREE.category)[number];

// 动态提取 category id 的类型 (e.g., 'love' | 'cai' | 'work' ...)
export type CategoryId = CategoryItem['id'];

// 动态提取 detail 的 key 类型
export type DetailKey = keyof typeof WORD_TREE.detail;

// 动态提取 question 的 key 类型
export type QuestionKey = keyof typeof WORD_TREE.question
