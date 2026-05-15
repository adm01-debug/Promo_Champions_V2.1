import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    port: 8080,
    host: "::",
    // Clear cache on server start to avoid React version conflicts
    force: mode === "development",
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192x192.png', 'icons/icon-512x512.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: "PROMO CHAMPIONS",
        short_name: 'PromoChampions',
        description: 'Plataforma Inteligente de Gestão de Vendas',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#7c3aed',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Dedupe ALL React-related packages to prevent multiple instances
    dedupe: [
      "react", 
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@tanstack/react-query",
      "framer-motion",
      "react-router-dom",
      "react-hook-form",
      "next-themes",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
    // Force re-bundling of deps when needed
    force: mode === "development",
  },
  build: {
    target: "esnext",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: mode === "development",
    cssCodeSplit: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          'ui-framework': [
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            'lucide-react',
          ],
          'data-viz': ['recharts', 'date-fns'],
          'backend-core': ['@supabase/supabase-js', '@tanstack/react-query'],
          'utilities': ['zod', 'react-hook-form', 'clsx', 'tailwind-merge'],
          'heavy-libs': ['jspdf', 'jspdf-autotable', 'exceljs', 'papaparse', 'canvas-confetti'],
        },
      },
    },
  },
  // Test configuration removed - see Issue #25 to recreate tests
}));
