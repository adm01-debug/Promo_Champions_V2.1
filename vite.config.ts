import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: 'Promo Champions',
        short_name: 'PromoChamp',
        description: 'Sales Performance Platform',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
  esbuild: {
    // Strip console.log/debug in production; keep error/warn (forwarded to errorTracking).
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          // Core framework — match react/react-dom/scheduler/router anywhere in the dep tree
          // so nested copies don't end up in another chunk and break React.forwardRef resolution.
          if (/[\\/]node_modules[\\/](?:\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?(react|react-dom|scheduler|react-router|react-router-dom|use-sync-external-store)[\\/]/.test(id)) {
            return 'vendor-core';
          }
          // Radix depends tightly on React — keep in the same chunk to guarantee load order.
          if (id.includes('@radix-ui/')) return 'vendor-core';
          // Data layer
          if (id.includes('@tanstack/react-query') || id.includes('@supabase/supabase-js')) {
            return 'vendor-data';
          }
          // Heavy & lazy-only libs — isolated so they only load on routes that import them
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          if (id.includes('xlsx') || id.includes('exceljs')) return 'vendor-excel';
          if (id.includes('leaflet')) return 'vendor-maps';
          if (id.includes('@dnd-kit')) return 'vendor-dnd';
          if (id.includes('date-fns')) return 'vendor-date';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('zod') || id.includes('react-hook-form')) return 'vendor-forms';
          return 'vendor';
        },
      },
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});
