import useTabStore from '@renderer/store'
import { useCallback } from 'react'
import { useWebview } from 'src/contexts/WebviewContext'

interface useTabs {
  getTab(currentTabId?: string | null): Electron.WebviewTag | null
}

export const useTabs = (): useTabs => {
  const { getWebviewRef } = useWebview()
  const activeTab = useTabStore((state) => state.activeTab)

  const getTab = useCallback((): Electron.WebviewTag | null => {
    const webviewRef = getWebviewRef(activeTab)
    console.log('Retrieved WebviewRef:', webviewRef)
    return webviewRef
  }, [activeTab])

  return { getTab }
}
