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
      injectRegister: 'auto',
      workbox: {
        // Cacht alle wichtigen Assets für den 100% Offline-Betrieb
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Verhindert Caching-Fehler bei externen API Calls (Feiertage)
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        name: 'Zeiterfassung Pro',
        short_name: 'Zeit Pro',
        description: 'Local-First Schichtdienst Zeiterfassung',
        theme_color: '#f1f5f9',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});