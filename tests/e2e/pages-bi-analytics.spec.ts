/**
 * E2E — BI & Analytics: BIVendedor, BISDR, BICloser, BIGestor, Analytics,
 * FunnelAnalysis, InteligenciaPreditiva, ClientHealthScore, FunnelReport,
 * CohortReport, ABCAnalysis, ClosingTime, DealVelocity, EvolutionCurves,
 * PriceEvolution, GamifiedProfile, BadgesGallery, Intelligence,
 * BusinessIntelligence, ROI, ForecastPonderado, PrevisaoDemanda,
 * RevOpsHub, TopProductsRanking, CategoryMetrics, HistoricalBenchmark,
 * EmailAnalytics, EmailTracking
 *
 * Run with: npx playwright test tests/e2e/pages-bi-analytics.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── BI Vendedor ─────────────────────────────────────────────────────────────

test.describe('BI Vendedor', () => {
  test('carrega heading "Meu BI"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-vendedor');

    await expect(page.getByRole('heading', { name: /Meu BI/i, level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-vendedor');
    await expect(page).toHaveTitle(/BI Vendedor.*Promo Champions/i);
  });
});

// ─── BI SDR ──────────────────────────────────────────────────────────────────

test.describe('BI SDR', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-sdr');
    // SDS page has a heading — at minimum, no crash
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-sdr');
    await expect(page).toHaveTitle(/BI.*Promo Champions/i);
  });
});

// ─── BI Closer ───────────────────────────────────────────────────────────────

test.describe('BI Closer', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-closer');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-closer');
    await expect(page).toHaveTitle(/BI.*Promo Champions/i);
  });
});

// ─── BI Gestor ───────────────────────────────────────────────────────────────

test.describe('BI Gestor', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-gestor');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/bi-gestor');
    await expect(page).toHaveTitle(/BI.*Promo Champions/i);
  });
});

// ─── Funnel Analysis ────────────────────────────────────────────────────────

test.describe('Funnel Analysis', () => {
  test('carrega heading "Análise de Funil"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/funil');

    await expect(
      page.getByRole('heading', { name: /Análise de Funil/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/funil');
    await expect(page).toHaveTitle(/Análise de Funil.*Promo Champions/i);
  });
});

// ─── Intelligence Hub ─────────────────────────────────────────────────────────

test.describe('Inteligência (Intelligence Hub)', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/inteligencia');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Customer Success 360 / Health Score ─────────────────────────────────────

test.describe('Customer Success 360 (Health Score)', () => {
  test('carrega heading "Customer Success 360"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/health-score');

    await expect(
      page.getByRole('heading', { name: /Customer Success 360/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/health-score');
    await expect(page).toHaveTitle(/Customer Success 360.*Promo Champions/i);
  });
});

// ─── ABC Analysis ─────────────────────────────────────────────────────────────

test.describe('ABC Analysis', () => {
  test('carrega página de analytics', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/analytics/abc');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Closing Time ─────────────────────────────────────────────────────────────

test.describe('Closing Time Analytics', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/analytics/closing-time');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Deal Velocity ────────────────────────────────────────────────────────────

test.describe('Deal Velocity', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/analytics/deal-velocity');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Evolution Curves ─────────────────────────────────────────────────────────

test.describe('Evolution Curves', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/analytics/evolution');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Top Produtos ─────────────────────────────────────────────────────────────

test.describe('Top Produtos', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/top-produtos');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Evolução de Preços ─────────────────────────────────────────────────────

test.describe('Evolução de Preços', () => {
  test('carrega heading "Evolução de Preços"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/evolucao-precos');

    await expect(
      page.getByRole('heading', { name: /Evolução de Preços/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/evolucao-precos');
    await expect(page).toHaveTitle(/Evolução de Preços.*Promo Champions/i);
  });
});

// ─── Gamified Profile ────────────────────────────────────────────────────────

test.describe('Perfil Gamificado', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/perfil-gamer');
    // h1 existe mas tem animação que o esconde — verifica título e container
    await expect(page).toHaveTitle(/Perfil Gamer.*Promo Champions/i);
    await expect(page.locator('[class*="min-h-screen"]').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Badges Gallery ──────────────────────────────────────────────────────────

test.describe('Galeria de Badges', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/gamificacao/badges');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Coaching Inteligente ─────────────────────────────────────────────────────

test.describe('Coaching Inteligente', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/coaching-inteligente');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Deal Intelligence ───────────────────────────────────────────────────────

test.describe('Deal Intelligence', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/deal-intelligence');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Win/Loss Intelligence ───────────────────────────────────────────────────

test.describe('Win/Loss Intelligence', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/win-loss-intelligence');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Inteliência de Compras ──────────────────────────────────────────────────

test.describe('Inteligência de Compras', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/inteligencia-compras');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
