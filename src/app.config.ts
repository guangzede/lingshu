export default {
  pages: [
    'pages/index/index',
    'pages/experience/index',
    'pages/fortune/index',
    'pages/armillary/index'
  ],
  subpackages: [
    {
      root: 'pages/luopan',
      pages: ['index']
    },
    {
      root: 'pages/Liuyao',
      pages: ['index']
    }
  ],
  window: {
    navigationBarTitleText: '灵枢',
    navigationBarBackgroundColor: '#050510',
    navigationBarTextStyle: 'white',
    backgroundTextStyle: 'light',
    backgroundColor: '#050510'
  },
  permission: {},
  requiredBackgroundModes: []
}
