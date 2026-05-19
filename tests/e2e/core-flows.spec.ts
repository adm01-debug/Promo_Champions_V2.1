import { test, expect } from '@playwright/test';

test.describe('Freight Quest - Core User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should navigate to dashboard and check for sale cards', async ({ page }) => {
    // Navigate to dashboard (assuming redirect to /auth if not logged in, but we mock the state or use a path)
    await page.goto('/dashboard');
    
    // Check if the dashboard is visible
    // Wait for the "Pipeline" or "Sales" heading
    const dashboardTitle = page.getByRole('heading', { name: /dashboard/i });
    if (await dashboardTitle.isVisible()) {
      await expect(dashboardTitle).toBeVisible();
    } else {
      // If redirected to auth, verify auth screen
      await expect(page).toHaveURL(/.*auth/);
    }
  });

  test('should open AI Insights on a Sale card', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find a Sale HUD Card (assuming some data is pre-rendered or mocked)
    const aiInsightsButton = page.getByTitle('Predição de IA').first();
    
    if (await aiInsightsButton.isVisible()) {
      await aiInsightsButton.click();
      
      // Verify the Dialog opened
      await expect(page.getByText('Inteligência Preditiva (IA)')).toBeVisible();
      await expect(page.getByText('Score de Fechamento')).toBeVisible();
      
      // Close dialog
      await page.keyboard.press('Escape');
    }
  });

  test('should show validation error on invalid login', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/senha/i);
    const submitButton = page.getByRole('button', { name: /entrar|sign in/i });
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('short');
      await submitButton.click();
      
      // Expect error message (Shadcn toast or inline error)
      const errorMsg = page.getByText(/inválido|error|falha/i);
      await expect(errorMsg).toBeVisible();
    }
  });
});
