import { test, expect } from '@playwright/test';

test.describe('Closer Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'closer@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('can create deal from qualified lead', async ({ page }) => {
    await page.click('text=Deals');
    await page.click('text=New Deal');
    
    await page.fill('[name="title"]', 'Test Deal');
    await page.fill('[name="value"]', '50000');
    await page.selectOption('[name="stage"]', 'proposal');
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('text=Test Deal')).toBeVisible();
  });

  test('can move deal through pipeline', async ({ page }) => {
    await page.click('text=Deals');
    await page.click('text=Test Deal');
    
    await page.selectOption('[name="stage"]', 'negotiation');
    await page.click('button:has-text("Update")');
    
    await expect(page.locator('text=Negotiation')).toBeVisible();
  });

  test('can win deal', async ({ page }) => {
    await page.click('text=Deals');
    await page.click('text=Test Deal');
    
    await page.click('button:has-text("Mark as Won")');
    await page.fill('[name="close_date"]', '2024-12-31');
    await page.click('button:has-text("Confirm")');
    
    await expect(page.locator('text=Won')).toBeVisible();
  });
});
