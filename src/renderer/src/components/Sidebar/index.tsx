import { Search, RotateCcw, Settings, ArrowLeft, ArrowRight, PanelLeftDashed } from 'lucide-react';
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
import { NativeSidebarControls } from '../NativeControls/NativeSidebarControls';
import UpdateNotification from '../update-badge';

interface SidebarProps {
  currentTab: string | null;
  handleOpenCommandBox: (url: string) => void;
}

export const AppSidebar = (props: SidebarProps): JSX.Element => {
  const { currentTab, handleOpenCommandBox } = props;
  const { isPinned, isOpen, setPinned, isSettings, setSettings } = useSidebarStore();
  const { backgroundColor, darkTheme } = useSettingsStore();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);

  const { getTab } = useTabs();
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  useEffect(() => {
    webviewRef.current = getTab();
    const webview = webviewRef.current;

    window.nativeApi.onCheckUpdate(() => setCanUpdate(true));

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
        window.nativeApi.offCheckUpdate(() => setCanUpdate(true));
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
          `shadow-xl fixed top-0 left-0 z-50 h-full  w-[14rem] transition-transform duration-[70ms] ease-in ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`,
        isPinned && ''
      )}
      variant={isPinned ? 'sidebar' : 'floating'}
    >
      <SidebarContent id="no-drag" style={{ backgroundColor }} className="border-none box-border">
        <NativeSidebarControls>
          <Button
            className={clsx('shadow-none w-5 px-3 h-8 bg-gray-900 bg-opacity-10')}
            onClick={() => setSettings(!isSettings)}
          >
            <Settings style={{ color: darkTheme ? 'white' : 'black' }} />
          </Button>
          <Button
            className={clsx(
              'bg-transparent shadow-none w-5 px-3 h-8',
              isPinned && 'bg-gray-900 bg-opacity-10'
            )}
            onClick={() => setPinned(!isPinned)}
          >
            <PanelLeftDashed style={{ color: darkTheme ? 'white' : 'black' }} />
          </Button>
        </NativeSidebarControls>
        <Button
          className="bg-opacity-10 bg-gray-900 border-black mx-3 z-10 rounded-2xl shadow-none"
          onClick={() => void handleOpenCommandBox(currentTab ? `!url ${currentTab}` : '')}
        >
          <div className="flex justify-between items-center w-full">
            <Search className="" style={{ color: darkTheme ? 'white' : 'black' }} />
            <p
              className={clsx(
                'p-2 w-full font-semibold',
                !currentTab && 'text-[#8a793f]',
                currentTab && 'truncate  text-[#5b5029]'
              )}
              style={{ color: darkTheme ? 'white' : 'black' }}
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
            <ArrowLeft style={{ color: darkTheme ? 'white' : 'black' }} />
          </Button>
          <Button
            className="bg-transparent border-none shadow-none w-1/2"
            onClick={handleRedo}
            disabled={!canGoForward}
          >
            <ArrowRight style={{ color: darkTheme ? 'white' : 'black' }} />
          </Button>
          <Button className="bg-transparent border-none shadow-none w-1/2" onClick={handleReload}>
            <RotateCcw style={{ color: darkTheme ? 'white' : 'black' }} />
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
            {canUpdate ? <UpdateNotification /> : <></>}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
