import { Calendar, Home, Inbox, Search, Settings, RotateCcw, Undo2, Redo2 } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { Drawer } from 'vaul'
import { Button } from '../ui/button'
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '../ui/drawer'
import Tabs from '../Tabs'
import clsx from 'clsx'
import { useWebview } from 'src/contexts/WebviewContext'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useTabs } from 'src/hooks/use-tabs'
import { useSidebarStore } from 'src/store/sidebar'

interface SidebarProps {
  currentTab: string | null
  currentTabId: string | null
}

export function AppSidebar(props: SidebarProps) {
  const { currentTab } = props
  const { isPinned, isOpen, setOpen } = useSidebarStore()
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const { getTab } = useTabs()
  const webviewRef = useRef<Electron.WebviewTag | null>(
    null
  ) as MutableRefObject<Electron.WebviewTag | null>

  webviewRef.current = getTab()

  useEffect(() => {
    webviewRef.current = getTab()
    console.log('webviewRef', webviewRef)
    const updateNavButtons = () => {
      if (webviewRef) {
        setCanGoBack(webviewRef.current.canGoBack())
        setCanGoForward(webviewRef.current.canGoForward())
      }
    }

    const handleDomReady = () => updateNavButtons()

    if (webviewRef.current) {
      webviewRef.current.addEventListener('dom-ready', handleDomReady)
      webviewRef.current.addEventListener('did-navigate', updateNavButtons)
      webviewRef.current.addEventListener('did-navigate-in-page', updateNavButtons)
    }

    return () => {
      if (webviewRef.current) {
        webviewRef.current.removeEventListener('dom-ready', handleDomReady)
        webviewRef.current.removeEventListener('did-navigate', updateNavButtons)
        webviewRef.current.removeEventListener('did-navigate-in-page', updateNavButtons)
      }
    }
  }, [webviewRef, webviewRef.current])

  const handleReload = () => {
    webviewRef?.current?.reload()
  }

  const handleUndo = () => {
    webviewRef?.current?.goBack()
  }

  const handleRedo = () => {
    webviewRef?.current?.goForward()
  }

  console.log(canGoBack, canGoForward)

  return (
    <Sidebar
      id="no-drag"
      className={clsx(
        'border-none',
        !isPinned &&
          `shadow-xl fixed top-0 left-0 z-50 h-full  w-64 transition-transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`,
        isPinned && ''
      )}
      variant={isPinned ? 'sidebar' : 'floating'}
    >
      <SidebarContent id="no-drag" className="bg-default border-none box-border">
        <div className="w-full h-10" id="placeholder"></div>
        <Button className="bg-[#b39e55] border-none mx-2">
          <div className="flex justify-between items-center w-full">
            <Search className="text-[#8a793f]" />
            <p
              className={clsx(
                'p-2',
                !currentTab && 'text-[#8a793f]',
                currentTab && 'truncate  text-[#5b5029]'
              )}
            >
              {currentTab ?? 'Suche nach etwas'}
            </p>
            <RotateCcw className="text-[#8a793f]" onClick={handleReload} />
          </div>
        </Button>
        <div className="w-full flex justify-between items-center">
          <Button
            className="bg-transparent border-none shadow-none w-1/2"
            onClick={handleUndo}
            disabled={!canGoBack}
          >
            <Undo2 />
          </Button>
          <Button
            className="bg-transparent border-none shadow-none w-1/2"
            onClick={handleRedo}
            disabled={!canGoForward}
          >
            <Redo2 />
          </Button>
        </div>
        <hr className="mx-2 text-[#8a793f]" />
        <SidebarGroup>
          <SidebarGroupLabel className="hidden">Tabs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DrawerTrigger className="hidden">Open</DrawerTrigger>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <Tabs />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
