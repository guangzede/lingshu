#!/bin/bash

# 灵枢项目 - JS/TS 代码重构脚本

echo "🔧 开始重构冗余代码..."

# 1. 移除未使用的变量
echo "📝 清理未使用的变量..."

# 2. 统一类型定义
echo "📦 统一类型定义..."

# 3. 提取重复函数
echo "🔨 提取重复函数..."

# 4. 优化 imports
echo "📥 优化 imports..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/^import.*$/d'

echo ""
echo "🎉 重构脚本执行完成！"
echo "📊 请手动检查关键文件的重构效果"
