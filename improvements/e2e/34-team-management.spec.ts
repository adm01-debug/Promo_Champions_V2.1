// Melhoria 34 - Team Management E2E
import { test, expect } from '@playwright/test';

test.describe('Team Management', () => {
  test('should create team → add members → set goals → track progress', async ({ page }) => {
    await page.goto('/times');
    
    // 1. Create team
    await page.click('[data-testid="new-team-button"]');
    await page.fill('[name="team-name"]', 'Sales Team Alpha');
    await page.fill('[name="team-description"]', 'High-performing sales team');
    await page.click('[data-testid="save-team"]');
    
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Team created');

    // 2. Add members
    await page.click('[data-testid="add-members-button"]');
    await page.click('[data-testid="user-checkbox"][data-user="user1"]');
    await page.click('[data-testid="user-checkbox"][data-user="user2"]');
    await page.click('[data-testid="user-checkbox"][data-user="user3"]');
    await page.click('[data-testid="confirm-add-members"]');
    
    await expect(page.locator('[data-testid="team-members-count"]')).toContainText('3');

    // 3. Set team goals
    await page.click('[data-testid="set-goals-button"]');
    await page.fill('[name="revenue-goal"]', '100000');
    await page.fill('[name="deals-goal"]', '50');
    await page.fill('[name="deadline"]', '2025-12-31');
    await page.click('[data-testid="save-goals"]');
    
    await expect(page.locator('[data-testid="revenue-goal-card"]')).toContainText('$100,000');

    // 4. Track progress
    await page.click('[data-testid="team-dashboard-tab"]');
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="members-performance"]')).toBeVisible();
    
    const progress = await page.locator('[data-testid="goal-progress-percentage"]').textContent();
    expect(parseInt(progress || '0')).toBeGreaterThanOrEqual(0);
  });
});
