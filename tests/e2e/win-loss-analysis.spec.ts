import { test, expect, type Page } from '@playwright/test';

/**
 * Suíte E2E — Win/Loss Analysis
 *
 * Cobre os fluxos principais da página dedicada `/analytics/win-loss`:
 *  1. Redirecionamento quando não autenticado.
 *  2. Renderização do header, KPIs e painéis laterais quando autenticado.
 *  3. Presença dos botões de ação (Exportar, Filtros).
 *  4. Acessibilidade básica (título, meta description, landmark headings).
 *
 * Estratégia: mocka a sessão Supabase no localStorage antes da navegação e
 * intercepta chamadas REST para retornar payloads controlados, evitando
 * dependência de dados reais.
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
  // 1. Intercepta o endpoint /auth/v1/user para responder como autenticado.
  await page.route('**/auth/v1/user*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION.user),
    })
  );

  // 2. Intercepta chamadas REST retornando datasets vazios — evita ruído
  //    de rede em CI e mantém o teste focado na UI/roteamento.
  await page.route('**/rest/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: JSON.stringify([]),
    })
  );

  // 3. Injeta a sessão no localStorage antes do primeiro render.
  await page.addInitScript((session) => {
    // Chave usada pelo supabase-js — cobre variações comuns.
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-')) ?? 'sb-auth-token';
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, MOCK_SESSION);
}

test.describe('Win/Loss Analysis — página dedicada', () => {
  test('redireciona usuário anônimo para /auth', async ({ page }) => {
    await page.route('**/auth/v1/user*', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthorized"}' })
    );

    await page.goto('/analytics/win-loss');
    await expect(page).toHaveURL(/\/auth/, { timeout: 10_000 });
  });

  test('renderiza header, título e ações principais quando autenticado', async ({ page }) => {
    await primeAuthentication(page);
    await page.goto('/analytics/win-loss');

    // Título da página (H1)
    await expect(page.getByRole('heading', { level: 1, name: /Win\/Loss Analysis/i })).toBeVisible({
      timeout: 15_000,
    });

    // Subtítulo descritivo
    await expect(page.getByText(/Inteligência competitiva/i)).toBeVisible();

    // Botões de ação no topo
    await expect(page.getByRole('button', { name: /Exportar Dados/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Filtros Avançados/i })).toBeVisible();
  });

  test('exibe painéis laterais de Estratégia e Projeção', async ({ page }) => {
    await primeAuthentication(page);
    await page.goto('/analytics/win-loss');

    await expect(page.getByText(/Estratégia de Defesa/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Projeção de Melhoria/i)).toBeVisible();
    await expect(page.getByText(/Destaque de Ganho/i)).toBeVisible();
    await expect(page.getByText(/Vulnerabilidade/i)).toBeVisible();
  });

  test('metadata SEO está presente (title + description)', async ({ page }) => {
    await primeAuthentication(page);
    await page.goto('/analytics/win-loss');

    await expect(page).toHaveTitle(/Win\/Loss Analysis/i);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/vitórias|perdas|drill-down/i);
  });
});
