import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebviewProvider } from 'src/contexts/WebviewContext';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WebviewProvider>
      <App />
    </WebviewProvider>
  </React.StrictMode>
);
