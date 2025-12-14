import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for E2E Tests
 * 
 * Creates authenticated sessions for different user roles
 * to test RLS policies.
 */

// Test user credentials - these should be configured in your test environment
const TEST_USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'testpassword123',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@test.com',
    password: process.env.E2E_MANAGER_PASSWORD || 'testpassword123',
  },
  salesperson: {
    email: process.env.E2E_SALESPERSON_EMAIL || 'salesperson@test.com',
    password: process.env.E2E_SALESPERSON_PASSWORD || 'testpassword123',
  },
};

export { TEST_USERS };

// Setup: Authenticate as admin
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/auth');
  await page.getByPlaceholder('email@exemplo.com').fill(TEST_USERS.admin.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USERS.admin.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 10000 });
  
  // Save admin auth state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});

// Setup: Authenticate as manager
setup('authenticate as manager', async ({ page }) => {
  await page.goto('/auth');
  await page.getByPlaceholder('email@exemplo.com').fill(TEST_USERS.manager.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USERS.manager.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  
  await page.waitForURL('/', { timeout: 10000 });
  
  await page.context().storageState({ path: 'e2e/.auth/manager.json' });
});

// Setup: Authenticate as salesperson
setup('authenticate as salesperson', async ({ page }) => {
  await page.goto('/auth');
  await page.getByPlaceholder('email@exemplo.com').fill(TEST_USERS.salesperson.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USERS.salesperson.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  
  await page.waitForURL('/', { timeout: 10000 });
  
  await page.context().storageState({ path: 'e2e/.auth/salesperson.json' });
});
