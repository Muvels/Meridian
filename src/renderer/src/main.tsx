import React from 'react';
import ReactDOM from 'react-dom/client';

import { WebviewProvider } from 'src/contexts/WebviewContext';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element with ID 'root' not found in the DOM.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WebviewProvider>
      <App />
    </WebviewProvider>
  </React.StrictMode>
);
