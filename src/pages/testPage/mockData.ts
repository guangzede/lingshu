// Mock数据文件，为所有组件提供测试数据

// AIAnalysisCard mock数据
export const aiAnalysisCardMockData = {
  question: '测试求测事项',
  result: {
    lunar: {
      date: '2026-01-27',
      month: '腊月',
      day: '十七',
      jieQi: '大寒'
    },
    timeValue: '12:00',
    timeGanZhi: {
      year: { stem: '丙', branch: '午' },
      month: { stem: '辛', branch: '丑' },
      day: { stem: '庚', branch: '午' },
      hour: { stem: '壬', branch: '午' }
    },
    shenShas: [
      { name: '青龙', branch: '午' },
      { name: '朱雀', branch: '巳' }
    ],
    hex: {
      name: '地天泰',
      palace: '坤宫',
      palaceCategory: '土',
      shiIndex: 2,
      yingIndex: 5
    },
    variant: {
      name: '水天需'
    },
    yaos: [
      {
        isMoving: false,
        sixGod: '青龙',
        relation: '妻财',
        branch: '午火',
        stem: '丙',
        fiveElement: '火',
        seasonStrength: '旺',
        changsheng: '长生'
      },
      {
        isMoving: true,
        sixGod: '朱雀',
        relation: '官星',
        branch: '巳火',
        stem: '丁',
        fiveElement: '火',
        seasonStrength: '相',
        changsheng: '沐浴',
        fuShen: {
          relation: '父母',
          branch: '辰土',
          stem: '戊'
        }
      },
      {
        isMoving: false,
        sixGod: '勾陈',
        relation: '父母',
        branch: '辰土',
        stem: '戊',
        fiveElement: '土',
        seasonStrength: '休',
        changsheng: '冠带'
      },
      {
        isMoving: false,
        sixGod: '螣蛇',
        relation: '兄弟',
        branch: '寅木',
        stem: '甲',
        fiveElement: '木',
        seasonStrength: '死',
        changsheng: '帝旺'
      },
      {
        isMoving: false,
        sixGod: '白虎',
        relation: '父母',
        branch: '子水',
        stem: '壬',
        fiveElement: '水',
        seasonStrength: '囚',
        changsheng: '胎'
      },
      {
        isMoving: false,
        sixGod: '玄武',
        relation: '官星',
        branch: '戌土',
        stem: '戊',
        fiveElement: '土',
        seasonStrength: '休',
        changsheng: '衰'
      }
    ]
  },
  isFromHistory: false
};

// BottomButtons mock数据
export const bottomButtonsMockData = {
  isLoadingHistory: false,
  hasResult: true,
  question: '测试求测事项'
};

// BranchRelation mock数据
export const branchRelationMockData = {
  result: {
    rule: {},
    date: new Date(),
    lunar: {
      year: '2026',
      month: '腊月',
      day: '十七',
      jieQi: '大寒'
    },
    timeGanZhi: {
      year: { stem: '丙', branch: '午' },
      month: { stem: '辛', branch: '丑' },
      day: { stem: '庚', branch: '午' },
      hour: { stem: '壬', branch: '午' }
    },
    shenSha: [],
    xunKong: [],
    hex: {},
    variant: {},
    palace: '坤宫',
    youHun: false,
    guiHun: false,
    yaos: [
      { branch: '午火' },
      { branch: '巳火' },
      { branch: '辰土' },
      { branch: '寅木' },
      { branch: '子水' },
      { branch: '戌土' }
    ],
    variantYaos: []
  }
};

// CountInput mock数据
export const countInputMockData = {
  value: '123456',
  onChange: (value: string) => console.log(value),
  onSubmit: () => console.log('submit'),
  countNumbers: '',
  onCountNumbersChange: (value: string) => console.log(value),
  isVisible: true
};

// HumanQACard mock数据
export const humanQACardMockData = {
  isFromHistory: false,
  question: '测试求测事项'
};

// InfoGrid mock数据
export const infoGridMockData = {
  title: '测试信息',
  data: [
    { label: '测试1', value: '值1' },
    { label: '测试2', value: '值2' },
    { label: '测试3', value: '值3' }
  ],
  result: {
    rule: {},
    date: new Date(),
    lunar: {
      year: '2026',
      month: '腊月',
      day: '十七',
      jieQi: '大寒'
    },
    timeGanZhi: {
      year: { stem: '丙', branch: '午' },
      month: { stem: '辛', branch: '丑' },
      day: { stem: '庚', branch: '午' },
      hour: { stem: '壬', branch: '午' }
    },
    shenSha: [],
    xunKong: [],
    hex: {},
    variant: {},
    palace: '坤宫',
    youHun: false,
    guiHun: false,
    yaos: [],
    variantYaos: []
  },
  dateValue: '2026-01-27',
  timeValue: '12:00'
};

// ModeSelector mock数据
export const modeSelectorMockData = {
  mode: 'manual' as const,
  onModeChange: (mode: any) => console.log(mode),
  isLoadingHistory: false
};

// QuestionCard mock数据
export const questionCardMockData = {
  value: '测试求测事项',
  onChange: (value: string) => console.log(value),
  readOnly: false
};

// ShakeCoins mock数据
export const shakeCoinsMockData = {
  isVisible: true,
  onShakeComplete: (result: any) => console.log(result),
  currentStep: 1,
  totalSteps: 6,
  step: 1,
  onDone: (result: any) => console.log(result)
};

// TimeInput mock数据
export const timeInputMockData = {
  dateValue: '2026-01-27',
  timeValue: '12:00',
  onDateChange: (value: string) => console.log(value),
  onTimeChange: (value: string) => console.log(value),
  readOnly: false,
  todayStr: '2026-01-27',
  isVisible: true
};

// YaoAnalysis mock数据
export const yaoAnalysisMockData = {
  result: {
    rule: {},
    date: new Date(),
    lunar: {
      year: '2026',
      month: '腊月',
      day: '十七',
      jieQi: '大寒'
    },
    timeGanZhi: {
      year: { stem: '丙', branch: '午' },
      month: { stem: '辛', branch: '丑' },
      day: { stem: '庚', branch: '午' },
      hour: { stem: '壬', branch: '午' }
    },
    shenSha: [],
    xunKong: [],
    hex: {},
    variant: {},
    palace: '坤宫',
    youHun: false,
    guiHun: false,
    yaos: [
      {
        isYang: true,
        isMoving: false,
        sixGod: '青龙',
        relation: '妻财',
        branch: '午火',
        stem: '丙',
        fiveElement: '火',
        seasonStrength: '旺',
        changsheng: '长生'
      },
      {
        isYang: true,
        isMoving: true,
        sixGod: '朱雀',
        relation: '官星',
        branch: '巳火',
        stem: '丁',
        fiveElement: '火',
        seasonStrength: '相',
        changsheng: '沐浴'
      },
      {
        isYang: false,
        isMoving: false,
        sixGod: '勾陈',
        relation: '父母',
        branch: '辰土',
        stem: '戊',
        fiveElement: '土',
        seasonStrength: '休',
        changsheng: '冠带'
      },
      {
        isYang: true,
        isMoving: false,
        sixGod: '螣蛇',
        relation: '兄弟',
        branch: '寅木',
        stem: '甲',
        fiveElement: '木',
        seasonStrength: '死',
        changsheng: '帝旺'
      },
      {
        isYang: true,
        isMoving: false,
        sixGod: '白虎',
        relation: '父母',
        branch: '子水',
        stem: '壬',
        fiveElement: '水',
        seasonStrength: '囚',
        changsheng: '胎'
      },
      {
        isYang: false,
        isMoving: false,
        sixGod: '玄武',
        relation: '官星',
        branch: '戌土',
        stem: '戊',
        fiveElement: '土',
        seasonStrength: '休',
        changsheng: '衰'
      }
    ],
    variantYaos: []
  }
};

// YaoMatrix mock数据
export const yaoMatrixMockData = {
  lines: [
    { isYang: false, isMoving: false },
    { isYang: false, isMoving: false },
    { isYang: false, isMoving: false },
    { isYang: true, isMoving: false },
    { isYang: true, isMoving: false },
    { isYang: true, isMoving: false }
  ],
  onLineStateChange: (index: number, state: any) => console.log(index, state),
  isVisible: true
};

// 导出所有mock数据
export const mockData = {
  aiAnalysisCard: aiAnalysisCardMockData,
  bottomButtons: bottomButtonsMockData,
  branchRelation: branchRelationMockData,
  countInput: countInputMockData,
  humanQACard: humanQACardMockData,
  infoGrid: infoGridMockData,
  modeSelector: modeSelectorMockData,
  questionCard: questionCardMockData,
  shakeCoins: shakeCoinsMockData,
  timeInput: timeInputMockData,
  yaoAnalysis: yaoAnalysisMockData,
  yaoMatrix: yaoMatrixMockData
};

// 组件映射表，用于根据url参数映射到对应组件
export const componentMap = {
  1: 'AIAnalysisCard',
  2: 'BottomButtons',
  3: 'BranchRelation',
  4: 'CountInput',
  5: 'HumanQACard',
  6: 'InfoGrid',
  7: 'ModeSelector',
  8: 'QuestionCard',
  9: 'ShakeCoins',
  10: 'TimeInput',
  11: 'YaoAnalysis',
  12: 'YaoMatrix'
};
