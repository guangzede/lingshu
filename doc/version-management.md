# 版本号管理指南

## 概述

项目集成了自动版本号生成系统，每次构建都会自动生成唯一的版本号，格式为：`major.minor.patch-yyyymmdd_hhmmss`

例如：`1.0.0-20260202_143025`

## 版本号构成

- **主版本号 (major)**: 重大功能更新或不兼容变更
- **次版本号 (minor)**: 新增功能或改进
- **补丁版本号 (patch)**: 修复 bug 或小改进
- **构建时间戳**: 自动生成，格式为 `yyyymmdd_hhmmss`

## 如何使用

### 1. 手动生成版本号

```bash
npm run gen:version
```

这会在 `src/constants/version.ts` 生成版本信息文件。

### 2. 自动集成到构建流程

所有构建命令已自动集成版本号生成：

```bash
npm run build:weapp    # 微信小程序
npm run build:h5       # H5 版本
npm run build:alipay   # 支付宝小程序
npm run build:tt       # 抖音小程序
# 等其他平台...
```

### 3. 在代码中使用版本信息

#### 方式一：导入版本常量

```typescript
import { APP_VERSION, BUILD_TIME, BASE_VERSION } from '@/constants/version'

console.log(`当前版本: ${APP_VERSION}`)
console.log(`构建时间: ${BUILD_TIME}`)
```

#### 方式二：使用 VersionDisplay 组件

```tsx
import VersionDisplay from '@/components/VersionDisplay'

// 在页面中
<VersionDisplay showBuildTime={true} />
```

### 4. 查看版本历史

版本文件会自动更新，可以通过 Git 查看版本历史：

```bash
git log --oneline -- src/constants/version.ts
```

## CI/CD 集成

### GitHub Actions

项目已配置 GitHub Actions 工作流（`.github/workflows/build.yml`）：

- ✅ 自动在 push 和 PR 时触发
- ✅ 自动生成版本号
- ✅ 构建多个平台版本
- ✅ 在 PR 中评论版本信息
- ✅ 保存构建产物

### 其他 CI/CD 系统

对于 GitLab CI、Jenkins 等系统，在构建脚本中添加：

```bash
npm run gen:version
npm run build:weapp  # 或其他构建命令
```

## 版本文件位置

```
src/constants/version.ts  (自动生成)
```

文件内容示例：

```typescript
export const APP_VERSION = '1.0.0-20260202_143025'
export const BUILD_TIME = '20260202_143025'
export const BASE_VERSION = '1.0.0'

export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildTime: BUILD_TIME,
  baseVersion: BASE_VERSION,
  timestamp: 1738487425000,
})
```

## 更新主版本号

需要更新版本号时，修改 `package.json` 中的 `version` 字段：

```json
{
  "version": "1.1.0"
}
```

下次构建时会自动使用新的基础版本号。

## 最佳实践

1. **页面更新检查**: 在应用启动时获取版本号，与服务器比对检查更新
2. **构建产物标识**: 所有构建产物都带有唯一的版本号，便于追踪
3. **灾难恢复**: 如果需要回滚，可以精确定位到某个构建时间的版本

## 故障排查

### 版本文件未生成

检查 `scripts/generate-version.js` 是否存在且有执行权限：

```bash
ls -la scripts/generate-version.js
chmod +x scripts/generate-version.js
```

### 导入 version.ts 出错

确保路径别名配置正确，检查 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 相关文件

- 脚本: `scripts/generate-version.js`
- 组件: `src/components/VersionDisplay/`
- CI/CD: `.github/workflows/build.yml`
- 配置: `package.json`
