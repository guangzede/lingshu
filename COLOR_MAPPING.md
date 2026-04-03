# 灵枢项目 - 颜色映射表

> 将硬编码颜色值统一为设计系统变量

## 📊 颜色使用分析

**高频颜色**:
- `#ffffff` (35 次) → `v.$color-text-primary`
- `#f7d69c` / `#f5d89e` (10 次) → `v.$color-gold-DEFAULT`
- `#FFD700` (5 次) → `v.$color-wuxing-metal`
- `#c05a5a` (7 次) → 需要定义为强调红
- `#8f6837` (6 次) → `v.$color-accent-dark`

## 🎨 颜色映射

### 金色系
```scss
#f7d69c → v.$color-gold-DEFAULT
#f5d89e → v.$color-gold-DEFAULT
#ffd990 → v.$color-gold-light
#ffe3a0 → v.$color-gold-light
#f5f0e8 → v.$color-bg-tertiary (浅色模式)
#b18b4f → v.$color-accent-dark
```

### 中性色
```scss
#ffffff → v.$color-text-primary
#f5f2e9 → v.$color-text-secondary
#2f2923 → v.$color-text-primary (浅色背景)
#1b1714 → v.$color-bg-primary
#0f0d0b → v.$color-bg-secondary
#050510 → v.$color-bg-primary
```

### 强调色
```scss
#c05a5a → 需要定义 (暗红色)
#6f6358 → 需要定义 (暗棕色)
```

## 📋 迁移优先级

### P0 - 高频率 (立即迁移)
- [ ] `#ffffff` (35 次)
- [ ] `#c05a5a` (7 次)
- [ ] `#8f6837` (6 次)
- [ ] `#f7d69c` / `#f5d89e` (10 次)

### P1 - 中频率 (本次迭代)
- [ ] `#FFD700` (5 次)
- [ ] `#6f6358` (5 次)
- [ ] `#e8dfd2` (4 次)
- [ ] `#2f2923` (4 次)

### P2 - 低频率 (后续迭代)
- [ ] 其他 (< 4 次)
