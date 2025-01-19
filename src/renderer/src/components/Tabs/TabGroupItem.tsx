import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FC } from 'react'
import { Tab, TabGroup } from '@renderer/store/tabs'

interface TabGroupItemProps {
  setActiveTabGroup: (tabGroup: TabGroup) => void
  activeTabGroup: TabGroup
  tabGroup: TabGroup
  tab: Tab
}

let clickTimeout: NodeJS.Timeout | null = null


const TabGroupItem: FC<TabGroupItemProps> = ({ setActiveTabGroup, tabGroup, activeTabGroup }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tabGroup.id
  })

  const handleMouseDown = () => {
    clickTimeout = setTimeout(() => {
      clickTimeout = null
    }, 200) // Define a threshold for drag vs click
  }

  const handleMouseUp = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      clickTimeout = null
      setActiveTabGroup(tabGroup)
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
        outline: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {tabGroup.tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex justify-between items-center p-2 cursor-pointer rounded-md ${
            activeTabGroup?.id === tabGroup.id ? 'bg-white text-black' : ''
          }`}
        >
          <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
          <span className="truncate">{tab.title ?? tab.url}</span>
          <button
            className="text-red-500 ml-2"
            onClick={(e) => {
              e.stopPropagation() // Prevent tab switching when closing
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default TabGroupItem
