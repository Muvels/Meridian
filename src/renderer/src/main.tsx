import React from 'react';
import ReactDOM from 'react-dom/client';

import { WebviewProvider } from 'src/contexts/WebviewContext';

import App from './App';
import { Settings, useSettingsStore } from './store/settings';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element with ID 'root' not found in the DOM.");
}

const preloadSettings = async (): Promise<void> => {
  try {
    useSettingsStore
      .getState()
      .initialize((await window.nativeApi.store.get('settings')) as Settings); // Populate the store
  } catch (err) {
    console.error('Failed to fetch settings:', err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
void preloadSettings().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <WebviewProvider>
        <App />
      </WebviewProvider>
    </React.StrictMode>
  );
});
