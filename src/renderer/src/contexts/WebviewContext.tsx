import { createContext, useContext, useRef } from 'react';

// Definiere den Typ für den Webview-Kontext
interface WebviewContextType {
  getWebviewRef: (tabId: string) => Electron.WebviewTag | null;
  registerWebviewRef: (tabId: string, ref: Electron.WebviewTag) => void;
  unregisterWebviewRef: (tabId: string) => void;
}

type WebviewRefsType = {
  [tabId: string]: Electron.WebviewTag;
};

export const WebviewContext = createContext({} as WebviewContextType);

export function WebviewProvider({ children }): JSX.Element {
  const webviewRefs = useRef<WebviewRefsType>({});

  const getWebviewRef = (tabId: string): Electron.WebviewTag => webviewRefs.current[tabId];

  const registerWebviewRef = (tabId: string, ref: Electron.WebviewTag): void => {
    webviewRefs.current[tabId] = ref;
  };

  const unregisterWebviewRef = (tabId: string): void => {
    if (!webviewRefs.current[tabId]) return;
    delete webviewRefs.current[tabId];
  };

  return (
    <WebviewContext.Provider value={{ getWebviewRef, registerWebviewRef, unregisterWebviewRef }}>
      {children}
    </WebviewContext.Provider>
  );
}

export const useWebview = (): WebviewContextType => useContext(WebviewContext);
