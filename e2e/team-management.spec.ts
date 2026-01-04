import { test, expect } from '@playwright/test';

test.describe('Team Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('can invite team member', async ({ page }) => {
    await page.click('text=Team');
    await page.click('text=Invite Member');
    
    await page.fill('[name="email"]', 'newuser@test.com');
    await page.selectOption('[name="role"]', 'sales');
    await page.click('button:has-text("Send Invitation")');
    
    await expect(page.locator('text=Invitation sent')).toBeVisible();
  });

  test('can assign deals to team member', async ({ page }) => {
    await page.click('text=Deals');
    await page.click('text=Test Deal');
    
    await page.click('text=Reassign');
    await page.selectOption('[name="owner"]', 'user@test.com');
    await page.click('button:has-text("Confirm")');
    
    await expect(page.locator('text=Reassigned')).toBeVisible();
  });
});
