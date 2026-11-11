import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const buildTime = new Date().toISOString();
  return {
    define: {
      __APP_BUILD_TIME__: JSON.stringify(buildTime),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'חִתַּ״ת יומי - חומש תהילים תניא',
          short_name: 'חת״ת יומי',
          description: 'לימוד חומש יומי עם רש״י, תהילים, תניא קדישא, היום יום ורמב״ם יומי',
          theme_color: '#78350f',
          background_color: '#fffbeb',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          dir: 'rtl',
          lang: 'he',
          categories: ['books', 'education'],
          display_override: ['standalone'],
          launch_handler: { client_mode: 'navigate-existing' },
          shortcuts: [
            {
              name: 'חומש היומי',
              short_name: 'חומש',
              url: '/?section=chumash',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'תהילים היומי',
              short_name: 'תהילים',
              url: '/?section=tehillim',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'תניא היומי',
              short_name: 'תניא',
              url: '/?section=tanya',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'היום יום',
              short_name: 'היום יום',
              url: '/?section=hayom_yom',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'רמב״ם היומי',
              short_name: 'רמב״ם',
              url: '/?section=rambam',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
          screenshots: [
            { src: '/screenshots/home.png', sizes: '1080x2340', type: 'image/png', form_factor: 'narrow', label: 'עמוד ראשי – שיעורי היום' },
            { src: '/screenshots/chumash.png', sizes: '1080x2340', type: 'image/png', form_factor: 'narrow', label: 'חומש עם רש״י' },
            { src: '/screenshots/hayom-yom.png', sizes: '1080x2340', type: 'image/png', form_factor: 'narrow', label: 'היום יום' },
            { src: '/screenshots/calendar.png', sizes: '1080x2340', type: 'image/png', form_factor: 'narrow', label: 'לוח שנה והתקדמות' },
            { src: '/screenshots/wide.png', sizes: '1920x1200', type: 'image/png', form_factor: 'wide', label: 'חת״ת יומי במחשב' },
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Shows reminder notifications sent by the server (see worker/)
          importScripts: ['push-sw.js'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          // Store screenshots are not needed offline
          globIgnores: ['**/screenshots/**'],
          // Static pages and Android app verification files are served as they are, not by the app
          navigateFallbackDenylist: [/^\/privacy(\.html)?$/, /^\/sources(\.html)?$/, /^\/\.well-known\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/www\.sefaria\.org\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'sefaria-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
