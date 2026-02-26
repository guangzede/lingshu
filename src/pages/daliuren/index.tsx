import React from 'react'
import TopNav from './components/TopNav'
import UserInput from './components/UserInput'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import { useDaliurenStore } from '@/store/daliuren'
import AuthStatusBar from '@/components/AuthStatusBar'
import './index.scss'

const DaLiuRenPage: React.FC = () => {
  const { activeTab, setActiveTab } = useDaliurenStore()
  return (
    <div className={`daliuren-page ${activeTab === 'input' ? 'daliuren-input-page' : ''}`}>
      <AuthStatusBar />
      <TopNav active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'input' && <UserInput />}
      {activeTab === 'result' && <ResultPanel />}
      {activeTab === 'history' && (
        <div className='daliuren-section'>
          <HistoryPanel />
        </div>
      )}
    </div>
  )
}

export default DaLiuRenPage
