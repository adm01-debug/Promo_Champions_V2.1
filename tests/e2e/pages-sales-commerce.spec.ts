/**
 * E2E — Sales & Commerce: Orcamentos (CPQ), Comissoes, Estoque (Logistics)
 *
 * Run with: npx playwright test tests/e2e/pages-sales-commerce.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Orçamentos (CPQ) ────────────────────────────────────────────────────────

test.describe('Orçamentos — CPQ Engine', () => {
  test('carrega heading "Quote-to-Cash"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/orcamentos');

    await expect(
      page.getByRole('heading', { name: /Quote-to-Cash|Orçamentos/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/orcamentos');
    await expect(page).toHaveTitle(/CPQ|Orçamentos.*Promo Champions/i);
  });

  test('mostra filtros de status', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/orcamentos');
    // CPQ has status filter buttons (Todos, Enviados, Aprovados, Expirando, etc.)
    await expect(page.getByRole('button', { name: /Todos/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Comissões ────────────────────────────────────────────────────────────────

test.describe('Comissões', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/comissoes');

    await expect(page.getByRole('heading', { name: /Comissões/i, level: 1 })).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Logistics Command (Estoque) ─────────────────────────────────────────────

test.describe('Logistics Command (Estoque)', () => {
  test('carrega heading "Logistics Command"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/estoque');

    await expect(
      page.getByRole('heading', { name: /Logistics Command|Estoque/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/estoque');
    await expect(page).toHaveTitle(/Estoque.*Promo Champions/i);
  });

  test('mostra tabs de equipamentos e log', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/estoque');

    await expect(page.getByRole('tab', { name: /Equipment|Equipamentos/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('tab', { name: /Tactical Log|Log/i })).toBeVisible();
  });

  test('mostra cards de stats globais', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/estoque');
    // Global Stock / Critical Units / Low Supply / Recent Intake cards
    await expect(page.locator('text=/Stock|Critical|Low|Intake/i').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Fornecedores ────────────────────────────────────────────────────────────

test.describe('Fornecedores', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/fornecedores');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
