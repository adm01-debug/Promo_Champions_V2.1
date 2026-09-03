import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      filename: 'pwa-sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{css,html,ico,png,svg,woff2}'],
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
    // Onda O — bundle-size budget: gera bundle-stats/stats.html + stats.json
    // FORA de dist/ para não estourar o precache do vite-plugin-pwa.
    process.env.ANALYZE_BUNDLE === '1' && visualizer({
      filename: 'bundle-stats/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      sourcemap: false,
      emitFile: false,
    }),
    process.env.ANALYZE_BUNDLE === '1' && visualizer({
      filename: 'bundle-stats/stats.json',
      template: 'raw-data',
      gzipSize: true,
      brotliSize: true,
      sourcemap: false,
      emitFile: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // zustand@4.5.7 exports map declares .mjs files (import condition) but ships
      // only .js files — Rollup fails to resolve during production build. Point all
      // sub-path imports at the actual ESM files that exist on disk.
      'zustand/traditional': resolve(__dirname, 'node_modules/zustand/esm/traditional.js'),
      'zustand/shallow': resolve(__dirname, 'node_modules/zustand/esm/shallow.js'),
      'zustand/vanilla': resolve(__dirname, 'node_modules/zustand/esm/vanilla.js'),
      'zustand/middleware': resolve(__dirname, 'node_modules/zustand/esm/middleware.js'),
      'zustand/middleware/immer': resolve(__dirname, 'node_modules/zustand/esm/middleware/immer.js'),
      'zustand/vanilla/shallow': resolve(__dirname, 'node_modules/zustand/esm/vanilla/shallow.js'),
      'zustand/react/shallow': resolve(__dirname, 'node_modules/zustand/esm/react/shallow.js'),
      'zustand/context': resolve(__dirname, 'node_modules/zustand/esm/context.js'),
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
          // O preload-helper do Vite (módulo virtual, fora de node_modules) é
          // dependência estática do entry para todo import() dinâmico. Sem esta
          // regra o Rollup o alocava dentro de vendor-pdf, arrastando 591 KB de
          // jspdf para o caminho crítico por causa de uma função de ~20 linhas.
          if (id.startsWith('\0vite/') || id.includes('vite/preload-helper') || id.includes('vite/modulepreload-polyfill')) {
            return 'vendor';
          }
          if (!id.includes('node_modules')) return;
          // INVARIANTE: react/react-dom/scheduler/router, Radix e o catch-all
          // vivem TODOS no mesmo chunk eager 'vendor'. Um vendor-core separado
          // cria ciclo (Radix importa peers fora de @radix-ui — react-remove-scroll,
          // aria-hidden, @floating-ui — que caem no catch-all, e o catch-all
          // importa React); a ordem de avaliação do ciclo depende da ordem de
          // imports do entry e já quebrou o boot com tela branca/NO_FCP
          // (floating-ui lê React.useLayoutEffect em escopo de módulo antes do
          // chunk do React inicializar). Como o entry importa ambos de qualquer
          // forma, fundir não custa nada no caminho crítico.
          // Data layer — supabase-js pulls postgrest/gotrue/realtime/storage/functions as siblings
          if (id.includes('@tanstack/react-query') || id.includes('@supabase/')) {
            return 'vendor-data';
          }
          // Heavy & lazy-only libs — isolated so they only load on routes that import them
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) return 'vendor-pdf';
          if (id.includes('xlsx') || id.includes('exceljs')) return 'vendor-excel';
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
          if (id.includes('@xyflow') || id.includes('reactflow')) return 'vendor-flow';
          if (id.includes('@dnd-kit')) return 'vendor-dnd';
          if (id.includes('date-fns')) return 'vendor-date';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) return 'vendor-forms';
          // Subgrafo markdown COMPLETO num chunk só: vfile & cia. caíam no
          // fallback 'vendor' enquanto unist-util-* ia para vendor-markdown,
          // criando a aresta estática vendor → vendor-markdown que puxava o
          // chunk markdown para o preload do entry.
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-') || id.includes('micromark') || id.includes('mdast-') || id.includes('hast-') || id.includes('unified') || id.includes('unist-') || id.includes('/vfile') || id.includes('estree-util-') || id.includes('/bail/') || id.includes('/trough/') || id.includes('is-plain-obj') || id.includes('devlop') || id.includes('decode-named-character-reference') || id.includes('character-entities') || id.includes('property-information') || id.includes('space-separated-tokens') || id.includes('comma-separated-tokens') || id.includes('/zwitch/') || id.includes('longest-streak') || id.includes('/ccount/') || id.includes('markdown-table') || id.includes('trim-lines') || id.includes('html-url-attributes') || id.includes('style-to-js') || id.includes('style-to-object') || id.includes('inline-style-parser')) return 'vendor-markdown';
          if (id.includes('papaparse') || id.includes('fuse.js')) return 'vendor-data-utils';
          if (id.includes('canvas-confetti')) return 'vendor-confetti';
          if (id.includes('cmdk') || id.includes('embla-carousel') || id.includes('vaul') || id.includes('input-otp') || id.includes('react-day-picker') || id.includes('react-resizable-panels') || id.includes('react-window') || id.includes('react-intersection-observer')) return 'vendor-ui-extras';
          if (id.includes('sonner') || id.includes('next-themes') || id.includes('react-helmet-async')) return 'vendor-ui-utils';
          if (id.includes('@lovable.dev/cloud-auth-js') || id.includes('web-vitals')) return 'vendor-platform';
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
