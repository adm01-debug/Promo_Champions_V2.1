/**
 * E2E — Gamification & Social: Ranking, Arena, Desafios, VictoryFeed,
 * CompetitiveSeasons, TeamActivityFeed, GamifiedProfile, Badges
 *
 * Run with: npx playwright test tests/e2e/pages-gamification.spec.ts
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH, skipReason, restoreSession, loadPage } from './helpers/page-helpers';

test.describe.configure({ mode: 'parallel' });

// ─── Circuito de Vencedores (Ranking Competitivo) ─────────────────────────────

test.describe('Ranking Competitivo — Circuito de Vencedores', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/ranking');

    await expect(
      page.getByRole('heading', { name: /Circuito de Vencedores/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/ranking');
    await expect(page).toHaveTitle(/Circuito de Vencedores.*Promo Champions/i);
  });

  test('mostra tabs de ranking', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/ranking');
    await expect(page.getByRole('tab', { name: /Ranking Atual/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('tab', { name: /XP|Níveis/i }).first()).toBeVisible();
  });
});

// ─── Arena Competitiva Hub ───────────────────────────────────────────────────

test.describe('Arena Competitiva Hub', () => {
  test('carrega heading "Circuito de Vencedores"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/arena');

    await expect(
      page.getByRole('heading', { name: /Circuito de Vencedores/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/arena');
    await expect(page).toHaveTitle(/Circuito de Vencedores.*PROMO CHAMPIONS/i);
  });
});

// ─── Desafios Semanais ───────────────────────────────────────────────────────

test.describe('Desafios Semanais', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/desafios');

    await expect(
      page.getByRole('heading', { name: /Desafios Semanais/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/desafios');
    await expect(page).toHaveTitle(/Desafios Semanais.*Promo Champions/i);
  });

  test('mostra cards de stats', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/desafios');
    await expect(page.getByText(/Ativos|Desafios/i).first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Desafios Diários ────────────────────────────────────────────────────────

test.describe('Desafios Diários', () => {
  test('carrega heading', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/desafios-diarios');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Victory Feed ────────────────────────────────────────────────────────────

test.describe('Feed de Vitórias', () => {
  test('carrega heading "Feed de Vitórias"', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/victory-feed');

    await expect(
      page.getByRole('heading', { name: /Feed de Vitórias/i, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('title da página correto', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/victory-feed');
    await expect(page).toHaveTitle(/Feed de Vitórias.*Promo Champions/i);
  });

  test('mostra botões de reação', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/victory-feed');
    // Reaction emojis: 🔥 👏 🎉 💪 ❤️ 🏆 — buttons or text
    await expect(page.locator('text=/🔥|👏|🎉/').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Team Activity Feed ──────────────────────────────────────────────────────

test.describe('Team Activity Feed', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/team-activity');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Race Arena (logged-in view) ────────────────────────────────────────────

test.describe('Race Arena', () => {
  test('carrega página principal', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/race-arena');
    // Race Arena has tabs — at minimum, no crash
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// ─── Competitive Seasons Admin ─────────────────────────────────────────────────

test.describe('Competitive Seasons Admin', () => {
  test('carrega página', async ({ page }) => {
    test.skip(!HAS_AUTH, skipReason());
    await restoreSession(page);
    await loadPage(page, '/competitive-seasons');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  });
});
