import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const lazyModals = path.resolve(__dirname, 'src/lazyModals.tsx');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        { find: './components/ListingDetailModal', replacement: lazyModals },
        { find: './components/PostAdModal', replacement: lazyModals },
        { find: './components/AuthModal', replacement: lazyModals },
        { find: './components/ChatDrawer', replacement: lazyModals },
        { find: './components/FavoritesDrawer', replacement: lazyModals },
        { find: './components/MyAdsModal', replacement: lazyModals },
        { find: './components/InfoPagesModal', replacement: lazyModals },
        { find: './components/AdminPanelModal', replacement: lazyModals },
        { find: './AuthModal', replacement: lazyModals },
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');

            if (
              normalizedId.includes('node_modules/@firebase/firestore') ||
              normalizedId.includes('node_modules/firebase/firestore')
            ) {
              return 'firebase-firestore';
            }
            if (
              normalizedId.includes('node_modules/@firebase/auth') ||
              normalizedId.includes('node_modules/firebase/auth')
            ) {
              return 'firebase-auth';
            }
            if (
              normalizedId.includes('node_modules/@firebase/storage') ||
              normalizedId.includes('node_modules/firebase/storage')
            ) {
              return 'firebase-storage';
            }
            if (
              normalizedId.includes('node_modules/@firebase/app-check') ||
              normalizedId.includes('node_modules/firebase/app-check')
            ) {
              return 'firebase-app-check';
            }
            if (
              normalizedId.includes('node_modules/@firebase/app') ||
              normalizedId.includes('node_modules/firebase/app') ||
              normalizedId.includes('node_modules/@firebase/component') ||
              normalizedId.includes('node_modules/@firebase/logger') ||
              normalizedId.includes('node_modules/@firebase/util')
            ) {
              return 'firebase-core';
            }
            if (
              normalizedId.includes('node_modules/firebase/') ||
              normalizedId.includes('node_modules/@firebase/')
            ) {
              return 'firebase-misc';
            }
            if (
              normalizedId.includes('node_modules/react/') ||
              normalizedId.includes('node_modules/react-dom/') ||
              normalizedId.includes('node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (normalizedId.includes('node_modules/recharts/') || normalizedId.includes('node_modules/d3-')) {
              return 'charts';
            }
            if (normalizedId.includes('node_modules/leaflet/')) {
              return 'leaflet';
            }
            if (normalizedId.includes('node_modules/lucide-react/')) {
              return 'icons';
            }
            if (normalizedId.includes('node_modules/')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
