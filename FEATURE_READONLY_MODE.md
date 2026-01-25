# 卜卦记录加载逻辑完整实现

## 功能描述
当用户从"卜卦记录"页面点击"加载"按钮后，系统加载之前保存的卦例，在主页面以只读模式展示求测事项，用户无法修改已加载的数据。

## 逻辑流程

### 1. 用户交互链路

```
卜卦记录页面 (LiuyaoHistory)
  ↓
用户点击"加载"按钮
  ↓
调用 loadCase(id) 
  ↓
store 加载数据并设置 isLoadingHistory = true
  ↓
自动返回主页面 (navigateBack)
  ↓
主页面展示已加载的卦例（只读模式）
```

### 2. 核心实现

#### A. 数据加载 (store/liuyao.ts)
```typescript
loadCase: (id) => {
  const caseData = getCaseFromStorage(id)
  // ... 数据验证 ...
  set({
    dateValue: caseData.dateValue,
    timeValue: caseData.timeValue,
    lines: caseData.lines,
    ruleSetKey: caseData.ruleSetKey,
    date,
    isLoadingHistory: true,  // ← 关键标志
    question: caseData.question || '',
    result: computed
  })
  return true
}
```

#### B. 状态管理 (pages/Liuyao/index.tsx)
```typescript
const {
  isLoadingHistory,
  setIsLoadingHistory,
  question,
  // ... 其他状态
} = useLiuyaoStore((s) => s)

// useDidShow 钩子中：
useDidShow(() => {
  const source = getCurrentInstance()?.router?.params?.source
  if (source === 'home') {
    if (!hasShownRef.current || !isLoadingHistory) {
      reset()  // 仅在非加载历史时重置
    }
  }
})

// QuestionCard 传参
<QuestionCard 
  value={question} 
  onChange={setQuestion} 
  readOnly={isLoadingHistory}  // ← 传递只读标志
/>
```

#### C. 只读模式 (pages/Liuyao/components/QuestionCard/index.tsx)
```typescript
interface QuestionCardProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean  // ← 新增属性
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  value, 
  onChange, 
  readOnly = false  // ← 默认可编辑
}) => {
  // ... 状态初始化 ...

  // 在所有事件处理器中添加只读检查
  const handleKeywordClick = (keyword: any) => {
    if (readOnly || !keyword?.id || !keyword?.label) return  // ← 只读时禁用
    // ... 处理逻辑 ...
  }

  const handleTagClick = (indexToRemove: number) => {
    if (readOnly) return  // ← 只读时禁用
    // ... 处理逻辑 ...
  }

  const handleManualInput = (text: string) => {
    if (readOnly) return  // ← 只读时禁用
    // ... 处理逻辑 ...
  }

  // showCloud 根据 readOnly 计算
  const showCloud = !isCompleted && !manualMode && !readOnly
  
  return (
    <div className="question-card-container">
      <div className="glass-card question-card energy-core">
        <div className="card-header">
          <Text className="card-section-title">求测事项</Text>
          <Text className="card-section-guide">
            {readOnly 
              ? '📋 仅查看 - 已加载的卦例不可修改'  // ← 只读提示
              : /* ... 其他提示 ... */}
          </Text>
        </div>

        {/* Manual Input Mode */}
        {manualMode ? (
          <View className="manual-input-wrapper">
            <Input
              className="question-input manual"
              value={manualInput}
              placeholder="请输入占卜内容..."
              disabled={readOnly}  // ← 禁用输入
              style={{ height: '52px', lineHeight: '26px' }}
              onInput={(e) => handleManualInput(e.detail.value)}
            />
            <motion.button
              onClick={() => !readOnly && setManualMode(false)}  // ← 只读时禁用点击
              style={{ 
                opacity: readOnly ? 0.5 : 1, 
                cursor: readOnly ? 'not-allowed' : 'pointer' 
              }}
            >
              返回选择
            </motion.button>
          </View>
        ) : (
          <>
            {/* Selected Tags */}
            <div className="tags-container">
              {selections.map((selection, idx) => (
                <motion.button
                  key={`tag-${selection.step}-${selection.id}`}
                  onClick={() => handleTagClick(idx)}
                  style={{ 
                    opacity: readOnly ? 0.7 : 1, 
                    cursor: readOnly ? 'default' : 'pointer' 
                  }}
                >
                  {/* ... 标签内容 ... */}
                  {!readOnly && <span className="tag-close">✕</span>}  {/* ← 只读时隐藏关闭按钮 */}
                </motion.button>
              ))}
            </div>

            {/* Manual Input Button */}
            {!isCompleted && !readOnly && (  {/* ← 只读时隐藏按钮 */}
              <motion.button
                onClick={() => setManualMode(true)}
                className="manual-trigger-button"
              >
                手动输入
              </motion.button>
            )}
          </>
        )}

        {/* Stardust Cloud - 只读时不显示 */}
        {showCloud && (  {/* showCloud = !isCompleted && !manualMode && !readOnly */}
          <motion.div className="stardust-cloud">
            {/* ... 关键词选择界面 ... */}
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

### 3. 交互禁用总结

| 操作 | 编辑模式 | 只读模式 |
|------|--------|--------|
| 点击关键词泡泡 | ✅ 可选 | ❌ 禁用 |
| 点击已选标签 | ✅ 可删除 | ❌ 仅展示 |
| 手动输入文本 | ✅ 可输 | ❌ 禁用 |
| 切换手动输入模式 | ✅ 可切 | ❌ 禁用 |
| 显示关键词云 | ✅ 显示 | ❌ 隐藏 |
| 手动输入按钮 | ✅ 显示 | ❌ 隐藏 |
| 标签关闭按钮 | ✅ 显示 | ❌ 隐藏 |

### 4. 状态转移图

```
初始状态
  ↓
用户进入主页面 (source=home)
  ↓
isLoadingHistory = false
  ↓
useDidShow: reset() 清空所有数据
  ↓
用户输入数据 (编辑模式)
  ↓
  ├─ 用户切换到历史记录页
  │   ↓
  │   用户点击"加载"
  │   ↓
  │   loadCase(id)
  │   ↓
  │   isLoadingHistory = true
  │   question 加载已保存的值
  │   result 加载已计算的结果
  │   ↓
  │   navigateBack() 返回主页
  │   ↓
  │   useDidShow: source != 'home' 或 isLoadingHistory = true
  │   ↓
  │   不执行 reset()
  │   ↓
  │   QuestionCard readOnly = true
  │   ↓
  │   用户仅查看，无法修改
  │
  └─ 用户继续编辑 (新卦例)
      ↓
      isLoadingHistory 保持 false
      ↓
      QuestionCard readOnly = false
      ↓
      用户可正常编辑
```

### 5. 返回原始状态

当用户想要重新开始（新卦例）时，有以下方式：

1. **点击"新建"按钮** (如果存在)
   - 调用 reset()
   - 设置 isLoadingHistory = false

2. **从首页重新进入**
   - source = 'home'
   - useDidShow 检测到 source='home'
   - 执行 reset()
   - isLoadingHistory = false
   - QuestionCard 恢复编辑模式

3. **手动调用重置**
   - 任何地方调用 setIsLoadingHistory(false)
   - QuestionCard 立即切换到编辑模式

## 测试步骤

### 场景1: 正常加载历史卦例
1. 进入主页，创建并保存卦例
2. 进入卜卦记录页
3. 点击某个卦例的"加载"按钮
4. 验证：
   - 返回主页
   - 求测事项显示已保存的值
   - 求测事项卡片显示"📋 仅查看 - 已加载的卦例不可修改"
   - 无法点击泡泡修改
   - 无法点击标签删除
   - 无法切换手动输入

### 场景2: 从只读恢复编辑
1. 完成场景1
2. 点击"新建"或从首页重新进入
3. 验证：
   - isLoadingHistory = false
   - 求测事项卡片可以正常编辑

### 场景3: 关键词数据完整性
1. 验证 question 值包含所有已选关键词
2. 验证 result 对象包含完整的计算结果
3. 验证日期、时间、爻位数据一致

## 代码改动清单

- ✅ pages/Liuyao/components/QuestionCard/index.tsx
  - 添加 readOnly? 属性
  - 在所有事件处理器中添加只读检查
  - 调整 showCloud 计算逻辑
  - 条件渲染按钮和输入框
  - 更新 guide 文本

- ✅ pages/Liuyao/index.tsx
  - 传递 readOnly={isLoadingHistory} 到 QuestionCard

- ✅ pages/LiuyaoHistory/index.tsx
  - 已有完整的加载和删除逻辑（无需修改）

- ✅ store/liuyao.ts
  - 已有完整的 loadCase 实现（无需修改）

- ✅ constants/questionTree.ts
  - 补充 lost_found detail 定义（修复类型错误）

## 完整特性列表

✅ 从历史记录加载卦例
✅ 自动返回主页面
✅ 展示已加载的求测事项
✅ 禁用求测事项编辑
✅ 提示用户处于只读模式
✅ 完整的状态管理
✅ 无冲突的模式切换
✅ TypeScript 类型安全
