export default {
  defineConstants: {
    'process.env.TARO_APP_API_BASE': '""',
    'process.env.TARO_APP_API_PREFIX': '"/api"'
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  h5: {}
}
