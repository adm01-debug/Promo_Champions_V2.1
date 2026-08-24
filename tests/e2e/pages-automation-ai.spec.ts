/**
 * E2E — Automation & AI: AutomationBuilder, AutomacaoInteligente, Cadencias,
 * Assistente (Chat), AIAgents, BulkComposer, EmailTracking
 *
 * Run with: npx playwright test tests/e2e/pages-automation-ai.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Automation Builder ───────────────────────────────────────────────────────

test.describe('Automation Builder', () => {
  test('carrega heading "Automation Builder"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/workflow-builder');

    await expect(
      page.getByRole('heading', { name: /Automation Builder/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/workflow-builder');
    await expect(page).toHaveTitle(/Workflow Builder.*Promo Champions/i);
  });

  test('mostra botão Novo Workflow', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/workflow-builder');
    await expect(page.getByRole('button', { name: /Novo Workflow/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Automação Inteligente Hub ────────────────────────────────────────────────

test.describe('Automação Inteligente Hub', () => {
  test('carrega página sem crash', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/automacao-inteligente');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Cadências ───────────────────────────────────────────────────────────────

test.describe('Cadências — Gestão de Cadências', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/cadencias');

    await expect(
      page.getByRole('heading', { name: /Cadências/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/cadencias');
    await expect(page).toHaveTitle(/Cadências.*Promo Champions/i);
  });

  test('mostra tabs de monitoramento', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/cadencias');
    await expect(page.getByRole('tab', { name: /Monitoramento/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Quote Cadências ─────────────────────────────────────────────────────────

test.describe('Cadências de Orçamentos', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/cadencias-orcamentos');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Assistente IA ───────────────────────────────────────────────────────────

test.describe('Assistente IA', () => {
  test('carrega heading "Assistente de Vendas"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/assistente');

    await expect(
      page.getByRole('heading', { name: /Assistente/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/assistente');
    await expect(page).toHaveTitle(/Assistente IA.*Promo Champions/i);
  });
});

// ─── Meu Assistente ─────────────────────────────────────────────────────────

test.describe('Meu Assistente', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/meu-assistente');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── AI Agents ───────────────────────────────────────────────────────────────

test.describe('AI Agents', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/agentes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Bulk Composer ───────────────────────────────────────────────────────────

test.describe('Bulk Composer', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/engagement/bulk-composer');

    await expect(
      page.getByRole('heading', { name: /Composer|Bulk/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/engagement/bulk-composer');
    await expect(page).toHaveTitle(/Composer.*Promo Champions/i);
  });
});

// ─── Email Tracking ──────────────────────────────────────────────────────────

test.describe('Email Tracking', () => {
  test('carrega página sem crash', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/email-tracking');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Sequences ───────────────────────────────────────────────────────────────

test.describe('Sequences', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/sequences');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
