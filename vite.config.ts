import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    port: 8080,
    host: "::",
    force: mode === "development",
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: { 
                maxEntries: 100, 
                maxAgeSeconds: 86400 // 24 hours
              },
            },
          },
        ],
      },
      manifest: {
        name: "Circuito de Vencedores",
        short_name: 'Circuito',
        description: 'Plataforma Inteligente de Gestão de Vendas e Performance Comercial 10/10.',
        start_url: '/',
        display: 'standalone',
        background_color: '#05060f',
        theme_color: '#0ea5e9',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react", "react-dom", "react-router-dom", "framer-motion", "@tanstack/react-query"
    ],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion')) {
              return 'vendor-core';
            }
            if (id.includes('lucide-react') || id.includes('radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('supabase') || id.includes('tanstack')) {
              return 'vendor-data';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));
