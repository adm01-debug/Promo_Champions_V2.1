import { defineConfig, devices } from '@playwright/test';

// Identificador único por execução — todos os artefatos (trace/vídeo/screenshot,
// HAR, console.log, network-errors.log) dos testes quote-to-sale são
// agrupados sob esta pasta para facilitar correlação entre retries.
const RUN_ID =
  process.env.PW_RUN_ID ??
  `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
process.env.PW_RUN_ID = RUN_ID;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    // Empacota automaticamente os artefatos do RUN_ID quando qualquer spec
    // do projeto quote-to-sale falha definitivamente (após retries).
    ['./tests/e2e/helpers/quote-to-sale-failure-reporter.ts'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Projeto dedicado à conversão quote→sale.
    //   - retries: 2
    //   - trace: 'on-first-retry' captura trace na 1ª retentativa e o mantém
    //     apenas quando o teste falha definitivamente (Playwright já descarta
    //     traces de retries que acabam passando).
    //   - vídeo e screenshot retidos só em falha.
    //   - outputDir carimbado com RUN_ID para agrupar todos os artefatos
    //     (trace/vídeo/screenshot/HAR/console/network) da mesma execução.
    //   - HAR + console + network errors são capturados via fixtures
    //     em tests/e2e/helpers/quote-to-sale-fixtures.ts.
    {
      name: 'quote-to-sale',
      testMatch: /quote-to-sale.*\.spec\.ts/,
      retries: 2,
      outputDir: `./test-results/quote-to-sale/${RUN_ID}`,
      use: {
        ...devices['Desktop Chrome'],
        trace: 'on-first-retry',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /quote-to-sale.*\.spec\.ts/,
    },
    {
      // Page-level smoke tests — all pages must load with correct title/heading
      name: 'page-smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /pages-.*\.spec\.ts/,
    },
    { name: 'mobile-ios-safari', use: { ...devices['iPhone 14'] }, testMatch: /mobile-auth-smoke\.spec\.ts/ },
    { name: 'mobile-android-chrome', use: { ...devices['Pixel 7'] }, testMatch: /mobile-auth-smoke\.spec\.ts/ },
  ],
  webServer: process.env.CI
    ? {
        command: 'npm run build && npm run preview -- --port 5173',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});


