import { test, expect } from '@playwright/test';

test.describe('Gamification Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('displays user level and XP', async ({ page }) => {
    await page.click('text=Profile');
    
    await expect(page.locator('text=Level')).toBeVisible();
    await expect(page.locator('text=XP')).toBeVisible();
  });

  test('earns XP on completing task', async ({ page }) => {
    const initialXP = await page.locator('[data-testid="xp-count"]').textContent();
    
    await page.click('text=Tasks');
    await page.click('text=Call Client X');
    await page.click('button:has-text("Complete")');
    
    const newXP = await page.locator('[data-testid="xp-count"]').textContent();
    expect(Number(newXP)).toBeGreaterThan(Number(initialXP));
  });

  test('displays leaderboard', async ({ page }) => {
    await page.click('text=Leaderboard');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Rank")')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Score")')).toBeVisible();
  });
});
