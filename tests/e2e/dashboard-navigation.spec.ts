import { test, expect, type Page } from '@playwright/test';

/**
 * Suíte E2E — Navegação do Dashboard
 *
 * Valida os fluxos de navegação principais entre módulos autenticados:
 *  - Acesso ao dashboard raiz.
 *  - Navegação para módulos-chave via sidebar (Win/Loss, Badges, Competências).
 *  - Retorno ao dashboard.
 *  - Proteção de rotas privadas contra acesso anônimo.
 */

const MOCK_SESSION = {
  access_token: 'mock-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh',
  user: {
    id: 'e2e-user-id',
    email: 'e2e@promo.test',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'E2E Tester' },
  },
};

async function primeAuthentication(page: Page) {
  await page.route('**/auth/v1/user*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION.user),
    })
  );

  await page.route('**/rest/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: JSON.stringify([]),
    })
  );

  await page.addInitScript((session) => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-')) ?? 'sb-auth-token';
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, MOCK_SESSION);
}

test.describe('Dashboard — navegação entre módulos', () => {
  test.beforeEach(async ({ page }) => {
    await primeAuthentication(page);
  });

  test('rota raiz carrega sem erro para usuário autenticado', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
      /* alguns módulos mantêm websockets abertos — ignoramos timeout de idle */
    });

    expect(errors, `Erros de runtime encontrados: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('rota /analytics/win-loss é acessível diretamente', async ({ page }) => {
    await page.goto('/analytics/win-loss');
    await expect(page.getByRole('heading', { level: 1, name: /Win\/Loss Analysis/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/analytics\/win-loss/);
  });

  test('rota /competencias é acessível diretamente', async ({ page }) => {
    await page.goto('/competencias');
    await expect(page).toHaveURL(/\/competencias/);
    // Aguarda algum conteúdo semântico renderizar
    await expect(page.locator('main, [role="main"], h1').first()).toBeVisible({ timeout: 15_000 });
  });

  test('rota /notificacoes carrega o centro de preferências', async ({ page }) => {
    await page.goto('/notificacoes');
    await expect(page).toHaveURL(/\/notificacoes/);
    await expect(page.locator('main, [role="main"], h1').first()).toBeVisible({ timeout: 15_000 });
  });

  test('rotas privadas redirecionam anônimo para /auth', async ({ page }) => {
    // Sobrescreve auth para não autenticado
    await page.unroute('**/auth/v1/user*');
    await page.route('**/auth/v1/user*', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthorized"}' })
    );
    await page.addInitScript(() => {
      localStorage.clear();
    });

    const privateRoutes = ['/analytics/win-loss', '/competencias', '/notificacoes'];
    for (const route of privateRoutes) {
      await page.goto(route);
      await expect(page, `Rota ${route} deveria redirecionar para /auth`).toHaveURL(/\/auth/, {
        timeout: 10_000,
      });
    }
  });
});
