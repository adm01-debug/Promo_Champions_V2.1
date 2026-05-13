import { test, expect } from '@playwright/test';

test('should load the auth page', async ({ page }) => {
  await page.goto('/auth');
  // Check for some text that should be on the auth page
  await expect(page.getByText(/Promo Champions/i).first()).toBeVisible();
});

test('should show validation errors on empty login', async ({ page }) => {
  await page.goto('/auth');
  await page.click('button[type="submit"]');
  // Basic check for error messages
  await expect(page.locator('form')).toContainText(/obrigatório/i);
});
