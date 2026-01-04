import { test, expect } from '@playwright/test';

test.describe('Playbooks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('can view playbook', async ({ page }) => {
    await page.click('text=Playbooks');
    await page.click('text=Discovery Call');
    
    await expect(page.locator('h1:has-text("Discovery Call")')).toBeVisible();
    await expect(page.locator('text=Preparation')).toBeVisible();
  });

  test('can follow playbook steps', async ({ page }) => {
    await page.click('text=Playbooks');
    await page.click('text=Discovery Call');
    
    await page.click('[data-testid="step-1"] input[type="checkbox"]');
    await expect(page.locator('[data-testid="step-1"][data-checked="true"]')).toBeVisible();
  });
});
