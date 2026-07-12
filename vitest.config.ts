import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e', 'tests/load'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Escopo: código puro auditável (lib/utils/services/*Helpers).
      // Componentes React de página são cobertos pela suite E2E (Playwright),
      // não faz sentido dobrar esforço aqui.
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        'src/components/**/*Helpers.ts',
        'src/components/**/*helpers.ts',
        'src/hooks/**/*Helpers.ts',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/test/',
        'src/integrations/supabase/types.ts',
        // Exporters/PDF wrappers dependem de jsPDF/xlsx (side-effectful, testados via E2E).
        'src/lib/pdfExporter.ts',
        'src/lib/quotePdfExporter.ts',
        'src/lib/salesReportPdf.ts',
        'src/lib/excelExporter.ts',
        'src/lib/generateMonthlyReport.ts',
        'src/lib/quoteCadenceExport.ts',
        'src/lib/analytics.ts',
        'src/lib/errorTracking.ts',
        'src/lib/haptics.ts',
        'src/lib/webVitals.ts',
        'src/lib/swUpdater.ts',
        'src/lib/staleAssetRecovery.ts',
      ],
      thresholds: {
        lines: 85,
        branches: 75,
        functions: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
