import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const packages = path.resolve(__dirname, '../../packages');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['SundoGo_Logo.svg'],
      manifest: {
        name: 'SundoGo',
        short_name: 'SundoGo',
        description:
          'Book tricycle rides around your town. Quick, safe, and reliable local transportation.',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Mapbox tiles & API assets
            urlPattern: /^https:\/\/api\.mapbox\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sundogo/types': path.resolve(packages, 'types/src'),
      '@sundogo/validation': path.resolve(packages, 'validation/src'),
      '@sundogo/ui': path.resolve(packages, 'ui/src'),
      '@sundogo/auth': path.resolve(packages, 'auth/src'),
      '@sundogo/config': path.resolve(packages, 'config/src'),
    },
  },
  server: { port: 5175 },
});
