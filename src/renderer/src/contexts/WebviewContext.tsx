import { createContext, useContext, useRef } from 'react';

// Definiere den Typ für den Webview-Kontext
interface WebviewContextType {
  getWebviewRef: (tabId: string) => Electron.WebviewTag | null;
  registerWebviewRef: (tabId: string, ref: Electron.WebviewTag) => void;
}

export const WebviewContext = createContext({} as WebviewContextType);

export function WebviewProvider({ children }) {
  const webviewRefs = useRef({});

  const getWebviewRef = (tabId) => webviewRefs.current[tabId];

  const registerWebviewRef = (tabId, ref) => {
    webviewRefs.current[tabId] = ref;
    console.log('All refs', webviewRefs);
  };

  return (
    <WebviewContext.Provider value={{ getWebviewRef, registerWebviewRef }}>
      {children}
    </WebviewContext.Provider>
  );
}

export const useWebview = () => useContext(WebviewContext);
