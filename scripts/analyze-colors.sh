#!/bin/bash

# 灵枢项目 - 颜色值分析和迁移脚本

echo "🎨 开始分析颜色使用情况..."

# 提取所有硬编码的 hex 颜色值
echo "📊 提取颜色值..."
grep -roh "#[0-9a-fA-F]\{3,6\}" src/pages --include="*.scss" | sort | uniq -c | sort -rn > /tmp/colors.txt

echo ""
echo "📈 颜色使用频率 Top 20:"
head -20 /tmp/colors.txt

echo ""
echo "✅ 分析完成！结果保存在 /tmp/colors.txt"
