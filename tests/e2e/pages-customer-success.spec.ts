/**
 * E2E — Customer Success & Operations: CustomerSuccessHub, NPSDashboard,
 * MetasAtividades, Atividades, FollowUpInteligente, Competencias,
 * Calendario, Vendedores, Times, Territorios, Fornecedores, ComparadorPrecos
 *
 * Run with: npx playwright test tests/e2e/pages-customer-success.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Customer Success Hub ────────────────────────────────────────────────────

test.describe('Customer Success Hub', () => {
  test('carrega página sem crash', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/customer-success');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/customer-success');
    await expect(page).toHaveTitle(/Customer Success.*Promo Champions/i);
  });
});

// ─── NPS & Satisfação ───────────────────────────────────────────────────────

test.describe('NPS & Satisfação', () => {
  test('carrega heading "NPS & Satisfação"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/nps');

    await expect(
      page.getByRole('heading', { name: /NPS/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/nps');
    await expect(page).toHaveTitle(/NPS.*Promo Champions/i);
  });

  test('mostra gauge de NPS e stat cards', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/nps');
    // NPS score card + promotores/detratores stats
    await expect(page.locator('text=/Promotores|Detratores|NPS/i').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Customer Success 360 ────────────────────────────────────────────────────

test.describe('Customer Success 360', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/customer-success-360');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Metas & Atividades (Arena de Atividades) ────────────────────────────────

test.describe('Arena de Atividades (MetasAtividades)', () => {
  test('carrega heading "Arena de Atividades"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/metas-atividades');

    await expect(
      page.getByRole('heading', { name: /Arena de Atividades/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/metas-atividades');
    await expect(page).toHaveTitle(/Metas de Atividades.*Promo Champions/i);
  });

  test('mostra tabs de progresso e ranking', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/metas-atividades');
    await expect(page.getByRole('tab', { name: /Progresso|Ranking/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Atividades (SDR & Prospecção) ──────────────────────────────────────────

test.describe('Atividades — SDR & Prospecção', () => {
  test('carrega heading "SDR & Prospecção"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/atividades');

    await expect(
      page.getByRole('heading', { name: /SDR|Prospecção|Atividades/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/atividades');
    await expect(page).toHaveTitle(/Atividades.*Promo Champions/i);
  });

  test('mostra tabs de visão geral e ranking', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/atividades');
    await expect(page.getByRole('tab', { name: /Visão Geral|Ranking/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Follow-Up Inteligente ───────────────────────────────────────────────────

test.describe('Follow-Up Inteligente', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/follow-up');

    await expect(
      page.getByRole('heading', { name: /Follow/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/follow-up');
    await expect(page).toHaveTitle(/Follow.*PROMO CHAMPIONS/i);
  });
});

// ─── Mapa de Competências ────────────────────────────────────────────────────

test.describe('Mapa de Competências', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/competencias');

    await expect(
      page.getByRole('heading', { name: /Competências/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/competencias');
    await expect(page).toHaveTitle(/Competências/i);
  });
});

// ─── Calendário ─────────────────────────────────────────────────────────────

test.describe('Calendário', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/calendario');
    // Calendario.tsx não tem h1 — verifica título e container do calendário
    await expect(page).toHaveTitle(/Calendário.*PROMO CHAMPIONS/i);
    await expect(page.locator('[class*="min-h-screen"]').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Vendedores ─────────────────────────────────────────────────────────────

test.describe('Vendedores', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/vendedores');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Metas ───────────────────────────────────────────────────────────────────

test.describe('Metas', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/metas');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Territórios ─────────────────────────────────────────────────────────────

test.describe('Territórios', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/territorios');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
