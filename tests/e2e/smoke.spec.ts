import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    // Check for a common element, e.g., the main title or a known button
    // Since this is a CRM/BI tool, it likely has a login or a dashboard title
    await expect(page).toHaveTitle(/vite/i); // Adjust based on actual app title
  });

  test('should redirect to auth if not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    // Most apps redirect to /auth or /login if unauthenticated
    await expect(page.url()).toContain('/auth');
  });
});
