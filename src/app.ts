import React from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

const App: React.FC = (props) => {
  useLaunch(() => {
    console.log('App launched.')
  })

  // props.children is the pages rendered by router
  return props.children as React.ReactElement
}

export default App
