import { useTabGroupStore } from '@renderer/store/tabs'
import { useCallback } from 'react'
import { useWebview } from 'src/contexts/WebviewContext'

interface useTabs {
  getTab(currentTabId?: string | null): Electron.WebviewTag | null
}

export const useTabs = (): useTabs => {
  const { getWebviewRef } = useWebview()
  const { activeTabGroup: activeTabGroupId, getTabGroupById,tabGroups } = useTabGroupStore()
  const activeTabGroup = getTabGroupById(activeTabGroupId)

  const getTab = useCallback((): Electron.WebviewTag | null => {
    console.log('activeTabGroup in useTabs ===', activeTabGroup)
    const webviewRef = getWebviewRef(activeTabGroup?.active.id)
    console.log('Retrieved WebviewRef:', webviewRef)
    return webviewRef
  }, [activeTabGroupId, tabGroups])

  return { getTab }
}
