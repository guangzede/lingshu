export default {
  defineConstants: {},
  h5: {
    devServer: {
      historyApiFallback: {
        rewrites: [
          {
            from: /^\/api\/.*$/,
            to: (context: any) => context?.parsedUrl?.pathname || '/api'
          }
        ]
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true
        }
      }
    }
  }
}
