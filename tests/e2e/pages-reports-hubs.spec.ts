/**
 * E2E — Reports, Hubs & Special Pages
 *
 * Run with: npx playwright test tests/e2e/pages-reports-hubs.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Dashboard (main) ────────────────────────────────────────────────────────

test.describe('Dashboard — Visão Geral', () => {
  test('carrega sem crash', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/dashboard');
    // Index.tsx delega título ao Helmet — verifica apenas título
    await expect(page).toHaveTitle(/PROMO CHAMPIONS|Promo Champions/i, { timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/dashboard');
    await expect(page).toHaveTitle(/PROMO CHAMPIONS|Promo Champions/i, { timeout: 20_000 });
  });
});

// ─── Relatórios ──────────────────────────────────────────────────────────────

test.describe('Relatórios', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatório de Atividades', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorio-atividades');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatórios Executivos', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios-executivos');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatórios Agendados', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios-agendados');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatórios Custom', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios-custom');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatório de Funil', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios/funil');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Relatório Cohort', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/relatorios/cohort');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Hubs ────────────────────────────────────────────────────────────────────

test.describe('Sales Enablement Hub', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/sales-enablement');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Pricing Intelligence Hub', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/pricing-intelligence');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Territory Optimization Hub', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/territory-optimization');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Revenue / Forecast ───────────────────────────────────────────────────────

test.describe('Revenue Intelligence', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/revenue-intelligence');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Revenue Forecast', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/revenue-forecast');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Revenue Forecast V2', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/revenue-forecast-v2');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Forecast Ponderado', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/forecast');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Previsão de Demanda', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/previsao-demanda');
    // PrevisaoDemanda.tsx não tem h1 no DOM — verifica título via Helmet
    await expect(page).toHaveTitle(/Previsão de Demanda.*PROMO CHAMPIONS/i, { timeout: 20_000 });
  });
});

test.describe('ROI Dashboard', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/roi');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Benchmarking ─────────────────────────────────────────────────────────────

test.describe('Benchmarking', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/benchmarking');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Métricas de Categoria', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/metricas-categoria');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── ICP, Lead Scoring, ABM ──────────────────────────────────────────────────

test.describe('ICP (Ideal Customer Profile)', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/icp');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Lead Scoring', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/lead-scoring');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Account-Based Selling', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/abm');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Account-Based Engagement', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/engagement/abm');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── RevOps ───────────────────────────────────────────────────────────────────

test.describe('RevOps Hub', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/revops');
    // RevOpsHub.tsx não tem h1 no DOM — verifica título via Helmet
    await expect(page).toHaveTitle(/Revenue Operations Hub.*Promo Champions/i, { timeout: 20_000 });
  });
});

// ─── Smart Search ─────────────────────────────────────────────────────────────

test.describe('Smart Search', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/busca-inteligente');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Ask Anything', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/perguntar');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Tarefas ──────────────────────────────────────────────────────────────────

test.describe('Tarefas', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/tarefas');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Acompanhamento de Pedidos ───────────────────────────────────────────────

test.describe('Acompanhamento de Pedidos', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/acompanhamento-pedidos');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Minhas Premiações ────────────────────────────────────────────────────────

test.describe('Minhas Premiações', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/minhas-premiacoes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── ICP + Fonte de Leads ────────────────────────────────────────────────────

test.describe('Fonte de Leads', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/fonte-leads');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
