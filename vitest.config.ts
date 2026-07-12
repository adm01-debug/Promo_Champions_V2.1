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
      // Escopo Tier-1: código puro crítico com cobertura enforced ≥85%.
      // Expandir esta lista à medida que novos módulos ganharem suites de teste.
      // Componentes React de página são cobertos por E2E (Playwright).
      include: [
        'src/lib/winloss/severityFromScore.ts',
        'src/lib/winloss/scenarioChartKey.ts',
        'src/lib/winloss/riskReasons.ts',
        'src/lib/mergeTags.ts',
        'src/lib/gamification.ts',
        'src/lib/orderTracking/stages.ts',
        'src/lib/utils.ts',
        'src/utils/dateHelpers.ts',
        'src/utils/fuzzing.ts',
        'src/lib/revenueForecast/forecastEngine.ts',
        'src/lib/revenueForecast/csvExport.ts',
        'src/lib/auth/passwordErrorMessages.ts',
        'src/components/reporting/funnelReportHelpers.ts',
        'src/hooks/reports/salesReportHelpers.ts',
        'src/services/salesService.ts',
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
