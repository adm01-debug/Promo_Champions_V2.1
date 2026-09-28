import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const hasSupabaseCredentials = Boolean(
  process.env.VITE_SUPABASE_URL &&
  (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
);

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Testes unitários que importam o cliente exigem valores não secretos. Quando
    // credenciais reais forem fornecidas, elas prevalecem para os testes de integração.
    env: hasSupabaseCredentials
      ? {}
      : {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
          VITE_SUPABASE_TEST_MODE: 'true',
        },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e', 'tests/load'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      // vitest v5 changed the default: all files in `include` are now counted
      // even if not imported by any test, which collapses coverage % on large
      // codebases. `all: false` restores the v1 behaviour (only imported files).
      all: false,
      // Etapa 31 do plano de 50 etapas: a whitelist anterior (16 arquivos) media
      // ~99% sobre <1% do código e circulava como se fosse a cobertura do sistema.
      // Agora o escopo é todo src/ com exclusões justificadas (gerado, wrappers
      // side-effectful cobertos por E2E, primitivas shadcn sem lógica própria).
      // O número real é medido pelo job `coverage` do CI (etapa 32) e vive em
      // coverage-baseline.json — o threshold abaixo é só o piso absoluto.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/test/**',
        'src/integrations/supabase/types.ts',
        // shadcn/ui: primitivas geradas, sem lógica de negócio própria.
        'src/components/ui/**',
        // Exporters/PDF/Excel: side-effectful, dependem de jsPDF/xlsx/DOM real,
        // testados via E2E (Playwright), não por unit test isolado.
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
      ],
      // Medido em 2026-09-28 com vitest v5 (all: false): lines 3.59%, branches 3.07%,
      // functions 2.65%, statements 3.53%. Vitest v5 instrumenta branches de forma
      // diferente do v1 (33.43%/10.41%) — a cobertura real não caiu, o instrumento
      // mudou. Sobe via etapa 32 (ratchet no CI) — nunca cai.
      thresholds: {
        lines: 2.5,
        branches: 2.5,
        functions: 2.0,
        statements: 2.5,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
