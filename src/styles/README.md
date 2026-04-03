# 灵枢设计系统

> 统一、优雅、神秘的玄学风格设计系统

## 📁 目录结构

```
src/styles/
├── index.scss          # 样式入口
├── variables.scss      # 设计变量
├── mixins.scss         # 混合宏
├── global.scss         # 全局样式和工具类
└── components/
    ├── card.scss       # 卡片组件
    └── button.scss     # 按钮组件
```

## 🚀 快速开始

### 1. 导入样式

```scss
@use '@/styles/index.scss' as *;
```

### 2. 使用变量

```scss
.element {
  background: v.$color-bg-primary;
  color: v.$color-text-primary;
  padding: v.$spacing-lg;
}
```

### 3. 使用 Mixin

```scss
.element {
  @include m.mystical-card;
  @include m.glass-effect;
}
```

### 4. 使用工具类

```html
<view class="flex items-center gap-md">
  <text class="text-lg font-bold text-primary">内容</text>
  <button class="btn btn-primary">按钮</button>
</view>
```

## 🎨 设计令牌

### 颜色

```scss
// 背景色
v.$color-bg-primary      // #040712
v.$color-bg-secondary    // #090f1d
v.$color-bg-card         // rgba(255, 255, 255, 0.07)

// 文字色
v.$color-text-primary    // #ffffff
v.$color-text-secondary  // rgba(255, 255, 255, 0.9)

// 强调色
v.$color-accent-DEFAULT  // #f3c86b
v.$color-gold-DEFAULT    // #f5daaa
```

### 间距

```scss
v.$spacing-xs   // 8rpx
v.$spacing-sm   // 12rpx
v.$spacing-md   // 16rpx
v.$spacing-lg   // 20rpx
v.$spacing-xl   // 24rpx
```

### 圆角

```scss
v.$border-radius-sm    // 4rpx
v.$border-radius-md    // 8rpx
v.$border-radius-lg    // 12rpx
v.$border-radius-round // 999px
```

## 🧩 组件

### 卡片

```scss
.card {
  @include m.mystical-card;
}

// 或使用 HTML 类
// <view class="card card--lg">...</view>
```

### 按钮

```scss
.btn {
  @include m.mystical-button;
}

// 或使用 HTML 类
// <button class="btn btn-primary">主要按钮</button>
// <button class="btn btn-secondary">次要按钮</button>
```

## 📱 响应式

```scss
@include m.respond-to(small) {
  // < 374px
}

@include m.respond-to(medium) {
  // >= 768px
}

@include m.respond-to(large) {
  // >= 1024px
}
```

## 🔧 工具类

### 文本颜色
`.text-primary` `.text-secondary` `.text-accent` `.text-success` `.text-error`

### 背景色
`.bg-primary` `.bg-secondary` `.bg-card` `.bg-glass`

### 间距
`.mt-lg` `.mb-md` `.p-xl` `.gap-md`

### 圆角
`.rounded-md` `.rounded-lg` `.rounded-full`

### 阴影
`.shadow-md` `.shadow-lg` `.shadow-gold`

### 布局
`.flex` `.items-center` `.justify-between`

## 📋 最佳实践

### ✅ 推荐

```scss
// 使用变量
padding: v.$spacing-lg;
color: v.$color-text-primary;

// 使用 mixin
@include m.mystical-card;

// 使用工具类
class="text-primary mt-lg"
```

### ❌ 避免

```scss
// 硬编码
padding: 20px;
color: #ffffff;

// 重复代码
background: rgba(13, 19, 34, 0.84);
border: 1px solid rgba(241, 211, 154, 0.18);
```

---

**版本**: 2.0.0  
**最后更新**: 2026-04-02
