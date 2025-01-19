import React from 'react'
import useTabStore, { TabGroup, useTabGroupStore } from '@renderer/store/tabs'
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
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { DrawerTrigger } from '../ui/drawer'
import TabGroupItem from './TabGroupItem'

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
    layout,
    updateTabGroupOrder
  } = useTabGroupStore()

  const activeTabGroup = getTabGroupById(activeTabGroupId!)

  // const closeTab = useTabStore((state) => state.closeTab)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log('Active ID:', active.id)
    console.log('Over ID:', over?.id)

    if (!over || active.id === over.id) return

    const oldIndex = tabGroups.findIndex((group) => group.id === active.id)
    const newIndex = tabGroups.findIndex((group) => group.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTabGroups = arrayMove(tabGroups, oldIndex, newIndex)
      console.log('New Order:', newTabGroups)
      updateTabGroupOrder(newTabGroups)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-2">
        <button
          onClick={addTabGroup}
          className="py-2 px-2 rounded-md flex justify-start items-center"
        >
          <Plus className="h-5" />
          <p className="px-2">New Tab</p>
        </button>
        <SortableContext items={tabGroups.map((tabGroup) => tabGroup.id)}>
          {tabGroups.map((tabGroup) => (
            <ContextMenu key={`tab-${tabGroup.id}`}>
              <ContextMenuTrigger>
                <TabGroupItem
                  setActiveTabGroup={setActiveTabGroup}
                  activeTabGroup={activeTabGroup!}
                  tabGroup={tabGroup}
                  tab={tabGroup.active}
                />
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64 bg-white/95 ring isolate ring-black/5">
                <ContextMenuItem
                  className="hover:bg-gray-200"
                  inset
                  onClick={layout.split.vertical}
                >
                  Add new Vertical Tab
                  <ContextMenuShortcut></ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  className="hover:bg-gray-200"
                  inset
                  onClick={layout.split.horizontal}
                >
                  Add new Horizontal Tab
                  <ContextMenuShortcut></ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset className="hover:bg-gray-200">
                  <DrawerTrigger>Show full URL</DrawerTrigger>
                  <ContextMenuShortcut></ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem className="hover:bg-gray-200" inset>
                  {tabGroup.id}
                  <ContextMenuShortcut></ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
}

export default Tabs
