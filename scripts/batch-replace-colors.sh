#!/bin/bash

# 灵枢项目 - 颜色批量替换脚本

echo "🎨 开始批量替换颜色值..."

# 替换白色系
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#ffffff/var(--color-text-primary)/g' {} \;
echo "✅ 替换 #ffffff → var(--color-text-primary)"

# 替换金色系
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#f7d69c/var(--color-gold-default)/g' {} \;
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#f5d89e/var(--color-gold-default)/g' {} \;
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#ffd990/var(--color-gold-light)/g' {} \;
echo "✅ 替换金色系颜色"

# 替换深色背景
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#1b1714/var(--color-bg-primary)/g' {} \;
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#0f0d0b/var(--color-bg-secondary)/g' {} \;
echo "✅ 替换深色背景"

# 替换中性色
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#f5f2e9/var(--color-text-secondary)/g' {} \;
find src/pages src/components -name "*.scss" -exec sed -i '' 's/#2f2923/var(--color-text-primary)/g' {} \;
echo "✅ 替换中性色"

echo ""
echo "🎉 颜色批量替换完成！"
echo "📊 请检查 git diff 验证替换效果"
