/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";
import { componentTagger } from "lovable-tagger";

const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    port: 8080,
    host: "::",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // Force a single React instance across the entire bundle.
      // This prevents "Cannot read properties of null (reading 'useRef'/'useContext')" errors.
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
      "react-dom/client": require.resolve("react-dom/client"),
      "react/jsx-runtime": require.resolve("react/jsx-runtime"),
      "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@radix-ui/react-tooltip"],
  },
  build: {
    // Optimized for Lovable deployment
    target: "esnext",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: mode === "development",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
}));

