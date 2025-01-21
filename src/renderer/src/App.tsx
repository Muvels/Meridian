import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { MosaicNode } from 'react-mosaic-component';
import useHotkeys from '@reecelucas/react-use-hotkeys';

import { useSidebarStore } from '@renderer/store/sidebar';

import AddressBar from './components/AddressBar';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/Sidebar';
import { Drawer, DrawerContent, DrawerFooter } from './components/ui/drawer';
import { useTabGroupStore } from './store/tabs';
import { useTabs } from './hooks/use-tabs';
import { MosaicView } from './components/Tiling/MosaicView';
import { webviewDebugger } from './lib/helper';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';
import './assets/styles.css';
import Settings from './components/Settings';
import { useSettingsStore } from './store/settings';

function App(): JSX.Element {
  // const { updateTabTitle, updateTabFavicon, updateTabUrl } = useTabStore()
  const {
    tabGroups,
    activeTabGroup: activeTabGroupId,
    updateTabTitle,
    updateTabUrl,
    updatedLayout,
    getTabGroupById,
    addTabGroup,
    layout
  } = useTabGroupStore();
  const { isPinned, setOpen, isOpen, isSettings, setPinned } = useSidebarStore();
  const { backgroundColor, hotkeys } = useSettingsStore();
  const { getTab } = useTabs();
  const [isClickable, setIsClickable] = useState(true);
  const activeTabGroup = getTabGroupById(activeTabGroupId);
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  useHotkeys(hotkeys.Controls.getFocus, () => webviewRef.current?.focus());
  useHotkeys(hotkeys.Controls.toggleSidebar, () => setPinned(!isPinned));
  useHotkeys(hotkeys.Controls.sidebarVisible, () => setOpen(!isOpen));
  useHotkeys(hotkeys.Browser.reload, () => webviewRef.current?.reload());
  useHotkeys(hotkeys.Browser.undo, () => webviewRef.current?.goBack());
  useHotkeys(hotkeys.Browser.redo, () => webviewRef.current?.goForward());
  useHotkeys(hotkeys.Split.horizontally, () => layout.split.horizontal());
  useHotkeys(hotkeys.Split.vertically, () => layout.split.vertical());

  // eslint-disable-next-line react-compiler/react-compiler
  webviewRef.current = getTab(activeTabGroup?.active.id);

  useEffect(() => {
    const handleCreate = (pUrl: string): void => {
      addTabGroup(pUrl);
    };
    window.nativeApi.tab.onCreate(handleCreate);
    return () => {
      window.nativeApi.tab.offCreate(handleCreate);
    };
  }, [addTabGroup]);

  useEffect(() => {
    webviewRef.current = getTab(activeTabGroup?.active.id);
    webviewDebugger(window, webviewRef);
    if (window.electronApi && webviewRef && webviewRef.current) {
      const webview = webviewRef.current;

      const handleUrlChange = (_event, newUrl: string): void => {
        if (activeTabGroup && newUrl) {
          updateTabUrl(activeTabGroup, activeTabGroup?.active, newUrl);
        }
      };
      const handleTitleChange = (_event, newTitle: string): void => {
        if (activeTabGroup && activeTabGroup.active && newTitle) {
          updateTabTitle(activeTabGroup, activeTabGroup.active, newTitle);
        }
      };
      const handleIconChange = (_event, _newIcons): void => {};

      const handleDomReady = (): void => {
        window.nativeApi.activeTab.ready(webview.getWebContentsId());
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        // Check if the pressed keys match the "loseFocus" hotkey
        console.log('Keys pressed', event);
        const isLoseFocusHotkey = event.metaKey && event.key === 'Escape'; // meta+esc

        if (isLoseFocusHotkey && webview) {
          console.log('Lose focus hotkey pressed!');
          webview.blur(); // Remove focus from the webview
          event.preventDefault(); // Prevent default behavior if necessary
        }
      };

      window.nativeApi.tab.onBlur(() => webview.blur());
      // Attach listeners when the active tab changes
      webview.addEventListener('did-navigate', (event) => {
        handleUrlChange(event, webview.getURL());
      });
      webview.addEventListener('page-title-updated', (event) => {
        handleTitleChange(event, webview.getTitle());
      });
      webview.addEventListener('page-favicon-updated', (event) => {
        handleIconChange(event, event.favicons);
      });
      webview.addEventListener('dom-ready', handleDomReady);
      webview.addEventListener('keydown', handleKeyDown);

      // Cleanup previous listeners when tab changes
      return () => {
        webview.removeEventListener('did-navigate', handleUrlChange as EventListener);
        webview.removeEventListener('page-title-updated', handleTitleChange as EventListener);
        webview.removeEventListener('page-favicon-updated', handleIconChange as EventListener);
        webview.removeEventListener('dom-ready', handleDomReady);
        webview.removeEventListener('keydown', handleKeyDown);
        window.nativeApi.tab.offBlur(() => webview.blur());
      };
    }

    // Return a no-op cleanup function for other cases
    return () => {};
  }, [activeTabGroup, activeTabGroupId, getTab, tabGroups, updateTabTitle, updateTabUrl]);

  const handleUpdatedLayout = useCallback(
    (newNode: MosaicNode<string>) => {
      updatedLayout(newNode);
    },
    [updatedLayout]
  );

  const handleUrlChange = useCallback((url: string) => {
    void (webviewRef && webviewRef.current && webviewRef.current.loadURL(url));
  }, []);

  return (
    <div style={{ backgroundColor }}>
      <button
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
        <DrawerContent id="no-drag" style={{ backgroundColor }}>
          <AddressBar changeUrl={handleUrlChange} url={activeTabGroup?.active.url ?? ''} />

          <DrawerFooter></DrawerFooter>
        </DrawerContent>

        <SidebarProvider>
          <AppSidebar currentTab={activeTabGroup?.active.url ?? ''} />
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
                  <div
                    className={clsx(
                      'w-full flex justify-center items-center',
                      isPinned ? 'h-[calc(100vh-2*1rem)]' : 'h-[calc(100vh-1*1rem)]'
                    )}
                  >
                    <MosaicView
                      tabGroups={tabGroups}
                      activeTabGroupId={activeTabGroupId}
                      isClickable={isClickable}
                      updatedLayout={handleUpdatedLayout}
                      setIsClickable={setIsClickable}
                    />
                  </div>
                </div>
              ) : isSettings ? (
                <div
                  className={clsx(
                    'w-full bg-white overflow-auto',
                    isPinned ? 'h-[calc(100vh-2*1rem)]' : 'h-[calc(100vh-1*1rem)]'
                  )}
                >
                  <Settings />
                </div>
              ) : (
                <div
                  className={clsx(
                    'w-full bg-white overflow-auto',
                    isPinned ? 'h-[calc(100vh-2*1rem)]' : 'h-[calc(100vh-1*1rem)]'
                  )}
                ></div>
              )}
            </div>
          </div>
        </SidebarProvider>
      </Drawer>
    </div>
  );
}

export default App;
