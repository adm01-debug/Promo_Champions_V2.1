// Melhoria 33 - Reports & Analytics E2E
import { test, expect } from '@playwright/test';

test.describe('Reports and Analytics', () => {
  test('should generate → filter → export report', async ({ page }) => {
    await page.goto('/relatorios');
    
    // 1. Select report type
    await page.selectOption('[name="report-type"]', 'sales-performance');
    await page.click('[data-testid="generate-report"]');
    
    await expect(page.locator('[data-testid="report-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-table"]')).toBeVisible();

    // 2. Apply filters
    await page.fill('[name="date-from"]', '2025-01-01');
    await page.fill('[name="date-to"]', '2025-12-31');
    await page.selectOption('[name="salesperson"]', 'all');
    await page.click('[data-testid="apply-filters"]');
    
    await expect(page.locator('[data-testid="report-updated"]')).toBeVisible();

    // 3. Export report
    await page.click('[data-testid="export-dropdown"]');
    
    const [downloadPDF] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-pdf"]')
    ]);
    expect(downloadPDF.suggestedFilename()).toContain('sales-performance');
    
    const [downloadExcel] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-excel"]')
    ]);
    expect(downloadExcel.suggestedFilename()).toContain('.xlsx');

    // 4. Validate data
    const totalRevenue = await page.locator('[data-testid="total-revenue"]').textContent();
    expect(parseFloat(totalRevenue || '0')).toBeGreaterThan(0);
  });
});
