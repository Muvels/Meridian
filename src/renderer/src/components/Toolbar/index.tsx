import { X, Info, ArrowLeft, ArrowRight, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useTabs } from '@renderer/hooks/use-tabs';
import { useWebview } from '@renderer/contexts/WebviewContext';
import useTabGroupStore from '@renderer/store/tabs';

interface ToolbarProps {
  id: string;
  title: string | undefined;
}

export const Toolbar = ({ id, title }: ToolbarProps): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const { unregisterWebviewRef } = useWebview();
  const { removeTab } = useTabGroupStore();
  const { getTab } = useTabs();
  const webviewRef = useRef<Electron.WebviewTag | null>(getTab(id));

  useEffect(() => {
    webviewRef.current = getTab(id)!;

    const updateNavButtons = (): void => {
      if (webviewRef && webviewRef.current) {
        setCanGoBack(webviewRef.current.canGoBack());
        setCanGoForward(webviewRef.current.canGoForward());
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
  }, [getTab, id, webviewRef]);

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
    <div className="h-full w-full flex items-center justify-between gap-2 mr-2">
      <div className="flex gap-3">
        <button onClick={handleUndo} disabled={!canGoBack}>
          <ArrowLeft width={17} />
        </button>
        <button onClick={handleRedo} disabled={!canGoForward}>
          <ArrowRight width={17} />
        </button>
        <button onClick={handleReload}>
          <RefreshCcw width={15} />
        </button>
      </div>
      <p className="">{title}</p>
      <div className="flex gap-3">
        <div style={{ width: 17 }}></div>
        <button onClick={() => alert(`Action for ${id}`)}>
          <Info width={17} />
        </button>
        <button onClick={() => removeTab(id, unregisterWebviewRef)}>
          <X width={17} />
        </button>
      </div>
    </div>
  );
};
