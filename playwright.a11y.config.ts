import { defineConfig } from '@playwright/test';

/**
 * Onda Q — config isolada para o sweep de acessibilidade.
 * Não interfere com playwright.config.ts (E2E funcional).
 *
 * Uso local:
 *   npm run build && npm run preview -- --port 5173 &
 *   npm run a11y:sweep
 *
 * Uso CI: ver .github/workflows/qa-exhaustive.yml (step "A11y sweep").
 */
export default defineConfig({
  testDir: './tests/a11y',
  testMatch: /axe-sweep\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'a11y-report.json' }],
    ['html', { open: 'never', outputFolder: 'a11y-report-html' }],
  ],
  use: {
    baseURL: process.env.A11Y_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
});
