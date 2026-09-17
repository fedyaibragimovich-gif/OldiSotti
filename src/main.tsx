import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { translations } from './data/translations.ts';
import { initializeProductionMonitoring } from './lib/monitoring.ts';
import { syncSiteOriginMetadata } from './lib/siteMetadata.ts';
import './index.css';
import './performance.css';

// Keep user-facing copy consistently branded as OldiSotdi while legacy
// translation keys/storage identifiers remain compatible for existing users.
const localizedCopy = translations as unknown as Record<string, Record<string, unknown>>;
for (const locale of Object.values(localizedCopy)) {
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === 'string') {
      locale[key] = value.replace(/Oldisotti/g, 'OldiSotdi').replace(/OldiSotti/g, 'OldiSotdi');
    }
  }
}

if (typeof window !== 'undefined') {
  if (import.meta.env.PROD) initializeProductionMonitoring();
  syncSiteOriginMetadata();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
