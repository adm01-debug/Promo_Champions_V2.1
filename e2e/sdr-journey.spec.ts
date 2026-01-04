import { test, expect } from '@playwright/test';

test.describe('SDR Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'sdr@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('can create new lead', async ({ page }) => {
    await page.click('text=Clients');
    await page.click('text=Add Client');
    
    await page.fill('[name="name"]', 'Test Lead');
    await page.fill('[name="email"]', 'lead@test.com');
    await page.fill('[name="phone"]', '(11) 99999-9999');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Test Lead')).toBeVisible();
  });

  test('can qualify lead', async ({ page }) => {
    await page.click('text=Clients');
    await page.click('text=Test Lead');
    
    await page.selectOption('[name="status"]', 'qualified');
    await page.click('button:has-text("Update")');
    
    await expect(page.locator('text=Qualified')).toBeVisible();
  });

  test('can pass lead to closer', async ({ page }) => {
    await page.click('text=Clients');
    await page.click('text=Test Lead');
    
    await page.click('text=Assign to Closer');
    await page.selectOption('[name="closer"]', 'closer@test.com');
    await page.click('button:has-text("Assign")');
    
    await expect(page.locator('text=Assigned')).toBeVisible();
  });
});
