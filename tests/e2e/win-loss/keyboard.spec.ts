import { test, expect } from "@playwright/test";

/**
 * E2E #3 — Atalhos de teclado do Win/Loss Intelligence.
 * Ctrl+E = Export · Ctrl+R = Run · Esc = fecha drawer.
 */
test.describe("Win/Loss · Keyboard shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/win-loss-intelligence");
  });

  test("Esc fecha drawer aberto via clique em KPI", async ({ page }) => {
    const winsBtn = page.getByRole("button", { name: /Ver \d+ wins/i }).first();
    await expect(winsBtn).toBeVisible({ timeout: 15_000 });
    await winsBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });
  });

  test("skip-link 'Pular para insights' aparece no foco", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /pular para insights/i });
    await expect(skip).toBeFocused();
  });
});
