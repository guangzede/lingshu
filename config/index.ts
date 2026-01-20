export default {
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
      enable: false
    }
  },
  cache: {
    enable: true
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
