import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { NotificationCenter } from './components/NotificationCenter';
import './index.css';
import './performance.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <NotificationCenter />
  </StrictMode>,
);
