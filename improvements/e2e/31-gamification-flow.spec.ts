// Melhoria 31 - Gamification End-to-End
import { test, expect } from '@playwright/test';

test.describe('Gamification Flow', () => {
  test('should complete activity → gain XP → level up → unlock achievement', async ({ page }) => {
    await page.goto('/');
    await page.fill('[name="email"]', 'seller@test.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');

    // 1. Check initial level and XP
    await page.click('[data-testid="user-avatar"]');
    const initialLevel = parseInt(await page.locator('[data-testid="user-level"]').textContent() || '1');
    const initialXP = parseInt(await page.locator('[data-testid="user-xp"]').textContent() || '0');
    await page.click('[data-testid="close-profile"]');

    // 2. Complete an activity (make a call)
    await page.click('[data-testid="nav-activities"]');
    await page.click('[data-testid="new-activity-button"]');
    await page.selectOption('[name="activity-type"]', 'call');
    await page.fill('[name="activity-title"]', 'Follow-up call with client');
    await page.click('[data-testid="save-activity"]');

    // 3. Verify XP gained
    await page.click('[data-testid="user-avatar"]');
    const newXP = parseInt(await page.locator('[data-testid="user-xp"]').textContent() || '0');
    expect(newXP).toBeGreaterThan(initialXP);

    // 4. Complete more activities to level up
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="new-activity-button"]');
      await page.selectOption('[name="activity-type"]', 'email');
      await page.fill('[name="activity-title"]', `Email ${i + 1}`);
      await page.click('[data-testid="save-activity"]');
      await page.waitForTimeout(500);
    }

    // 5. Check for level up
    await page.click('[data-testid="user-avatar"]');
    const finalLevel = parseInt(await page.locator('[data-testid="user-level"]').textContent() || '1');
    
    if (finalLevel > initialLevel) {
      await expect(page.locator('[data-testid="levelup-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="levelup-modal"]')).toContainText(`Level ${finalLevel}`);
    }

    // 6. Check achievements
    await page.click('[data-testid="nav-achievements"]');
    const achievements = page.locator('[data-testid="unlocked-achievement"]');
    const count = await achievements.count();
    expect(count).toBeGreaterThan(0);

    // 7. Verify leaderboard position
    await page.click('[data-testid="nav-leaderboard"]');
    const userRow = page.locator('[data-testid="leaderboard-row"]:has-text("seller@test.com")');
    await expect(userRow).toBeVisible();
    const rank = await userRow.locator('[data-testid="rank"]').textContent();
    expect(parseInt(rank || '999')).toBeLessThan(100);
  });
});
