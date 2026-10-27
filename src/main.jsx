import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

// Auto-Update: Der Browser lädt im Hintergrund leise die neue Version herunter
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Hier könnte man einen "Neue Version verfügbar. Neuladen?" Toast anzeigen.
    // Bei registerType: 'autoUpdate' wird dies ohnehin meist automatisch beim nächsten App-Start angewandt.
  },
  onOfflineReady() {
    console.log('App ist bereit für den Offline-Gebrauch.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);