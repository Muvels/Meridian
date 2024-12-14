import React from 'react'
import useTabStore from '@/store'
import { Plus } from 'lucide-react'

const Tabs: React.FC = () => {
  // Subscribe to specific parts of Zustand state like Redux
  const tabs = useTabStore((state) => state.tabs)
  const activeTab = useTabStore((state) => state.activeTab)
  const { addTab, setActiveTab } = useTabStore()
  const closeTab = useTabStore((state) => state.closeTab)

  return (
    <div className="flex flex-col gap-2">
      <button onClick={addTab} className="py-2 px-2 rounded-md flex justify-start items-center">
        <Plus className="h-5" />
        <p className="px-2">New Tab</p>
      </button>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex justify-between items-center p-2 cursor-pointer rounded-md ${
            activeTab === tab.id ? 'bg-white text-black' : ''
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
          <span className="truncate">{tab.title ?? tab.url}</span>
          <button
            className="text-red-500 ml-2"
            onClick={(e) => {
              e.stopPropagation() // Prevent tab switching when closing
              closeTab(tab.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Tabs
