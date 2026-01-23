import React from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

interface AppProps {
  children?: React.ReactElement
}

const App: React.FC<AppProps> = (props) => {
  useLaunch(() => {
    console.log('App launched.')
  })

  // props.children is the pages rendered by router
  return props.children as React.ReactElement
}

export default App
