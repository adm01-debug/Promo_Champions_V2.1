// Melhoria 29 - SDR Complete Journey E2E
import { test, expect } from '@playwright/test';

test.describe('SDR Complete Journey', () => {
  test('should complete full SDR workflow: login → receive lead → qualify → pass to closer', async ({ page }) => {
    // 1. Login as SDR
    await page.goto('/');
    await page.fill('[name="email"]', 'sdr@test.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/sdr/dashboard');
    await expect(page.locator('h1')).toContainText('SDR Dashboard');

    // 2. Receive new lead
    await page.click('[data-testid="new-leads-tab"]');
    await expect(page.locator('[data-testid="lead-card"]').first()).toBeVisible();
    
    const leadName = await page.locator('[data-testid="lead-name"]').first().textContent();
    await page.locator('[data-testid="lead-card"]').first().click();

    // 3. Qualify lead
    await page.fill('[name="qualification-notes"]', 'Good fit - Budget confirmed, timeline Q1 2025');
    await page.selectOption('[name="lead-score"]', '85');
    await page.selectOption('[name="industry"]', 'Technology');
    await page.fill('[name="budget"]', '50000');
    await page.click('[data-testid="qualify-button"]');

    // 4. Pass to Closer
    await expect(page.locator('[data-testid="assign-closer-modal"]')).toBeVisible();
    await page.selectOption('[name="closer"]', 'closer@test.com');
    await page.fill('[name="handoff-notes"]', 'High-priority lead, ready for proposal');
    await page.click('[data-testid="confirm-handoff"]');

    // 5. Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Lead qualified and assigned');
    await expect(page.locator('[data-testid="my-qualifications"]')).toContainText(leadName);
    
    // 6. Verify XP gained
    const xpBefore = parseInt(await page.locator('[data-testid="user-xp"]').textContent() || '0');
    await page.reload();
    const xpAfter = parseInt(await page.locator('[data-testid="user-xp"]').textContent() || '0');
    expect(xpAfter).toBeGreaterThan(xpBefore);
  });

  test('should handle lead rejection workflow', async ({ page }) => {
    await page.goto('/sdr/dashboard');
    
    await page.locator('[data-testid="lead-card"]').first().click();
    await page.click('[data-testid="reject-lead-button"]');
    await page.selectOption('[name="rejection-reason"]', 'No budget');
    await page.fill('[name="rejection-notes"]', 'Company too small, not a fit');
    await page.click('[data-testid="confirm-rejection"]');

    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Lead rejected');
  });
});
