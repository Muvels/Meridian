import { useWebview } from '@renderer/contexts/WebviewContext'
import useWindowsDimensions from '@renderer/hooks/useWindowsDimensions'
import { Tab } from '@renderer/store'
import React from 'react'

interface WebviewProps {
  ref: React.LegacyRef<Electron.WebviewTag>
  tab: Tab
  activeTab: string | null
}

const Webview = (props: WebviewProps) => {
  const { ref: webviewRef, tab, activeTab } = props
  const { registerWebviewRef } = useWebview()
  const windowDimensions = useWindowsDimensions()

  return (
    <webview
      ref={(ref) => ref && registerWebviewRef(tab.id, ref)}
      key={tab.id}
      src={`${tab.url.includes('https://') ? '' : 'https://'}${tab.url}`}
      className={`w-full h-full ${activeTab === tab.id ? '' : 'hidden'}`}
      style={{
        height: windowDimensions.height - 34
      }}
    ></webview>
  )
}

export default Webview
