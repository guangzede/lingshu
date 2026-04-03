# 灵枢项目 - JS/TS 代码重构计划

**日期**: 2026-04-02  
**目标**: 减少代码冗余，提高可维护性

---

## 📊 代码分析

### 文件大小 Top 10
1. `ShakeCoins.tsx` - 754 行 ⚠️
2. `UserInput/index.tsx` - 671 行 ⚠️
3. `index/new.tsx` - 656 行 ⚠️
4. `stock/index.tsx` - 565 行
5. `HePan/index.tsx` - 461 行

### 代码质量问题
- `any` 类型使用：199 处 ⚠️
- Hooks 使用：187 次
- 待优化文件：~10 个

---

## 🎯 重构优先级

### P0 - 高优先级 (>500 行)
1. **ShakeCoins.tsx** (754 行)
   - 问题：组件过大，逻辑复杂
   - 方案：拆分为多个子组件

2. **UserInput/index.tsx** (671 行)
   - 问题：表单逻辑重复
   - 方案：提取自定义 Hook

3. **index/new.tsx** (656 行)
   - 问题：页面逻辑混杂
   - 方案：分离业务逻辑

### P1 - 中优先级 (300-500 行)
4. **stock/index.tsx** (565 行)
5. **HePan/index.tsx** (461 行)
6. **CyberLuopan.tsx** (297 行)

---

## 🛠️ 重构策略

### 1. 组件拆分
```tsx
// ❌ 之前：一个大组件
function ShakeCoins() {
  // 754 行代码
}

// ✅ 之后：拆分为多个组件
function ShakeCoins() {
  return <ShakeCoinsLayout>...</ShakeCoinsLayout>
}
```

### 2. 自定义 Hooks
```tsx
// ❌ 之前：重复逻辑
useEffect(() => { ... })
useEffect(() => { ... })

// ✅ 之后：提取 Hook
const { data, loading } = useFetchData()
```

### 3. 类型安全
```tsx
// ❌ 之前
function foo(data: any) { ... }

// ✅ 之后
interface Data { ... }
function foo(data: Data) { ... }
```

---

## 📋 执行计划

### 第一阶段 (30 分钟)
- [ ] 重构 ShakeCoins.tsx
- [ ] 提取自定义 Hooks
- [ ] 减少 any 类型使用

### 第二阶段 (30 分钟)
- [ ] 重构 UserInput
- [ ] 优化表单逻辑
- [ ] 统一错误处理

### 第三阶段 (30 分钟)
- [ ] 重构 index/new.tsx
- [ ] 分离业务逻辑
- [ ] 优化状态管理

---

**准备开始重构...** 🚀
