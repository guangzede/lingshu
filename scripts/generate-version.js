#!/usr/bin/env node

/**
 * 自动生成版本号脚本
 * 在打包前运行，生成版本文件
 * 版本号格式: major.minor.patch-buildTime
 * 例如: 1.0.0-20260202_143025
 */

const fs = require('fs');
const path = require('path');

// 获取当前时间戳
function getBuildTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// 读取 package.json 获取基础版本号
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const baseVersion = packageJson.version;

// 生成完整版本号
const buildTime = getBuildTime();
const fullVersion = `${baseVersion}-${buildTime}`;

// 创建版本文件
const versionFileContent = `/**
 * 自动生成的版本号文件
 * 生成时间: ${new Date().toISOString()}
 */

export const APP_VERSION = '${fullVersion}';
export const BUILD_TIME = '${buildTime}';
export const BASE_VERSION = '${baseVersion}';

export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildTime: BUILD_TIME,
  baseVersion: BASE_VERSION,
  timestamp: new Date('${new Date().toISOString()}').getTime(),
});
`;

// 确保目录存在
const versionDir = path.join(__dirname, '../src/constants');
if (!fs.existsSync(versionDir)) {
  fs.mkdirSync(versionDir, { recursive: true });
}

// 写入版本文件
const versionFilePath = path.join(versionDir, 'version.ts');
fs.writeFileSync(versionFilePath, versionFileContent, 'utf-8');

console.log(`✓ 版本号生成成功: ${fullVersion}`);
console.log(`✓ 版本文件已写入: ${versionFilePath}`);

// 输出信息到 GitHub Actions 或 CI/CD 系统
console.log(`\n应用版本信息:`);
console.log(`  完整版本: ${fullVersion}`);
console.log(`  基础版本: ${baseVersion}`);
console.log(`  构建时间: ${buildTime}`);
