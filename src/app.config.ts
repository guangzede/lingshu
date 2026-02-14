export default {
  pages: [
    'pages/index/index',
    'pages/fortune/index',
    'pages/bazi/index',
    'pages/bazi/result/index',
    'pages/bazi/history/index',
    'pages/testPage/index',
    'pages/auth/index',
    'pages/profile/index',
    'pages/vip/index'
  ],
  subpackages: [
  //   {
  //     root: 'pages/luopan',
  //     pages: ['index']
  //   },
    {
      root: 'pages/Liuyao',
      pages: ['index', 'divination/index', 'result/index']
    },
    {
      root: 'pages/LiuyaoHistory',
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
