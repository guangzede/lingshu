export default {
  defineConstants: {
    __API_BASE__: '""',
    __API_PREFIX__: '"/api"'
  },
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '/api'
          }
        }
      }
    }
  }
}
