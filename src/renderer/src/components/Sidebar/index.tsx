import { Search, RotateCcw, PanelRightClose, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { useTabs } from 'src/hooks/use-tabs';
import { useSidebarStore } from 'src/store/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from 'src/components/ui/sidebar';
import { useSettingsStore } from '@renderer/store/settings';

import Tabs from '../Tabs';
import { DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import NativeControls from '../NativeControls';

interface SidebarProps {
  currentTab: string | null;
  handleOpenCommandBox: (url: string) => void;
}

export const AppSidebar = (props: SidebarProps): JSX.Element => {
  const { currentTab, handleOpenCommandBox } = props;
  const { isPinned, isOpen, setPinned, isSettings, setSettings } = useSidebarStore();
  const { backgroundColor } = useSettingsStore();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const { getTab } = useTabs();
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  useEffect(() => {
    webviewRef.current = getTab();
    const webview = webviewRef.current;

    if (window.electronApi && webviewRef && webview) {
      const updateNavButtons = (): void => {
        if (webviewRef) {
          setCanGoBack(webview.canGoBack());
          setCanGoForward(webview.canGoForward());
        }
      };

      const handleDomReady = (): void => updateNavButtons();

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
    }
    return () => {};
  }, [getTab, webviewRef]);

  const handleReload = (): void => {
    webviewRef?.current?.reload();
  };

  const handleUndo = (): void => {
    webviewRef?.current?.goBack();
  };

  const handleRedo = (): void => {
    webviewRef?.current?.goForward();
  };

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
      <SidebarContent id="no-drag" style={{ backgroundColor }} className="border-none box-border">
        <NativeControls>
          <Button
            className={clsx('bg-transparent shadow-none w-5 px-3 h-8 bg-slate-700 bg-opacity-10')}
            onClick={() => setSettings(!isSettings)}
          >
            <Settings />
          </Button>
          <Button
            className={clsx(
              'bg-transparent shadow-none w-5 px-3 h-8',
              isPinned && 'bg-slate-700 bg-opacity-10'
            )}
            onClick={() => setPinned(!isPinned)}
          >
            <PanelRightClose />
          </Button>
        </NativeControls>
        <Button
          className="bg-opacity-10 border-none mx-2 z-10 rounded-2xl"
          onClick={() => void handleOpenCommandBox(currentTab ? `!url ${currentTab}` : '')}
        >
          <div className="flex justify-between items-center w-full">
            <Search className="text-[#8a793f]" />
            <p
              className={clsx(
                'p-2 w-full',
                !currentTab && 'text-[#8a793f]',
                currentTab && 'truncate  text-[#5b5029]'
              )}
            >
              {isSettings ? 'Settings' : currentTab ?? 'Suche nach etwas'}
            </p>
          </div>
        </Button>
        <div className="w-full flex justify-between items-center">
          <Button
            className="bg-transparent border-none shadow-none w-1/2"
            onClick={handleUndo}
            disabled={!canGoBack}
          >
            <ArrowLeft />
          </Button>
          <Button
            className="bg-transparent border-none shadow-none w-1/2"
            onClick={handleRedo}
            disabled={!canGoForward}
          >
            <ArrowRight />
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
};
