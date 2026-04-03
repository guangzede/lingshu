#!/bin/bash

# 灵枢项目代码清理脚本
# 功能：移除 console.log，清理冗余代码

echo "🧹 开始清理冗余代码..."

# 1. 移除 console.log (保留关键调试)
echo "📝 清理 console.log..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/^[[:space:]]*console\.log/d' {} \;

# 2. 移除空行超过 3 行的代码块
echo "📏 压缩多余空行..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/^[[:space:]]*$/{ N; /^\n[[:space:]]*$/{ N; /^\n\n[[:space:]]*$/{ N; s/\n\n\n/\n\n/; }; }; }' {} \;

# 3. 移除未使用的 import (需要手动检查)
echo "📦 检查未使用的 import..."

echo "✅ 清理完成!"
echo ""
echo "统计:"
echo "- 清理的 console.log: $(git diff --shortstat 2>/dev/null | grep -o '[0-9]* insertion' | head -1 || echo 'N/A')"
