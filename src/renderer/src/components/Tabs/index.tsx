import React from 'react'
import useTabStore, { useTabGroupStore } from '@renderer/store/tabs'
import { Plus } from 'lucide-react'
import { useLayoutStore } from '@renderer/store/layout'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { DrawerTrigger } from '../ui/drawer'

const Tabs: React.FC = () => {
  // Subscribe to specific parts of Zustand state like Redux
  // const tabs = useTabStore((state) => state.tabs)
  // const activeTab = useTabStore((state) => state.activeTab)
  // const { addTab, setActiveTab } = useTabStore()
  const { tree, setDefaulTree, switchTree, splitVertically, isTabVisible, splitHorizontally } =
    useLayoutStore()

  const {
    activeTabGroup: activeTabGroupId,
    addTabGroup,
    tabGroups,
    setActiveTabGroup,
    getTabGroupById,
    layout
  } = useTabGroupStore()

  const activeTabGroup = getTabGroupById(activeTabGroupId!)

  // const closeTab = useTabStore((state) => state.closeTab)

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={addTabGroup}
        className="py-2 px-2 rounded-md flex justify-start items-center"
      >
        <Plus className="h-5" />
        <p className="px-2">New Tab</p>
      </button>
      {tabGroups.map((tabGroup) =>
        tabGroup.tabs.map((tab) => (
          <ContextMenu key={`tab-${tabGroup.id}`}>
            <ContextMenuTrigger>
              <div
                className={`flex justify-between items-center p-2 cursor-pointer rounded-md ${
                  activeTabGroup?.id === tabGroup.id ? 'bg-white text-black' : ''
                }`}
                onClick={() => {
                  setActiveTabGroup(tabGroup)
                  // setActiveTab(tab.id);
                  // switchTree(tabGroup.id);
                }}
              >
                <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
                <span className="truncate">{tab.title ?? tab.url}</span>
                <button
                  className="text-red-500 ml-2"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent tab switching when closing
                    // closeTab(tab.id);
                  }}
                >
                  ×
                </button>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-white/95 ring isolate ring-black/5">
              <ContextMenuItem className="hover:bg-gray-200" inset onClick={layout.split.vertical}>
                Split Vertically
                <ContextMenuShortcut></ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                className="hover:bg-gray-200"
                inset
                onClick={layout.split.horizontal}
              >
                Split Horizontally
                <ContextMenuShortcut></ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset className="hover:bg-gray-200">
                <DrawerTrigger>Show full URL</DrawerTrigger>
                <ContextMenuShortcut></ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem className="hover:bg-gray-200" inset>
                {tab.id}
                <ContextMenuShortcut></ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))
      )}
    </div>
  )
}

export default Tabs
