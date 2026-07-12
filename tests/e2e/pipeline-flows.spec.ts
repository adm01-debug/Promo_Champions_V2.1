import { test, expect } from '@playwright/test';
import { HAS_AUTH, SESSION_JSON, STORAGE_KEY, skipReason } from './helpers/auth';

/**
 * E2E — Pipeline (Kanban) flows
 *
 * Cobre gap de cobertura E2E do módulo /pipeline. Auth e quote-sync já possuem
 * cobertura dedicada em `auth-navigation.spec.ts` / `quote-to-sale-*.spec.ts`.
 *
 * Cenários:
 *  1. Rota protegida: usuário anônimo é redirecionado para /auth
 *  2. Usuário autenticado carrega o board com heading correto
 *  3. Painel lateral (Risco/SLA/Inativos) alterna visibilidade
 *  4. Meta tags de SEO presentes (Helmet)
 */

test.describe('Pipeline — fluxos críticos', () => {
  test('redireciona anônimo de /pipeline para /auth', async ({ page, context }) => {
    // Garante estado anônimo: limpa storage antes de navegar
    await context.clearCookies();
    await page.goto('/pipeline');
    await expect(page).toHaveURL(/.*auth/, { timeout: 10_000 });
  });

  test('carrega board com heading e descrição', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());

    // Restaura sessão Supabase no localStorage
    await page.goto('/');
    await page.evaluate(
      ([k, v]) => window.localStorage.setItem(k, v),
      [STORAGE_KEY, SESSION_JSON],
    );

    await page.goto('/pipeline');

    // Heading principal
    await expect(
      page.getByRole('heading', { name: /Pipeline de Vendas/i, level: 1 }),
    ).toBeVisible({ timeout: 15_000 });

    // Instrução de UX (arrastar deals)
    await expect(page.getByText(/Arraste os deals entre as colunas/i)).toBeVisible();

    // Title tag via Helmet
    await expect(page).toHaveTitle(/Pipeline \| Promo Champions/i);
  });

  test('painel lateral de risco alterna visibilidade', async ({ page, viewport }) => {
    test.skip(!HAS_AUTH, skipReason());
    // Painel só é renderizado em breakpoint xl (>= 1280px)
    test.skip((viewport?.width ?? 0) < 1280, 'Painel lateral apenas em desktop xl+');

    await page.goto('/');
    await page.evaluate(
      ([k, v]) => window.localStorage.setItem(k, v),
      [STORAGE_KEY, SESSION_JSON],
    );
    await page.goto('/pipeline');

    const toggle = page.getByRole('button', { name: /Recolher painel lateral/i });
    await expect(toggle).toBeVisible({ timeout: 15_000 });

    // Estado inicial aberto → tabs visíveis
    await expect(page.getByRole('tab', { name: /Risco/i })).toBeVisible();

    // Recolher
    await toggle.click();
    await expect(
      page.getByRole('button', { name: /Expandir painel lateral/i }),
    ).toBeVisible();

    // Expandir novamente
    await page.getByRole('button', { name: /Expandir painel lateral/i }).click();
    await expect(page.getByRole('tab', { name: /Risco/i })).toBeVisible();
  });

  test('tabs do painel alternam entre Risco/SLA/Inativos', async ({ page, viewport }) => {
    test.skip(!HAS_AUTH, skipReason());
    test.skip((viewport?.width ?? 0) < 1280, 'Tabs apenas em desktop xl+');

    await page.goto('/');
    await page.evaluate(
      ([k, v]) => window.localStorage.setItem(k, v),
      [STORAGE_KEY, SESSION_JSON],
    );
    await page.goto('/pipeline');

    const slaTab = page.getByRole('tab', { name: /SLA/i });
    await expect(slaTab).toBeVisible({ timeout: 15_000 });

    await slaTab.click();
    await expect(slaTab).toHaveAttribute('aria-selected', 'true');

    const inactiveTab = page.getByRole('tab', { name: /Inativos/i });
    await inactiveTab.click();
    await expect(inactiveTab).toHaveAttribute('aria-selected', 'true');
  });
});
