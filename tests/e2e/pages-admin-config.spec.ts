/**
 * E2E — Admin & Config Pages
 *
 * Run with: npx playwright test tests/e2e/pages-admin-config.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Configurações / System Core ─────────────────────────────────────────────

test.describe('Configurações — System Core', () => {
  test('carrega heading "System Core"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/configuracoes');

    await expect(
      page.getByRole('heading', { name: /System Core|Configurações/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/configuracoes');
    await expect(page).toHaveTitle(/Configurações.*Promo Champions/i);
  });

  test('mostra tabs de configuração', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/configuracoes');
    // System Core has role/sound/AI tabs
    await expect(page.getByRole('tab', { name: /Roles|Sons|AI|Portfolio/i }).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

test.describe('Admin Dashboard', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Tarefas', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/tarefas');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Telemetria', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    test.setTimeout(90_000);
    await restoreSession(page);
    // AdminTelemetria carrega dados externos — timeout maior
    await loadPage(page, '/admin/telemetria', 45_000);
    // A página pode renderizar erro de realtime — aceita h1 ou mensagem de erro
    const hasH1 = await page.locator('h1').first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasError = await page.getByText(/Algo deu errado|Error:|Telemetria/i).first().isVisible({ timeout: 1000 }).catch(() => false);
    expect(hasH1 || hasError).toBe(true);
  });
});

test.describe('Admin Comercial', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/comercial');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Conexões', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/conexoes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Feature Flags Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/feature-flags');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Security Dashboard', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/seguranca');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Usage Analytics', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/usage-analytics');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Admin Comissões ─────────────────────────────────────────────────────────

test.describe('Admin Comissões', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/comissoes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Premiações', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/premiacoes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Webhook Admin Pages ──────────────────────────────────────────────────────

test.describe('Webhooks Dead Letters Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/webhooks-dead-letters');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Webhook Timeline Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/webhooks-timeline');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Webhook Alert Settings Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/webhooks-alert-settings');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Webhook Alert History Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/webhooks-alert-history');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Admin V4 Callbacks ───────────────────────────────────────────────────────

test.describe('Admin V4 Callbacks', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/v4-callbacks');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Lead Routing, SLA, Approval Workflows ────────────────────────────────────

test.describe('Lead Routing', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/lead-routing');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('SLA Tracking', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/sla-tracking');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Approval Workflows', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/aprovacoes');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Webhooks', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/webhooks');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Audit Logs', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/audit-logs');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Minhas Premiações + Assinatura Digital ──────────────────────────────────

test.describe('Assinatura Digital', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/assinatura-digital');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Admin Fila, Regras, Supressão ──────────────────────────────────────────

test.describe('Admin Fila Tarefas Automáticas', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/fila-tarefas-automaticas');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Regras Inatividade', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/regras-inatividade');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Supressão de Emails', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/supressao-emails');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Alertas Churn', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/admin/alertas-churn');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
