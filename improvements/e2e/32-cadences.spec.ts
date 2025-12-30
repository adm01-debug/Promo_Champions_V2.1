// Melhoria 32 - Cadences E2E
import { test, expect } from '@playwright/test';

test.describe('Cadences Automation', () => {
  test('should create cadence → add leads → execute steps → view analytics', async ({ page }) => {
    await page.goto('/cadences');
    
    // 1. Create new cadence
    await page.click('[data-testid="new-cadence-button"]');
    await page.fill('[name="cadence-name"]', 'Welcome Sequence');
    await page.fill('[name="cadence-description"]', 'Automated welcome sequence for new leads');
    
    // 2. Add steps
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[name="step-type"]', 'email');
    await page.fill('[name="step-subject"]', 'Welcome to our service!');
    await page.fill('[name="step-delay"]', '0');
    await page.click('[data-testid="save-step"]');
    
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[name="step-type"]', 'call');
    await page.fill('[name="step-delay"]', '2');
    await page.click('[data-testid="save-step"]');
    
    await page.click('[data-testid="save-cadence"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Cadence created');

    // 3. Add leads to cadence
    await page.click('[data-testid="add-leads-to-cadence"]');
    await page.click('[data-testid="lead-checkbox"]').nth(0);
    await page.click('[data-testid="lead-checkbox"]').nth(1);
    await page.click('[data-testid="confirm-add-leads"]');
    
    await expect(page.locator('[data-testid="cadence-leads-count"]')).toContainText('2');

    // 4. View analytics
    await page.click('[data-testid="cadence-analytics-tab"]');
    await expect(page.locator('[data-testid="open-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="reply-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible();
  });
});
