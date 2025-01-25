import { ElectronAPI, IpcRendererEvent } from '@electron-toolkit/preload';

interface api {
  maximize: () => void;
  minimize: () => void;
  close: () => void;
  suggest: (q: string) => Promise<{ phrase: string }[]>;
  onCheckUpdate: (callback: () => void) => void;
  offCheckUpdate: (callback: () => void) => void;
  activeTab: {
    ready: (wcId: number) => void;
  };
  tab: {
    onCreate: (callback: (url: string) => void) => void;
    offCreate: (callback: (url: string) => void) => void;
    onSplit: (callback: (url: string, type: 'row' | 'column') => void) => void;
    offSplit: (callback: (url: string, type: 'row' | 'column') => void) => void;
    onBlur: (callback: () => void) => void;
    offBlur: (callback: () => void) => void;
  };
  store: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key) => Promise<any>;
    set: (key, value) => void;
  };
}

declare global {
  interface Window {
    electronApi: ElectronAPI;
    nativeApi: api;
  }
}
