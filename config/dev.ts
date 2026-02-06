export default {
  defineConstants: {},
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true
        },
        '/auth': {
          target: 'http://localhost:8787',
          changeOrigin: true
        }
      }
    }
  }
}
