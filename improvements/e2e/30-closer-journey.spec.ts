// Melhoria 30 - Closer Complete Journey E2E
import { test, expect } from '@playwright/test';

test.describe('Closer Complete Journey', () => {
  test('should complete full closer workflow: receive → create deal → move pipeline → win', async ({ page }) => {
    // 1. Login as Closer
    await page.goto('/');
    await page.fill('[name="email"]', 'closer@test.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/closer/dashboard');

    // 2. Check qualified leads
    await page.click('[data-testid="qualified-leads-tab"]');
    const leadCard = page.locator('[data-testid="qualified-lead-card"]').first();
    await expect(leadCard).toBeVisible();
    
    const leadName = await leadCard.locator('[data-testid="lead-name"]').textContent();
    const leadValue = await leadCard.locator('[data-testid="lead-value"]').textContent();

    // 3. Create deal from qualified lead
    await leadCard.click();
    await page.click('[data-testid="create-deal-button"]');
    await page.fill('[name="deal-title"]', `Deal with ${leadName}`);
    await page.fill('[name="deal-value"]', leadValue || '50000');
    await page.selectOption('[name="stage"]', 'proposal');
    await page.click('[data-testid="save-deal"]');

    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Deal created');

    // 4. Navigate to Pipeline
    await page.click('[data-testid="nav-pipeline"]');
    await expect(page).toHaveURL('/pipeline');

    // 5. Move deal through pipeline
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${leadName}")`);
    
    // Proposal → Negotiation
    await dealCard.dragTo(page.locator('[data-testid="stage-negotiation"]'));
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Deal moved');
    
    // Negotiation → Closing
    await dealCard.dragTo(page.locator('[data-testid="stage-closing"]'));
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Deal moved');

    // 6. Win the deal
    await dealCard.click();
    await page.click('[data-testid="win-deal-button"]');
    await page.fill('[name="win-notes"]', 'Contract signed, payment confirmed');
    await page.fill('[name="actual-value"]', leadValue || '50000');
    await page.click('[data-testid="confirm-win"]');

    await expect(page.locator('[data-testid="celebration-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="celebration-modal"]')).toContainText('Congratulations!');
    
    // 7. Verify deal in won stage
    await page.click('[data-testid="close-celebration"]');
    const wonStage = page.locator('[data-testid="stage-won"]');
    await expect(wonStage).toContainText(leadName);

    // 8. Check updated metrics
    await page.click('[data-testid="nav-dashboard"]');
    const revenueCard = page.locator('[data-testid="revenue-card"]');
    await expect(revenueCard).toContainText(leadValue || '50000');
  });

  test('should handle deal loss workflow', async ({ page }) => {
    await page.goto('/pipeline');
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    await dealCard.click();
    await page.click('[data-testid="lose-deal-button"]');
    await page.selectOption('[name="loss-reason"]', 'Price');
    await page.fill('[name="loss-notes"]', 'Competitor was 20% cheaper');
    await page.click('[data-testid="confirm-loss"]');

    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Deal marked as lost');
    
    const lostStage = page.locator('[data-testid="stage-lost"]');
    await expect(lostStage).toContainText(await dealCard.locator('[data-testid="deal-name"]').textContent() || '');
  });
});
