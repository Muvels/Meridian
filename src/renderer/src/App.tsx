import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import AddressBar from './components/AddressBar'
import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/Sidebar'
import { Drawer, DrawerContent, DrawerFooter } from './components/ui/drawer'
import {
  Mosaic,
  MosaicBranch,
  MosaicWindow,
  getNodeAtPath,
  updateTree
} from 'react-mosaic-component'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import 'react-mosaic-component/react-mosaic-component.css'
import './assets/styles.css'

import { useTabGroupStore } from './store/tabs'
import { useTabs } from './hooks/use-tabs'
import { useSidebarStore } from 'src/store/sidebar'
import clsx from 'clsx'
import { useLayoutStore } from './store/layout'
import TilingRenderer from './components/Tiling/TilingRenderer'
import { WebViewPortal } from './components/Webview/portal'
import { Toolbar } from './components/Toolbar'
import { MosaicView } from './components/Tiling/MosaicView'

function App(): JSX.Element {
  // const { updateTabTitle, updateTabFavicon, updateTabUrl } = useTabStore()
  const {
    tabGroups,
    activeTabGroup: activeTabGroupId,
    updateTabTitle,
    updateTabUrl,
    updatedLayout,
    getTabGroupById
  } = useTabGroupStore()
  const { isPinned, setOpen, isOpen } = useSidebarStore()
  // const tabs = useTabStore((state) => state.tabs) // Subscribe directly
  // const activeTab = useTabStore((state) => state.activeTab)
  const layout = useLayoutStore((state) => state.tree) // Your store state
  const { getTab } = useTabs()
  const [isClickable, setIsClickable] = useState(true)

  const activeTabGroup = getTabGroupById(activeTabGroupId!)

  const webviewRef = useRef<Electron.WebviewTag | null>(
    null
  ) as MutableRefObject<Electron.WebviewTag | null>

  // const activeTabUrl = tabs.find((tab) => tab.id === activeTab)?.url || ''

  webviewRef.current = getTab(activeTabGroup?.active.id)

  useEffect(() => {
    console.log('activeTabGroup===', activeTabGroup)
    webviewRef.current = getTab()

    if (!window.electron) {
      console.error('❌ Electron is not available')
    } else {
      console.log('✅ Electron is available')
    }

    if (!webviewRef) {
      console.error('❌ webviewRef is not defined')
    } else {
      console.log('✅ webviewRef is defined:', webviewRef)
    }

    if (!webviewRef?.current) {
      console.error('❌ webviewRef.current is not set')
    } else {
      console.log('✅ webviewRef.current is set:', webviewRef.current)
    }

    if (window.electron && webviewRef && webviewRef.current) {
      console.log('🎉 All conditions are met!')
    }

    if (window.electron && webviewRef && webviewRef.current) {
      const webview = webviewRef.current

      const handleUrlChange = (event, newUrl) => {
        if (activeTabGroup && newUrl) {
          console.log('TABURL CHNAGES INTIATED')
          updateTabUrl(activeTabGroup, activeTabGroup?.active, newUrl)
        }
      }

      const handleTitleChange = (event, newTitle) => {
        if (activeTabGroup && activeTabGroup.active && newTitle) {
          updateTabTitle(activeTabGroup, activeTabGroup.active, newTitle)
          // updateTabTitle(activeTab, newTitle) // Correctly update only the active tab
        }
      }

      const handleIconChange = (event, newIcons) => {
        if (false && newIcons) {
          const [faviconUrl] = event.favicons // Electron returns an array
          // updateTabFavicon(activeTab, faviconUrl) // Correctly update only the active tab
        }
      }

      // Attach listeners when the active tab changes
      webview.addEventListener('did-navigate', (event) => {
        handleUrlChange(event, webview.getURL())
      })

      webview.addEventListener('page-title-updated', (event) => {
        handleTitleChange(event, webview.getTitle())
      })

      webview.addEventListener('page-favicon-updated', (event) => {
        handleIconChange(event, event.favicons)
      })

      // Cleanup previous listeners when tab changes
      return () => {
        webview.removeEventListener('did-navigate', handleUrlChange)
        webview.removeEventListener('page-title-updated', handleTitleChange)
        webview.removeEventListener('page-favicon-updated', handleIconChange)
      }
    }
  }, [activeTabGroupId, tabGroups, updateTabTitle, updateTabUrl])

  const handleUpdatedLayout = useCallback((newNode) => {
      updatedLayout(newNode)
    },
    [updatedLayout]
  )

  console.log('TABS: ', tabGroups)
  return (
    <>
      <div
        hidden={isPinned}
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(true)}
        className="absolute top-0 left-0 h-full w-10 z-50"
      />
      <div
        hidden={isPinned || !isOpen}
        onMouseEnter={() => setOpen(false)}
        className="absolute right-0 h-full w-4/5 z-50"
      />
      <Drawer>
        <DrawerContent id="no-drag" className="bg-default">
          <AddressBar url={activeTabGroup?.active.url} />

          <DrawerFooter></DrawerFooter>
        </DrawerContent>

        <SidebarProvider>
          <AppSidebar
            currentTab={activeTabGroup?.active.url}
            currentTabId={activeTabGroup?.active.id}
          />
          <div
            id="drag"
            className={clsx(
              'w-screen overflow-x-hidden',
              !isPinned && 'absolute p-2',
              isPinned && 'py-3 pr-3'
            )}
          >
            <div id="no-drag" className="rounded-lg overflow-hidden">
              {activeTabGroup ? (
                <div>
                  <div className={`w-full h-[calc(100vh-1*1rem)] flex justify-center items-center`}>
                    <MosaicView
                      tabGroups={tabGroups}
                      activeTabGroupId={activeTabGroupId}
                      isClickable={isClickable}
                      updatedLayout={handleUpdatedLayout}
                      setIsClickable={setIsClickable}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white w-full h-full flex justify-center items-center"></div>
              )}
            </div>
          </div>
        </SidebarProvider>
      </Drawer>
    </>
  )
}

export default App
