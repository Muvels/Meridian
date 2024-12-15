import { MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/AddressBar'
import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/Splash'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/Sidebar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from './components/ui/drawer'
import { Button } from './components/ui/button'

import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import useTabStore from './store'
import Webview from './components/Webview'
import { useTabs } from './hooks/use-tabs'
import { useSidebarStore } from 'src/store/sidebar'
import clsx from 'clsx'

function App(): JSX.Element {
  const { updateTabTitle, updateTabFavicon, updateTabUrl } = useTabStore()
  const { isPinned, setOpen, isOpen } = useSidebarStore()
  const tabs = useTabStore((state) => state.tabs) // Subscribe directly
  const activeTab = useTabStore((state) => state.activeTab)
  const { getTab } = useTabs()

  const webviewRef = useRef<Electron.WebviewTag | null>(
    null
  ) as MutableRefObject<Electron.WebviewTag | null>

  webviewRef.current = getTab()

  const activeTabUrl = tabs.find((tab) => tab.id === activeTab)?.url || ''

  useEffect(() => {
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
        if (activeTab && newUrl) {
          updateTabUrl(activeTab, newUrl) // Correctly update only the active tab
        }
      }

      const handleTitleChange = (event, newTitle) => {
        if (activeTab && newTitle) {
          updateTabTitle(activeTab, newTitle) // Correctly update only the active tab
        }
      }

      const handleIconChange = (event, newIcons) => {
        if (activeTab && newIcons) {
          const [faviconUrl] = event.favicons // Electron returns an array
          updateTabFavicon(activeTab, faviconUrl) // Correctly update only the active tab
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
  }, [activeTab, updateTabUrl, updateTabTitle])

  return (
    <>
     <div
        hidden={isPinned}
        onMouseEnter={() => setOpen(true)}
        onClick={()=> setOpen(true)}
        className="absolute top-0 left-0 h-full w-10 z-50"
      />
        <div
        hidden={isPinned || !isOpen}
        onMouseEnter={() => setOpen(false)}
        className="absolute right-0 h-full w-4/5 z-50"
      />
      <Drawer>
        <DrawerContent id="no-drag" className="bg-default">
          <AddressBar url={activeTabUrl} />

          <DrawerFooter></DrawerFooter>
        </DrawerContent>

        <SidebarProvider>
          <AppSidebar currentTab={activeTabUrl} currentTabId={activeTab} />
          <div
            id="drag"
            className={clsx(
              'w-screen overflow-x-hidden',
              !isPinned && 'absolute p-3',
              isPinned && 'py-3 pr-3'
            )}
          >
            <div id="no-drag" className="rounded-lg overflow-hidden ">
              {activeTabUrl ? (
                tabs.map((tab) => (
                  <Webview activeTab={activeTab} ref={webviewRef} tab={tab} key={tab.id} />
                ))
              ) : (
                <div className="bg-white w-full h-full flex justify-center items-center">
                  <Command className="bg-white rounded-lg border shadow-md md:min-w-[450px]">
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        <CommandItem>
                          <Calendar />
                          <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                          <Smile />
                          <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem disabled>
                          <Calculator />
                          <span>Calculator</span>
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup heading="Settings">
                        <CommandItem>
                          <User />
                          <span>Profile</span>
                          <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                          <CreditCard />
                          <span>Billing</span>
                          <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                          <Settings />
                          <span>Settings</span>
                          <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          </div>
        </SidebarProvider>
      </Drawer>
    </>
  )
}

export default App
