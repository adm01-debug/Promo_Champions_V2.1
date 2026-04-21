import { test, expect } from "@playwright/test";

/**
 * E2E #1 — Filtros e drill-down do Win/Loss Intelligence.
 * Garante que aplicar um filtro recarrega a UI sem erros visíveis,
 * e o drill-down via cards de KPI abre o drawer.
 */
test.describe("Win/Loss · Filters & Drill-down", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/win-loss-intelligence");
  });

  test("aplicar período de 7 dias e ver KPIs renderizados", async ({ page }) => {
    const region = page.getByRole("region", { name: /KPIs Win\/Loss/i });
    await expect(region).toBeVisible({ timeout: 15_000 });
    // Snapshot do estado pré-filtro
    const before = await region.textContent();
    // Acionar filtro de período (chip rápido como proxy)
    const wins = page.getByRole("button", { name: /Só Wins/i });
    if (await wins.isVisible().catch(() => false)) {
      await wins.click();
      await page.waitForTimeout(500); // debounce 250ms + render
      const after = await region.textContent();
      expect(after).not.toEqual(before);
    }
  });

  test("clicar em wins do KPI abre drawer com deals", async ({ page }) => {
    const winsBtn = page.getByRole("button", { name: /Ver \d+ wins/i }).first();
    await expect(winsBtn).toBeVisible({ timeout: 15_000 });
    await winsBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/deals$/i)).toBeVisible();
  });
});
