import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Automatically register PWA service worker for offline support and installation in production
if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true });
  } catch (e) {
    console.warn('SW registration skipped:', e);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
