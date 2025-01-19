import { Search, RotateCcw, Undo2, Redo2, PanelRightClose } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { useSidebarStore } from 'src/store/sidebar';

import Tabs from '../Tabs';
import { DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import NativeControls from '../NativeControls';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

interface SidebarProps {
  currentTab: string | null;
  currentTabId: string | null;
}

export function AppSidebar(props: SidebarProps) {
  const { currentTab } = props;
  const { isPinned, isOpen, setOpen, setPinned } = useSidebarStore();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const { getTab } = useTabs();
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  webviewRef.current = getTab();

  useEffect(() => {
    webviewRef.current = getTab();
    console.log('webviewRef', webviewRef);
    const updateNavButtons = () => {
      if (webviewRef) {
        setCanGoBack(webviewRef.current.canGoBack());
        setCanGoForward(webviewRef.current.canGoForward());
      }
    };

    const handleDomReady = () => updateNavButtons();

    if (webviewRef.current) {
      webviewRef.current.addEventListener('dom-ready', handleDomReady);
      webviewRef.current.addEventListener('did-navigate', updateNavButtons);
      webviewRef.current.addEventListener('did-navigate-in-page', updateNavButtons);
    }

    return () => {
      if (webviewRef.current) {
        webviewRef.current.removeEventListener('dom-ready', handleDomReady);
        webviewRef.current.removeEventListener('did-navigate', updateNavButtons);
        webviewRef.current.removeEventListener('did-navigate-in-page', updateNavButtons);
      }
    };
  }, [webviewRef, webviewRef.current]);

  const handleReload = () => {
    webviewRef?.current?.reload();
  };

  const handleUndo = () => {
    webviewRef?.current?.goBack();
  };

  const handleRedo = () => {
    webviewRef?.current?.goForward();
  };

  console.log(canGoBack, canGoForward);

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
        <NativeControls>
          <Button
            className="bg-transparent border-none shadow-none w-10"
            onClick={() => setPinned(!isPinned)}
          >
            <PanelRightClose />
          </Button>
        </NativeControls>
        <Button className="bg-[#b39e55] border-none mx-2 z-10">
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
          <Button className="bg-transparent border-none shadow-none w-1/2" onClick={handleReload}>
            <RotateCcw />
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
            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto overflow-x-hidden tabs-scroll-container">
              <Tabs />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
