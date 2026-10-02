/**
 * E2E — Rotas críticas sem cobertura prévia (pacote E2E-COVER)
 *
 * Smoke das rotas de maior tráfego que os specs pages-* ainda não tocavam:
 * dashboards por papel (SDR/Closer), catálogo, notificações, automações,
 * multicanal, analytics e comparador de preços (cotações).
 *
 * Run with: npx playwright test tests/e2e/pages-critical-routes.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Dashboards por papel ────────────────────────────────────────────────────

test.describe('Dashboard SDR', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/sdr');
    await expect(
      page.getByRole('heading', { name: /Dashboard SDR/i, level: 1 })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/sdr');
    await expect(page).toHaveTitle(/Dashboard SDR.*Promo Champions/i);
  });
});

test.describe('Dashboard Closer', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/closer');
    await expect(
      page.getByRole('heading', { name: /Dashboard Closer/i, level: 1 })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/closer');
    await expect(page).toHaveTitle(/Dashboard Closer.*Promo Champions/i);
  });
});

// ─── Catálogo e vendas ───────────────────────────────────────────────────────

test.describe('Produtos — catálogo', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/produtos');
    await expect(page.getByRole('heading', { name: /Produtos/i, level: 1 })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/produtos');
    await expect(page).toHaveTitle(/Produtos.*Promo Champions/i);
  });
});

test.describe('Comparador de Preços — cotações', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/comparador-precos');
    await expect(
      page.getByRole('heading', { name: /Comparador de Preços/i, level: 1 })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/comparador-precos');
    await expect(page).toHaveTitle(/Comparador de Preços.*PROMO CHAMPIONS/i);
  });
});

// ─── Comunicação ─────────────────────────────────────────────────────────────

test.describe('Notificações', () => {
  test('carrega a central', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/notificacoes');
    await expect(page.locator('main, [role="main"]')).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe('Multichannel', () => {
  test('carrega dashboard e title correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/multichannel');
    await expect(page).toHaveTitle(/Multichannel.*Promo Champions/i);
    await expect(page.locator('main, [role="main"]')).toBeVisible({
      timeout: 20_000,
    });
  });
});

// ─── Automação e BI ──────────────────────────────────────────────────────────

test.describe('Automações — Workflow Builder', () => {
  test('carrega builder e title correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/automacoes');
    await expect(page).toHaveTitle(/Automações Visuais.*PROMO CHAMPIONS/i);
    await expect(page.locator('main, [role="main"]')).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe('Analytics — visão geral', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/analytics');
    await expect(
      page.getByRole('heading', { name: /Analytics de Vendas/i, level: 1 })
    ).toBeVisible({ timeout: 20_000 });
  });
});
