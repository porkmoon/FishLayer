import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import NovelWindow from './components/NovelWindow.jsx';
import BrowserWindow from './components/BrowserWindow.jsx';
import StealthReader from './components/StealthReader.jsx';
import './styles/index.css';

const hash = window.location.hash;

console.log('当前路由:', hash);

if (hash === '#/novel-window') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <NovelWindow />
    </React.StrictMode>
  );
} else if (hash === '#/browser-window') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserWindow />
    </React.StrictMode>
  );
} else if (hash === '#/stealth-reader') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <StealthReader />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
