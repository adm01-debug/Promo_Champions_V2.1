import { test, expect } from '@playwright/test';

test.describe('Cadences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('can create new cadence', async ({ page }) => {
    await page.click('text=Cadences');
    await page.click('text=New Cadence');
    
    await page.fill('[name="name"]', 'Test Cadence');
    await page.fill('[name="description"]', 'Test description');
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('text=Test Cadence')).toBeVisible();
  });

  test('can add steps to cadence', async ({ page }) => {
    await page.click('text=Cadences');
    await page.click('text=Test Cadence');
    
    await page.click('text=Add Step');
    await page.selectOption('[name="type"]', 'email');
    await page.fill('[name="delay"]', '1');
    await page.fill('[name="template"]', 'Email template');
    await page.click('button:has-text("Save Step")');
    
    await expect(page.locator('text=Email template')).toBeVisible();
  });
});
