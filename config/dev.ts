export default {
  defineConstants: {
    __API_BASE__: '""',
    __API_PREFIX__: '"/api"'
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
