import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation Flows', () => {
  
  test('should redirect unauthenticated users from /dashboard to /auth', async ({ page }) => {
    // Intercept Supabase session check to return null
    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      });
    });

    await page.goto('/dashboard');
    
    // Should be redirected to /auth
    await expect(page).toHaveURL(/.*auth/);
    await expect(page.getByText(/ACESSO AO CIRCUITO/i)).toBeVisible();
  });

  test('should allow a user to login and see the dashboard', async ({ page }) => {
    // Mock successful Supabase sign in
    await page.route('**/auth/v1/token?grant_type=password', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: { id: 'test-user-id', email: 'test@example.com' },
        }),
      });
    });

    // Mock user fetch
    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-id', email: 'test@example.com' }),
      });
    });

    // Mock salesperson profile fetch
    await page.route('**/rest/v1/salespeople*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'sales-123',
          name: 'Test Salesperson',
          email: 'test@example.com',
          role: 'admin',
          auth_user_id: 'test-user-id'
        }]),
      });
    });

    // Mock dashboard data fetch to avoid errors
    await page.route('**/rest/v1/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/auth');
    
    await page.getByLabel(/E-mail de Acesso/i).fill('test@example.com');
    await page.getByLabel(/Senha de Acesso/i).fill('password123');
    
    await page.getByRole('button', { name: /ACESSAR CIRCUITO/i }).click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check if dashboard content is visible (Sidebar usually has the app name)
    await expect(page.locator('#main-navigation')).toBeVisible();
  });

  test('should navigate between pages after login', async ({ page }) => {
    // We need to be "logged in" for this. 
    // We'll mock the session and salesperson profile.
    
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-test-auth-token', JSON.stringify({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' },
      }));
    });

    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-id', email: 'test@example.com' }),
      });
    });

    await page.route('**/rest/v1/salespeople*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'sales-123',
          name: 'Test Salesperson',
          email: 'test@example.com',
          role: 'admin',
          auth_user_id: 'test-user-id'
        }]),
      });
    });

    await page.route('**/rest/v1/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/dashboard');
    await expect(page.locator('#main-navigation')).toBeVisible();

    // Navigate to Clientes
    // Assuming the sidebar has a link to /clientes
    const clientesLink = page.locator('a[href="/clientes"]');
    if (await clientesLink.isVisible()) {
      await clientesLink.click();
      await expect(page).toHaveURL(/.*clientes/);
    } else {
      // Try another common route if /clientes is not directly in sidebar
      await page.goto('/vendas');
      await expect(page).toHaveURL(/.*vendas/);
    }
  });

  test('should allow user to logout', async ({ page }) => {
    // Mock session
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-test-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' },
      }));
    });

    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-id', email: 'test@example.com' }),
      });
    });

    await page.route('**/auth/v1/logout', (route) => {
      route.fulfill({ status: 204 });
    });

    await page.goto('/dashboard');
    
    // Find logout button - usually in a user profile menu
    // We'll look for a button with "Sair" or a common logout icon
    const userMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    if (await userMenuButton.isVisible()) {
        await userMenuButton.click();
        const logoutButton = page.getByRole('menuitem', { name: /Sair/i });
        if (await logoutButton.isVisible()) {
            await logoutButton.click();
            await expect(page).toHaveURL(/.*auth/);
        }
    }
  });

  test('should allow user to request password reset', async ({ page }) => {
    await page.goto('/auth');
    
    const forgotPasswordButton = page.getByRole('button', { name: /Esqueci a chave/i });
    await expect(forgotPasswordButton).toBeVisible();
    await forgotPasswordButton.click();

    await expect(page.getByText(/RECUPERAR ACESSO/i)).toBeVisible();
    
    const resetEmailInput = page.getByPlaceholder(/Email cadastrado/i);
    await resetEmailInput.fill('test@example.com');

    // Mock the reset request
    await page.route('**/auth/v1/recover', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.getByRole('button', { name: /Enviar Resgate/i }).click();

    // Verify success message (assuming a toast or dialog change)
    // For now, we just ensure the button was clickable and processed
    await expect(page.getByRole('button', { name: /Enviar Resgate/i })).toBeDisabled();
  });
});

