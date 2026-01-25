# 只读模式求测事项回显修复

## 问题描述
从卜卦记录页面点击"加载"回到六爻排盘页，已加载的求测事项（question）虽然存储在 store 中，但在 QuestionCard 组件中没有显示出来。

## 根本原因
QuestionCard 组件有两个独立的状态：
- `value` prop：从 store 传入的已保存的问题字符串（格式：`"label1 · label2 · label3"`）
- `selections` 本地状态：已选择的标签数组

当加载历史时，虽然 `value` prop 被正确设置，但本地的 `selections` 状态仍然是空数组，导致 UI 中看不到已选的标签。

## 解决方案
在 QuestionCard 中添加 useEffect，当处于只读模式（readOnly=true）且有已保存的 value 时，解析这个 value 字符串并重建 selections 数组。

### 实现细节

#### 1. Value 解析流程
```
已保存的 value 字符串
  ↓
按 " · " 分割得到标签数组
  ↓
Step 0: 在 WORD_TREE.category 中查找分类
  ↓
Step 1: 在 WORD_TREE.detail[categoryId] 中查找详细场景
  ↓
Step 2: 在 WORD_TREE.question[categoryId] 中查找问题
  ↓
构建 selections 数组
  ↓
更新本地状态
```

#### 2. useEffect 实现
```typescript
React.useEffect(() => {
  if (readOnly && value && value.trim()) {
    // 1. 按 " · " 分割
    const labels = value.split(' · ').map(l => l.trim()).filter(l => l)
    
    if (labels.length > 0) {
      const newSelections: Selection[] = []
      
      // 2. 查找分类（Step 0）
      const category = WORD_TREE.category.find((c: any) => c.label === labels[0])
      if (category) {
        newSelections.push({
          step: 0,
          id: category.id,
          label: category.label,
          desc: category.desc
        })
        
        // 3. 查找详细场景（Step 1）
        if (labels[1]) {
          const details = WORD_TREE.detail[categoryId]
          const detail = Array.isArray(details) 
            ? details.find((d: any) => d.label === labels[1])
            : null
          if (detail) {
            newSelections.push({
              step: 1,
              id: detail.id,
              label: detail.label,
              desc: detail.desc
            })
            
            // 4. 查找问题（Step 2）
            if (labels[2]) {
              const questions = WORD_TREE.question[categoryId] || WORD_TREE.question.common
              const question = Array.isArray(questions)
                ? questions.find((q: any) => q.label === labels[2])
                : null
              if (question) {
                newSelections.push({
                  step: 2,
                  id: question.id,
                  label: question.label,
                  desc: question.desc
                })
              }
            }
          }
        }
      }
      
      setSelections(newSelections)
      setStep((newSelections.length - 1) as Step)
    }
  } else if (!readOnly) {
    // 编辑模式下，重置状态
    setSelections([])
    setStep(0)
    setManualInput(value)
  }
}, [readOnly, value])
```

## 完整的数据流

### 编辑模式流程
```
1. 用户进入主页面（source='home'）
2. useDidShow 触发 reset()
3. QuestionCard readOnly=false
4. 用户组装求测事项（通过点击泡泡）
5. 选择完成时 value = "问情 · 暗恋 · 对方心意"
6. store 中 question 被更新
```

### 只读模式流程（加载历史）
```
1. 用户进入历史记录页
2. 点击"加载"按钮
3. loadCase(id) 加载数据
4. store.question = "问情 · 暗恋 · 对方心意"
5. store.isLoadingHistory = true
6. navigateBack() 返回主页
7. QuestionCard 接收 readOnly={true} 和 value="问情 · 暗恋 · 对方心意"
8. useEffect 检测到 readOnly=true 且 value 不为空
9. 解析 value 字符串
10. 重建 selections 数组
11. UI 显示已选的三个标签
12. 所有交互被禁用
```

## 测试步骤

### 测试用例1: 回显求测事项
1. 在主页面创建一个卦例
   - 选择类别：问情
   - 选择详情：暗恋
   - 选择问题：对方心意
   - 输入日期、时间等信息
   - 点击"排盘"生成结果

2. 点击"保存卦例"保存

3. 点击"查看历史"进入历史记录页

4. 点击保存的卦例的"加载"按钮

5. 验证：
   - ✅ 自动返回主页面
   - ✅ 求测事项卡片显示 3 个标签
   - ✅ 标签分别为"问情"、"暗恋"、"对方心意"
   - ✅ 每个标签显示对应的描述
   - ✅ 卡片显示"📋 仅查看"提示
   - ✅ 标签无法被删除
   - ✅ 无法切换模式

### 测试用例2: 手动输入的问题回显
1. 在主页面手动输入求测事项（不通过泡泡选择）
2. 输入任意文本，保存卦例
3. 从历史加载这个卦例
4. 验证：求测事项输入框显示保存的文本（即使无法解析为标签）

### 测试用例3: 切换回编辑模式
1. 完成测试用例1
2. 点击"新建"或从首页重新进入
3. 验证：
   - ✅ selections 被清空
   - ✅ QuestionCard 恢复为编辑模式
   - ✅ 可以重新组装问题

## 代码改动

### 文件：pages/Liuyao/components/QuestionCard/index.tsx

**改动内容：**
- 在组件初始化后添加 useEffect
- 当 readOnly=true 且 value 不为空时，解析 value 并重建 selections
- 当 readOnly=false 时，清空 selections

**改动大小：** ~60 行新增代码

## 相关文件检查清单

- ✅ pages/Liuyao/components/QuestionCard/index.tsx - 已修改（添加 useEffect 解析）
- ✅ pages/Liuyao/index.tsx - 已传递 readOnly prop
- ✅ store/liuyao.ts - 已正确设置 question
- ✅ constants/questionTree.ts - 数据结构完整
- ✅ pages/LiuyaoHistory/index.tsx - 加载逻辑完整

## 效果说明

修复前：
```
从历史加载 → 返回主页 → 求测事项卡片空白 → 用户困惑
```

修复后：
```
从历史加载 → 返回主页 → 求测事项卡片显示已加载的标签 → 用户清楚了解当前加载的是什么卦例
```

## 边界情况处理

1. **Value 为空** → 不进行解析，等待用户输入
2. **Value 格式错误** → 尽可能解析，无法匹配的标签被忽略
3. **编辑模式切换** → 清空 selections 并重置为编辑状态
4. **分类不存在** → 该分类的后续标签也无法加载
5. **已删除的关键词** → 如果数据库中的关键词改变，可能无法匹配，但不会导致错误
