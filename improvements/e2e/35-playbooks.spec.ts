// Melhoria 35 - Playbooks & Checklists E2E
import { test, expect } from '@playwright/test';

test.describe('Playbooks', () => {
  test('should create playbook → associate to stage → execute → validate', async ({ page }) => {
    await page.goto('/playbooks');
    
    // 1. Create playbook
    await page.click('[data-testid="new-playbook-button"]');
    await page.fill('[name="playbook-name"]', 'Qualification Playbook');
    await page.selectOption('[name="stage"]', 'qualification');
    
    // 2. Add checklist items
    await page.click('[data-testid="add-checklist-item"]');
    await page.fill('[name="item-text"]', 'Confirm budget');
    await page.click('[data-testid="save-item"]');
    
    await page.click('[data-testid="add-checklist-item"]');
    await page.fill('[name="item-text"]', 'Identify decision maker');
    await page.click('[data-testid="save-item"]');
    
    await page.click('[data-testid="save-playbook"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Playbook created');

    // 3. Execute playbook on a deal
    await page.goto('/pipeline');
    const dealCard = page.locator('[data-testid="deal-card"][data-stage="qualification"]').first();
    await dealCard.click();
    
    await page.click('[data-testid="playbooks-tab"]');
    await expect(page.locator('[data-testid="playbook-item"]')).toContainText('Qualification Playbook');
    
    // 4. Complete checklist
    await page.click('[data-testid="checkbox-0"]');
    await page.click('[data-testid="checkbox-1"]');
    
    await expect(page.locator('[data-testid="playbook-completion"]')).toContainText('100%');
    await expect(page.locator('[data-testid="playbook-complete-badge"]')).toBeVisible();
  });
});
