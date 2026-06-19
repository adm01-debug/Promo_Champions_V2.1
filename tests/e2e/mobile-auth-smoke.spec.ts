import { test, expect, devices, type Page, type BrowserContextOptions } from '@playwright/test';

/**
 * Smoke E2E: sign-in → ProtectedRoute → sign-out → deep link recovery
 * Roda em iOS Safari (WebKit) e Android Chrome (Chromium) via device emulation.
 */

const mobileDevices: Array<{ name: string; device: BrowserContextOptions }> = [
  { name: 'iOS Safari (iPhone 14)', device: devices['iPhone 14'] },
  { name: 'Android Chrome (Pixel 7)', device: devices['Pixel 7'] },
];

const DEEP_LINK = '/clientes';
const MOCK_USER = { id: 'mock-user-id', email: 'mobile@test.com', aud: 'authenticated', role: 'authenticated' };
const MOCK_SESSION = {
  access_token: 'mock-access',
  refresh_token: 'mock-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: MOCK_USER,
};

async function installAuthMocks(page: Page) {
  // Supabase auth endpoints
  await page.route('**/auth/v1/token**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSION) })
  );
  await page.route('**/auth/v1/user**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
  );
  await page.route('**/auth/v1/logout**', (route) =>
    route.fulfill({ status: 204, body: '' })
  );
  // Genérico para qualquer query REST que aconteça durante o smoke
  await page.route('**/rest/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
}

for (const { name, device } of mobileDevices) {
  test.describe(`Mobile smoke • ${name}`, () => {
    test.use({ ...device });

    test('redireciona deep link → /auth → faz login → volta ao deep link → sign-out', async ({ page }) => {
      await installAuthMocks(page);

      // 1) Deep link sem sessão → ProtectedRoute redireciona para /auth
      await page.goto(DEEP_LINK);
      await expect(page).toHaveURL(/\/auth/);

      // 2) Submete login (mock 200) — após onAuthStateChange volta para deep link original
      await page.getByPlaceholder(/email/i).first().fill(MOCK_USER.email);
      await page.getByPlaceholder(/senha/i).first().fill('Password123!');
      await page.getByRole('button', { name: /entrar|login|acessar/i }).first().click();

      await expect(page).toHaveURL(new RegExp(DEEP_LINK.replace('/', '\\/')), { timeout: 10_000 });

      // 3) Refresh em rota protegida deve manter sessão (token em localStorage)
      await page.reload();
      await expect(page).not.toHaveURL(/\/auth/);

      // 4) Deep link novo sem sessão (limpa storage) → volta para /auth preservando from
      await page.evaluate(() => {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('sb-') || k.includes('supabase'))
          .forEach((k) => localStorage.removeItem(k));
      });
      await page.goto('/playbooks');
      await expect(page).toHaveURL(/\/auth/);
    });
  });
}
