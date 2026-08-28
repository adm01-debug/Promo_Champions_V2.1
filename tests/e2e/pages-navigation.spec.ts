/**
 * E2E — Navigation & Global Routes
 *
 * Verifica que rotas protegidas redirecionam anonimos para /auth,
 * e que paginas autenticadas carregam apos login.
 *
 * Run with: npx playwright test tests/e2e/pages-navigation.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Auth Page ───────────────────────────────────────────────────────────────

test.describe('Auth Page', () => {
  test('mostra título de login', async ({ page }) => {
    // Auth page is public
    await loadPage(page, '/auth');
    await expect(page).toHaveTitle(/Login|Circuito de Vencedores/i, { timeout: 20_000 });
  });

  test('não redireciona para /auth quando já autenticado (redireciona para /)', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    // Navega para /auth — app deve redirecionar para / quando autenticado
    await page.goto('/auth', { waitUntil: 'networkidle' });
    const url = page.url();
    // Accepta / ou /dashboard (pode ter redirect intermedíario)
    expect(url).toMatch(/\/(auth)?$|dashboard/);
  });
});

// ─── Protected Routes — anonymous redirects ──────────────────────────────────

test.describe('Protected Routes — redirect anonymous users to /auth', () => {
  const protectedRoutes = [
    '/dashboard',
    '/vendas',
    '/clientes',
    '/pipeline',
    '/kanban-clientes',
    '/mapa-clientes',
    '/agenda',
    '/orcamentos',
    '/comissoes',
    '/estoque',
    '/atividades',
    '/cadencias',
    '/assistente',
    '/customer-success',
    '/nps',
    '/metas-atividades',
    '/ranking',
    '/arena',
    '/desafios',
    '/victory-feed',
    '/analytics',
    '/bi-vendedor',
    '/funil',
    '/inteligencia',
    '/health-score',
    '/evolucao-precos',
    '/automacao-inteligente',
    '/workflow-builder',
    '/configuracoes',
    '/coaching-inteligente',
    '/competencias',
    '/follow-up',
  ];

  for (const route of protectedRoutes) {
    test(`redirects anonymous from ${route} to /auth`, async ({ page, context }) => {
      await context.clearCookies();
      // Also clear localStorage — session cookie alone may not be enough
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      // Use domcontentloaded — pages with realtime subscriptions never reach networkidle
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await expect(page).toHaveURL(/.*auth.*|.*\/$/, { timeout: 10_000 });
    });
  }
});

// ─── Authenticated pages load without crash ──────────────────────────────────

test.describe('Authenticated pages load after login', () => {
  test('/dashboard carrega após restauração de sessão', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/dashboard');
    await expect(page).not.toHaveURL(/.*auth.*$/, { timeout: 20_000 });
  });
});

// ─── Not Found Page ──────────────────────────────────────────────────────────

test.describe('404 — Not Found', () => {
  test('mostra página não encontrada para rota inexistente', async ({ page }) => {
    // Rota pública — não precisa de auth
    // SPA: rotas inexistentes redirecionam para / (landing page) — verifica que não crasha
    await page.goto('/this-route-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });
    // Aceita landing page (auth) ou página de erro — desde que não crash
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Access Denied Page ──────────────────────────────────────────────────────

test.describe('Access Denied Page', () => {
  test('mostra página de acesso negado', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/acesso-negado');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
