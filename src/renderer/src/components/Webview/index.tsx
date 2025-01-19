import { useWebview } from '@renderer/contexts/WebviewContext'
import useWindowsDimensions from '@renderer/hooks/useWindowsDimensions'
import useTabStore, { Tab } from '@renderer/store/tabs'
import { useLayoutStore } from '@renderer/store/layout'
import React, { useEffect, useRef, useMemo } from 'react'

interface WebviewProps {
  tab: Tab
  activeTab: string | null
  occurence?: number
}

const Webview = React.memo(
  ({ tab, activeTab, occurence }: WebviewProps) => {
    const { registerWebviewRef } = useWebview()
    const { isTabVisible } = useLayoutStore()
    const windowDimensions = useWindowsDimensions()
    const { setActiveTab } = useTabStore()
    const webviewRef = useRef<Electron.WebviewTag | null>(null)
    console.log('Occurances', occurence)
    const webviewElement = useMemo(
      () => (
        <webview
          ref={(ref: Electron.WebviewTag) => {
            webviewRef.current = ref
            registerWebviewRef(tab.id, ref)
          }}
          src={tab.url.startsWith('https://') ? tab.url : `https://${tab.url}`}
          className={` w-full h-full overflow-hidden rounded-lg flex-1`}
          style={{ height: (windowDimensions.height - 34) / (occurence ?? 1) }}
        ></webview>
      ),
      [tab.id, tab.url, isTabVisible, registerWebviewRef, windowDimensions.height]
    )

    useEffect(() => {
      const webview = webviewRef.current

      const handleFocus = () => {
        if (activeTab !== tab.id) {
          console.log('Webview gained focus:', tab.id)
          setActiveTab(tab.id)
        }
      }

      webview?.addEventListener('focus', handleFocus)

      return () => {
        webview?.removeEventListener('focus', handleFocus)
      }
    }, [tab.id, activeTab, setActiveTab])

    return (
      <div
        className={`webview-container w-full h-full ${isTabVisible(tab.id) ? '' : 'webview-hidden'}`}
        data-id={tab.id}
      >
        {webviewElement}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.tab.id === nextProps.tab.id &&
      prevProps.tab.url === nextProps.tab.url &&
      prevProps.activeTab === nextProps.activeTab
    )
  }
)

Webview.displayName = 'Webview'

export default Webview
