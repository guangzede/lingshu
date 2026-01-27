/**
 * 决策分析关键词决策树 (合规优化版)
 * 结构说明：
 * 1. category: 第一级大类 (用户意图 - 已去敏感化)
 * 2. detail: 第二级具体场景 (根据 category.id 索引)
 * 3. question: 第三级核心疑问 (根据 category.id 索引，若无匹配则使用 common)
 * * 修改策略：
 * - 将“占卜/算命”语境转化为“决策/分析/咨询”语境
 * - 删除“讨债、阴宅、血光、出轨”等高风险词汇
 * - 侧重于“趋势、环境、心理、规划”
 */
export const WORD_TREE = {
  // ==========================================
  // Level 1: 核心大类 (Category)
  // ==========================================
  category: [
    { id: 'love', label: '情感', desc: '恋爱·婚姻·人际' }, // 原：问情 (姻缘·桃花 -> 人际)
    { id: 'cai', label: '财富', desc: '经营·收益·规划' }, // 原：求财 (讨债 -> 规划)
    { id: 'work', label: '事业', desc: '职场·发展·规划' }, // 原：事业 (官司 -> 规划)
    { id: 'study', label: '学业', desc: '考试·深造·技能' },
    { id: 'family', label: '家庭', desc: '亲子·生活·家务' },
    { id: 'health', label: '身心', desc: '状态·保养·作息' }, // 原：平安 (健康 -> 身心)
    { id: 'fortune', label: '趋势', desc: '阶段·环境·规划' }, // 原：运势 (流年/去晦 -> 阶段/环境)
    { id: 'feng_shui', label: '环境', desc: '布局·空间·居住' }, // 原：风水 (阳宅/阴宅 -> 布局/空间)
    { id: 'lost_found', label: '寻觅', desc: '物品·联络·线索' }, // 原：寻物 (寻人/失踪 -> 联络/线索)
    { id: 'compatibility', label: '分析', desc: '性格·默契·匹配' }  // 原：合婚 (八字/生肖 -> 性格/默契)
  ],

  // ==========================================
  // Level 2: 具体场景 (Detail / Scenario)
  // ==========================================
  detail: {
    // --- 情感场景 ---
    love: [
      { id: 'crush', label: '心动', desc: '好感接触' },         // 原：暗恋
      { id: 'ex', label: '过往', desc: '昔日关系' },             // 原：前任
      { id: 'partner', label: '伴侣', desc: '现有关系' },         // 原：对象
      { id: 'marriage', label: '围城', desc: '婚后生活' },         // 原：婚姻
      { id: 'single', label: '邂逅', desc: '期待缘分' },           // 原：脱单
      { id: 'affair', label: '模糊', desc: '未定关系' },           // 原：暧昧
      { id: 'trouble', label: '困扰', desc: '复杂关系' },           // 原：烂桃花
      { id: 'blind_date', label: '相识', desc: '初次见面' }        // 原：相亲
    ],

    // --- 财富场景 ---
    cai: [
      { id: 'invest', label: '理财', desc: '资产配置' },           // 原：投资
      { id: 'debt', label: '账务', desc: '借出/收回' },           // 原：讨债 (高危词)
      { id: 'salary', label: '薪酬', desc: '收入/待遇' },           // 原：正财
      { id: 'side_job', label: '副业', desc: '兼职/拓展' },         // 原：偏财
      { id: 'business', label: '经营', desc: '开店/项目' },         // 原：生意
      { id: 'property', label: '置业', desc: '房产/资产' },         // 原：买卖
      { id: 'coop', label: '合作', desc: '共同经营' }
    ],

    // --- 事业场景 ---
    work: [
      { id: 'interview', label: '求职', desc: '面试/应聘' },
      { id: 'promotion', label: '晋升', desc: '职位变动' },
      { id: 'hop', label: '去留', desc: '跳槽/转行' },
      { id: 'startup', label: '创业', desc: '开拓/新路' },
      { id: 'official', label: '考公', desc: '体制/编制' },
      { id: 'lawsuit', label: '纠纷', desc: '合同/争议' },         // 原：官司 (高危词)
      { id: 'politics', label: '人际', desc: '职场关系' },         // 原：小人 (高危词)
      { id: 'project', label: '项目', desc: '任务/考核' }
    ],

    // --- 学业场景 ---
    study: [
      { id: 'exam', label: '升学', desc: '高考/考研' },
      { id: 'cert', label: '考证', desc: '资格认证' },
      { id: 'abroad', label: '留学', desc: '海外申请' },
      { id: 'school', label: '择校', desc: '志愿规划' },
      { id: 'thesis', label: '学术', desc: '论文/研究' }
    ],

    // --- 家庭场景 ---
    family: [
      { id: 'pregnancy', label: '添丁', desc: '备孕/生育' },         // 原：求子
      { id: 'marriage_quality', label: '相处', desc: '沟通质量' },
      { id: 'parent_child', label: '教育', desc: '亲子成长' },
      { id: 'housework', label: '家务', desc: '生活分工' },
      { id: 'elder_care', label: '长辈', desc: '父母关怀' },
      { id: 'sibling', label: '手足', desc: '兄弟姐妹' },
      { id: 'moving', label: '乔迁', desc: '搬家/择居' },
      { id: 'pets', label: '萌宠', desc: '宠物生活' }
    ],

    // --- 身心场景 (原：平安) ---
    health: [
      { id: 'self_illness', label: '状态', desc: '身体感受' },       // 原：身体不适
      { id: 'surgery', label: '治疗', desc: '医疗方案' },           // 原：手术
      { id: 'mental', label: '情绪', desc: '心情/压力' },           // 原：心理健康 (敏感词)
      { id: 'beauty', label: '形象', desc: '美容/护肤' },
      { id: 'weight', label: '塑形', desc: '体重管理' },
      { id: 'sleep', label: '睡眠', desc: '作息调整' },
      { id: 'fitness', label: '运动', desc: '锻炼计划' },
      { id: 'travel_safety', label: '出行', desc: '旅途状况' },
      { id: 'accident', label: '防护', desc: '安全防范' }           // 原：意外事故
    ],

    // --- 趋势场景 (原：运势) ---
    fortune: [
      { id: 'year_luck', label: '年度', desc: '全年规划' },
      { id: 'month_luck', label: '月度', desc: '当月重点' },
      { id: 'bad_luck', label: '低谷', desc: '调整状态' },           // 原：去晦
      { id: 'choice', label: '抉择', desc: '方向选择' }
    ],

    // --- 环境场景 (原：风水) ---
    feng_shui: [
      { id: 'yang_house', label: '居家', desc: '居住环境' },         // 原：阳宅
      { id: 'yin_house', label: '祖籍', desc: '祖辈安息' },         // 原：阴宅 (极高危)
      { id: 'direction', label: '方位', desc: '布局朝向' },
      { id: 'renovation', label: '装修', desc: '设计改造' },
      { id: 'entrance', label: '布局', desc: '空间规划' },           // 原：门位
      { id: 'bedroom', label: '起居', desc: '卧室环境' },
      { id: 'office', label: '办公', desc: '工作环境' },
      { id: 'shop', label: '商业', desc: '店铺选址' }
    ],

    // --- 寻觅场景 (原：寻物) ---
    lost_found: [
      { id: 'lost_item', label: '物品', desc: '遗失查找' },
      { id: 'lost_person', label: '联络', desc: '失去联系' },         // 原：寻人
      { id: 'stolen', label: '去向', desc: '物品追踪' },             // 原：失盗
      { id: 'pet_lost', label: '宠物', desc: '走失寻找' },
      { id: 'document', label: '证件', desc: '重要资料' },
      { id: 'valuables', label: '贵重', desc: '财产查找' },
      { id: 'missing_child', label: '家属', desc: '亲人联络' }        // 原：失踪儿童
    ],

    // --- 分析场景 (原：合婚) ---
    compatibility: [
      { id: 'eight_char', label: '结构', desc: '信息匹配' },          // 原：八字
      { id: 'zodiac', label: '属相', desc: '传统生肖' },
      { id: 'name_match', label: '姓名', desc: '名称分析' },
      { id: 'five_element', label: '五行', desc: '能量互补' },
      { id: 'date_auspicious', label: '择吉', desc: '吉日选择' },
      { id: 'divorce_sign', label: '危机', desc: '关系预警' },        // 原：婚变
      { id: 'third_party', label: '干扰', desc: '外部影响' }          // 原：第三者
    ]
  },

  // ==========================================
  // Level 3: 核心疑问 (Key Question) - 映射表
  // ==========================================
  question: {
    // [Love] 专属提问
    love: [
      { id: 'feeling', label: '对方态度', desc: '对方的想法与心意' },      // 原：对方心意
      { id: 'result', label: '发展走向', desc: '关系的最终结果' },        // 原：最终结果
      { id: 'reunion', label: '重启可能', desc: '是否有机会重新开始' },    // 原：能否复合
      { id: 'cheating', label: '外部因素', desc: '是否有其他人影响' },     // 原：有无他人/出轨 (高危)
      { id: 'timing', label: '出现时机', desc: '缘分何时到来' },
      { id: 'crisis', label: '化解之道', desc: '如何解决当前矛盾' },
      { id: 'sincerity', label: '诚意分析', desc: '态度是否认真' }
    ],

    // [Cai] 专属提问
    cai: [
      { id: 'profit', label: '收益预期', desc: '盈亏状况分析' },          // 原：能否获利
      { id: 'recover', label: '回款可能', desc: '资金收回概率' },          // 原：能否回本
      { id: 'timing', label: '进账时机', desc: '资金何时到位' },
      { id: 'risk', label: '风险评估', desc: '潜在隐患分析' },
      { id: 'direction', label: '有利方位', desc: '适合发展的方向' },      // 原：求财方位
      { id: 'amount', label: '量级评估', desc: '收益规模预测' }           // 原：财运多寡
    ],

    // [Work] 专属提问
    work: [
      { id: 'success', label: '成功概率', desc: '目标达成可能性' },       // 原：能否成功
      { id: 'choice', label: '决策辅助', desc: '不同选项优劣分析' },      // 原：如何选择
      { id: 'timing', label: '变动时机', desc: '职位/环境变动节点' },
      { id: 'trend', label: '发展趋势', desc: '未来前景展望' },
      { id: 'enemy', label: '阻力来源', desc: '主要障碍分析' },           // 原：谁是小人
      { id: 'offer', label: '录用机会', desc: '面试结果预测' }
    ],

    // [Study] 专属提问
    study: [
      { id: 'pass', label: '通过概率', desc: '考试结果预测' },
      { id: 'rank', label: '成绩排位', desc: '大致排名区间' },
      { id: 'school', label: '录取机会', desc: '目标院校可能性' },
      { id: 'suit', label: '适配分析', desc: '专业/方向契合度' }
    ],

    // [Family] 专属提问
    family: [
      { id: 'pregnancy_status', label: '机缘分析', desc: '时机是否成熟' },    // 原：求子吉凶
      { id: 'marriage_quality', label: '关系状态', desc: '相处模式分析' },
      { id: 'parent_child_harmony', label: '互动模式', desc: '沟通状况评估' },
      { id: 'housework_fair', label: '分工现状', desc: '公平性分析' },
      { id: 'elder_health', label: '安康指数', desc: '状态评估与建议' },
      { id: 'sibling_dispute', label: '协调建议', desc: '矛盾解决思路' },
      { id: 'moving_timing', label: '最佳时机', desc: '搬迁时间建议' },       // 原：搬家吉日
      { id: 'pet_safety', label: '现状评估', desc: '安全与健康状况' }
    ],

    // [Health] 专属提问
    health: [
      { id: 'illness_severity', label: '程度评估', desc: '当前状态分析' },    // 原：病情轻重
      { id: 'recovery_timing', label: '恢复周期', desc: '预计好转时间' },
      { id: 'treatment_suitable', label: '方案评估', desc: '当前措施是否得当' },
      { id: 'mental_status', label: '情绪指数', desc: '心理压力分析' },
      { id: 'beauty_effect', label: '预期效果', desc: '实施结果预测' },
      { id: 'weight_loss_success', label: '成效预估', desc: '计划执行效果' },
      { id: 'sleep_improve', label: '改善趋势', desc: '睡眠质量走向' },
      { id: 'fitness_progress', label: '执行效果', desc: '计划可持续性' },
      { id: 'travel_safety', label: '行程状况', desc: '旅途顺利程度' },
      { id: 'accident_severity', label: '风险警示', desc: '潜在隐患提示' }    // 原：意外吉凶
    ],

    // [Fortune] 专属提问
    fortune: [
      { id: 'overview', label: '综合指数', desc: '整体状态评分' },          // 原：整体运势
      { id: 'bad', label: '转折节点', desc: '状态回升时机' },              // 原：何时转运
      { id: 'advice', label: '行动建议', desc: '注意事项提醒' }            // 原：趋吉避凶
    ],

    // [Feng Shui] 专属提问
    feng_shui: [
      { id: 'good_bad', label: '环境评估', desc: '当前环境优劣' },         // 原：风水吉凶
      { id: 'problem', label: '存在隐患', desc: '环境布局问题' },
      { id: 'improve', label: '优化建议', desc: '布局调整思路' },
      { id: 'best_position', label: '核心吉位', desc: '关键位置选择' },     // 原：最佳位置
      { id: 'color_element', label: '元素搭配', desc: '色彩与装饰建议' },
      { id: 'lucky_direction', label: '吉方确认', desc: '有利方位分析' },
      { id: 'renovation_timing', label: '动工时机', desc: '施工时间建议' }
    ],

    // [Lost & Found] 专属提问
    lost_found: [
      { id: 'location', label: '方位线索', desc: '大致所在区域' },
      { id: 'person_location', label: '人员去向', desc: '大致方位判断' },
      { id: 'can_find', label: '寻回概率', desc: '找回的可能性' },
      { id: 'find_timing', label: '时间窗口', desc: '可能的发现时间' },
      { id: 'person_status', label: '当前状态', desc: '安全状况分析' },
      { id: 'who_took', label: '相关人员', desc: '可能接触的人' },        // 原：谁拿的
      { id: 'recovery_hope', label: '希望评估', desc: '综合概率分析' }
    ],

    // [Compatibility] 专属提问
    compatibility: [
      { id: 'suitable', label: '契合程度', desc: '匹配指数分析' },         // 原：是否相配
      { id: 'conflict_area', label: '差异分析', desc: '潜在分歧点' },      // 原：冲突点
      { id: 'marriage_year', label: '良辰建议', desc: '适合的时间段' },     // 原：婚期
      { id: 'long_term', label: '长期展望', desc: '未来稳定性预测' },
      { id: 'children_fortune', label: '家庭延续', desc: '下一代相关分析' }, // 原：子女运
      { id: 'repair_chance', label: '修复可能', desc: '关系改善机会' },
      { id: 'best_way', label: '相处之道', desc: '和谐共处建议' }
    ]
  },

  // [Common] 通用兜底
  common: [
    { id: 'luck', label: '成败分析', desc: '结果预测' },         // 原：吉凶如何
    { id: 'timing', label: '关键节点', desc: '时间分析' },         // 原：应期何时
    { id: 'advice', label: '策略建议', desc: '行动指南' },         // 原：有何建议
    { id: 'yesno', label: '可行评估', desc: '可否执行' },         // 原：可否行之
    { id: 'cause', label: '缘由分析', desc: '起因探究' }          // 原：所因何事
  ]
} as const;

// ========== 类型定义导出 ==========
export type WordTree = typeof WORD_TREE;
export type CategoryItem = (typeof WORD_TREE.category)[number];
export type CategoryId = CategoryItem['id'];
export type DetailKey = keyof typeof WORD_TREE.detail;
export type QuestionKey = keyof typeof WORD_TREE.question;
