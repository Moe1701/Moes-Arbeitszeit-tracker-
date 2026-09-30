// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zeiterfassung DEV',
        short_name: 'Zeit DEV',
        theme_color: '#ef4444', // Rotes Theme zur Unterscheidung
        background_color: '#f1f5f9',
        display: 'standalone',
        icons: [
          // Hier später die 192x192 und 512x512 Icons einfügen
        ]
      }
    })
  ],
});