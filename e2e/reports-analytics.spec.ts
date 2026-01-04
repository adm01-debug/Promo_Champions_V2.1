import { test, expect } from '@playwright/test';

test.describe('Reports & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'manager@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('displays dashboard metrics', async ({ page }) => {
    await page.click('text=Dashboard');
    
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-deals"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
  });

  test('can generate sales report', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Sales Report');
    
    await page.selectOption('[name="period"]', 'month');
    await page.click('button:has-text("Generate")');
    
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('can export report to PDF', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Sales Report');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export PDF")'),
    ]);
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
