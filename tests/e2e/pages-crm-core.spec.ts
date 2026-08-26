/**
 * E2E — CRM Core: Vendas, Clientes, Pipeline, Kanban, Mapa, Agenda
 *
 * Auth + database must be populated (ti@promobrindes.com.br has salesperson record).
 * Run with: npx playwright test tests/e2e/pages-crm-core.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Vendas (deals pipeline) ─────────────────────────────────────────────────

test.describe('Vendas — Deals Pipeline', () => {
  test('carrega heading e filtros', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/vendas');

    await expect(page.getByRole('heading', { name: /Vendas/i, level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByPlaceholder(/Buscar/i)).toBeVisible();
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/vendas');
    await expect(page).toHaveTitle(/Vendas.*Promo Champions/i);
  });
});

// ─── Clientes (client hub) ────────────────────────────────────────────────────

test.describe('Clientes — Client Hub', () => {
  test('carrega heading e barra de busca', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/clientes');

    await expect(page.getByRole('heading', { name: /Clientes/i, level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByPlaceholder(/Buscar/i)).toBeVisible();
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/clientes');
    await expect(page).toHaveTitle(/Clientes.*Promo Champions/i);
  });
});

// ─── Pipeline (kanban board) ──────────────────────────────────────────────────

test.describe('Pipeline — Kanban Board', () => {
  test('carrega board com heading e instrução de arraste', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    // Pipeline é heavy em lazy-loading — usa 'load' em vez de 'networkidle'
    await loadPage(page, '/pipeline', 45_000);

    await expect(
      page.getByRole('heading', { name: /Pipeline/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Arraste os deals entre as colunas/i)).toBeVisible();
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/pipeline', 45_000);
    await expect(page).toHaveTitle(/Pipeline.*Promo Champions/i);
  });
});

// ─── Kanban de Clientes ──────────────────────────────────────────────────────

test.describe('Kanban de Clientes', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/kanban-clientes');

    await expect(
      page.getByRole('heading', { name: /Kanban/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/kanban-clientes');
    await expect(page).toHaveTitle(/Kanban.*Promo Champions/i);
  });
});

// ─── Mapa de Clientes (Leaflet map) ──────────────────────────────────────────

test.describe('Mapa de Clientes', () => {
  // Nota: MapaClientes.tsx renderiza h2 (não h1) dentro de ClientsMap
  test('carrega heading e mapa Leaflet', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/mapa-clientes');

    // h2 com "Mapa de Clientes" — sem level=1 para capturar qualquer heading
    await expect(
      page.getByRole('heading', { name: /Mapa de Clientes/i }),
    ).toBeVisible({ timeout: 20_000 });
    // Leaflet renderiza .leaflet-container
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/mapa-clientes');
    await expect(page).toHaveTitle(/Mapa.*Promo Champions/i);
  });
});

// ─── Agenda Comercial ─────────────────────────────────────────────────────────

test.describe('Agenda Comercial', () => {
  test('carrega heading e colunas de eventos', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/agenda');

    await expect(
      page.getByRole('heading', { name: /Agenda/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });

    // Event group columns
    await expect(page.getByText(/Pendentes/i)).toBeVisible();
    await expect(page.getByText(/Concluídos/i)).toBeVisible();
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/agenda');
    await expect(page).toHaveTitle(/Agenda.*Promo Champions/i);
  });
});
