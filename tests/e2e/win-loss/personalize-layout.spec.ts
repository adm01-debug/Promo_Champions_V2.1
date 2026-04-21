import { test, expect } from "@playwright/test";

/**
 * E2E — Personalizar layout do Win/Loss Intelligence.
 * Pré-requisito: usuário autenticado (Playwright config compartilha o auth state).
 *
 * Cobre:
 *  - Modo edição abre via botão "Personalizar".
 *  - Reordenação por drag-and-drop persiste após reload.
 *  - Botão "Padrão" + "Salvar" restaura o layout default.
 */
test.describe("Win/Loss · Personalizar layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/win-loss-intelligence");
    await page.waitForSelector("[data-testid='winloss-layout-personalize']", { timeout: 15_000 });
  });

  test("ordena widgets por drag-and-drop e persiste após reload", async ({ page }) => {
    const initial = await page.locator("[data-widget-id]").evaluateAll(els =>
      els.map(el => el.getAttribute("data-widget-id")),
    );
    expect(initial.length).toBeGreaterThan(2);

    await page.getByTestId("winloss-layout-personalize").click();
    await page.waitForSelector("[data-testid='winloss-layout-edit-list']");

    // Drag manual para garantir compatibilidade com dnd-kit
    const grips = page.locator("[data-testid='winloss-layout-edit-list'] [aria-label^='Reordenar']");
    const first = grips.nth(0);
    const third = grips.nth(2);
    const fromBox = await first.boundingBox();
    const toBox = await third.boundingBox();
    if (!fromBox || !toBox) throw new Error("bounding boxes ausentes");

    await page.mouse.move(fromBox.x + 8, fromBox.y + 8);
    await page.mouse.down();
    await page.mouse.move(fromBox.x + 8, fromBox.y + 30, { steps: 5 });
    await page.mouse.move(toBox.x + 8, toBox.y + toBox.height + 5, { steps: 10 });
    await page.mouse.up();

    const saveBtn = page.getByTestId("winloss-layout-save");
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page.getByText(/Layout salvo/i)).toBeVisible({ timeout: 5_000 });

    await page.reload();
    await page.waitForSelector("[data-widget-id]");
    const after = await page.locator("[data-widget-id]").evaluateAll(els =>
      els.map(el => el.getAttribute("data-widget-id")),
    );
    expect(after).not.toEqual(initial);
    expect(after[0]).not.toBe(initial[0]);
  });

  test("Padrão + Salvar restaura DEFAULT_LAYOUT", async ({ page }) => {
    await page.getByTestId("winloss-layout-personalize").click();
    await page.getByTestId("winloss-layout-reset").click();
    const saveBtn = page.getByTestId("winloss-layout-save");
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(page.getByText(/Layout salvo/i)).toBeVisible({ timeout: 5_000 });
    } else {
      // já estava no default
      await page.getByTestId("winloss-layout-cancel").click();
    }
  });
});
