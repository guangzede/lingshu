import path from 'path'
import { defineConfig } from '@tarojs/cli'
import devConfig from './dev'
import remoteConfig from './remote'
import prodConfig from './prod'

const config = {
  projectName: 'lingshu-app',
  date: '2026-01-20',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
      // 在预编译中排除three相关库，避免被主包打包
      exclude: ['@react-three/fiber', '@react-three/drei', 'three']
    }
  },
  cache: {
    enable: false
  },
  // 路径别名，支持 @ 指向 src 目录
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  mini: {},
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['nutui'],
    module: {
      postcss: {
        autoprefixer: {
          enable: true
        }
      }
    }
  }
}

export default defineConfig((merge) => {
  // 在开发环境中允许通过 API_MODE 切换远程或本地；生产环境固定走 prod
  const isProd = process.env.NODE_ENV === 'production'
  const apiConfig = process.env.API_MODE === 'remote' ? remoteConfig : devConfig
  const envConfig = isProd ? prodConfig : apiConfig

  return merge({}, config, envConfig)
})
