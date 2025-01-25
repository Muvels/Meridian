// WebViewPortal.tsx
import { useRef, useEffect } from 'react';

import { useWebview } from '@renderer/contexts/WebviewContext';
import useTabGroupStore from '@renderer/store/tabs';

/**
 * A React component that controls a single <webview> node
 * mounted on an external DOM element (the "portal root").
 */
export function WebViewPortal({
  isVisible,
  id,
  isClickable,
  url
}: {
  isVisible: boolean;
  id: string;
  isClickable: boolean;
  url: string;
}): JSX.Element | null {
  const { registerWebviewRef } = useWebview();
  const { activeTabGroup: activeTabGroupId, getTabGroupById, setActiveTab } = useTabGroupStore();
  const activeTabGroup = getTabGroupById(activeTabGroupId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  useEffect(() => {
    // If we haven't created the container yet, do it once.
    if (!containerRef.current) {
      const portalRoot = document.getElementById(`webview-portal-root${id}`);
      if (!portalRoot) {
        console.error('No portal root found for <webview>');
        return;
      }

      const handleFocus = (): void => {
        if (!activeTabGroup) return;
        setActiveTab(id, activeTabGroup); // Update active tab in store
      };
      // const handleDomReady = (): void => {
      //   window.nativeApi.activeTab.ready(webviewEl.getWebContentsId());
      // };

      // Create a DIV to hold the <webview> inside the portal root
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      // We'll hide/show this container dynamically
      container.style.display = isVisible ? 'block' : 'none';
      portalRoot.appendChild(container);
      containerRef.current = container;

      // Create the <webview> element
      const webviewEl = document.createElement('webview');
      webviewRef.current = webviewEl;
      registerWebviewRef(id, webviewRef.current);
      webviewEl.src = url;
      // Adjust any attributes you need, e.g.:
      // webviewEl.setAttribute('allowpopups', 'true');
      webviewEl.style.width = '100%';
      webviewEl.style.height = '100%';
      webviewEl.classList.add('tabs-scroll-container')
      webviewEl.allowpopups = true;
      webviewEl.webpreferences = 'sandbox';
      webviewEl.tabIndex = 0;

      webviewEl.addEventListener('focus', handleFocus);
      // webviewEl.addEventListener('dom-ready', handleDomReady);

      // Append <webview> to the container
      container.appendChild(webviewEl);
    } else {
      // Just toggle visibility if the container already exists
      containerRef.current.style.display = isVisible ? 'block' : 'none';
    }

    // Cleanup logic if you ever want to remove it from DOM when unmounting
    // (Often you won't want to remove it, to keep state alive)
    return () => {
      // If you *do* want to remove it from the DOM upon unmount:
      // if (containerRef.current) {
      //   containerRef.current.remove();
      //   containerRef.current = null;
      // }
    };
  }, [isVisible, activeTabGroup, id, setActiveTab, registerWebviewRef, url]);

  useEffect(() => {
    if (webviewRef.current) {
      webviewRef.current.style.pointerEvents = isClickable ? 'auto' : 'none';
    }
  }, [isClickable]);

  // We return nothing here because the actual DOM is *outside* React's hierarchy
  return null;
}
