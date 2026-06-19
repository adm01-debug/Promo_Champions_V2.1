import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
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

