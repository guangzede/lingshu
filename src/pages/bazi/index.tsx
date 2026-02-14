import React from 'react'
import UserInput from './components/UserInput'
import TopNav from './components/TopNav'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import { useBaziStore } from '@/store/bazi'
import './index.scss'

const BaZiPage: React.FC = () => {
  const { activeTab, setActiveTab } = useBaziStore()
  const isInput = activeTab === 'input'
  const isResult = activeTab === 'result'
  const isHistory = activeTab === 'history'
  return (
    <div
      className={`bazi-page ${isInput || isHistory ? 'bazi-input-page' : ''} ${isResult ? 'bazi-result-page' : ''} ${isHistory ? 'bazi-history-page' : ''}`}
    >
      <TopNav active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'input' && <UserInput />}
      {activeTab === 'result' && <ResultPanel />}
      {activeTab === 'history' && (
        <div className="bazi-section">
          <HistoryPanel />
        </div>
      )}
    </div>
  )
}

export default BaZiPage
