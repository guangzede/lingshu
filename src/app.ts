import React from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.scss'

interface AppProps {
  children?: React.ReactElement
}

const authInterceptor = (chain: any) => {
  const requestParams = chain.requestParams
  const token = Taro.getStorageSync('token') || ''
  const header = {
    ...requestParams.header,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  return chain.proceed({
    ...requestParams,
    header
  })
}

Taro.addInterceptor(authInterceptor)

const App: React.FC<AppProps> = (props) => {
  useLaunch(() => {
    console.log('App launched.')
  })

  // props.children is the pages rendered by router
  return props.children as React.ReactElement
}

export default App
