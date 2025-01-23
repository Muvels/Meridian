import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// contextBridge.exposeInMainWorld('electron', {
//   onUrlChange: (callback) => ipcRenderer.on('url-changed', callback),
//   onTitleChange: (callback) => ipcRenderer.on('title-updated', callback)
// });

// Custom APIs for renderer
const api = {
  maximize: (): void => ipcRenderer.send('maximize'),
  minimize: (): void => ipcRenderer.send('minimize'),
  close: (): void => ipcRenderer.send('close'),
  activeTab: {
    ready: (wcId: number): void => ipcRenderer.send('webview-ready', wcId)
  },
  tab: {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onCreate: (callback) =>
      ipcRenderer.on('create-tab', (_event, value) => callback(value) as (value: string) => void),
    offCreate: (): void => {
      ipcRenderer.removeAllListeners('create-tab');
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onSplit: (callback) =>
      ipcRenderer.on(
        'create-split',
        (_event, value, type) =>
          callback(value, type) as (value: string, type: 'vertical' | 'horizontal') => void
      ),
    offSplit: (): void => {
      ipcRenderer.removeAllListeners('create-split');
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onBlur: (callback) => ipcRenderer.on('blur-tab', (_event) => callback() as () => void),
    offBlur: (): void => {
      ipcRenderer.removeAllListeners('blur-tab');
    }
  },
  store: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key): Promise<any> => ipcRenderer.invoke('store-get', key),
    set: (key, value): void => ipcRenderer.send('store-set', key, value)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronApi', electronAPI);
    contextBridge.exposeInMainWorld('nativeApi', api);
    console.log('API successfully exposed to the main world.');
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
