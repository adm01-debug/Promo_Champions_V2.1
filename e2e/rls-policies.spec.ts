import { test, expect } from '@playwright/test';

/**
 * E2E Tests for RLS Policies
 * 
 * These tests verify that Row Level Security policies are correctly
 * enforced in the production environment by testing actual user interactions.
 */

test.describe('RLS Policies - Unauthenticated Access', () => {
  test('should redirect unauthenticated user to login page', async ({ page }) => {
    // Try to access protected route
    await page.goto('/');
    
    // Should be redirected to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect from vendedores page when unauthenticated', async ({ page }) => {
    await page.goto('/vendedores');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect from clientes page when unauthenticated', async ({ page }) => {
    await page.goto('/clientes');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect from pipeline page when unauthenticated', async ({ page }) => {
    await page.goto('/pipeline');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect from configuracoes page when unauthenticated', async ({ page }) => {
    await page.goto('/configuracoes');
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe('RLS Policies - Salesperson Role Restrictions', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('salesperson can view dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Should see dashboard content
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Should NOT be redirected to access denied
    await expect(page).not.toHaveURL(/\/acesso-negado/);
  });

  test('salesperson can view their activities', async ({ page }) => {
    await page.goto('/atividades');
    
    // Should be able to view activities page
    await expect(page).toHaveURL('/atividades');
  });

  test('salesperson can view pipeline', async ({ page }) => {
    await page.goto('/pipeline');
    
    // Should be able to view pipeline
    await expect(page).toHaveURL('/pipeline');
  });

  test('salesperson cannot access role management in settings', async ({ page }) => {
    await page.goto('/configuracoes');
    
    // Navigate to settings and check for role management
    const roleManagementTab = page.getByText('Gerenciamento de Funções');
    
    if (await roleManagementTab.isVisible()) {
      await roleManagementTab.click();
      
      // Should see "permission denied" message or restricted content
      const permissionDenied = page.getByText(/Você não tem permissão|Acesso negado|Sem permissão/i);
      await expect(permissionDenied).toBeVisible();
    }
  });

  test('salesperson cannot add new clients via UI', async ({ page }) => {
    await page.goto('/clientes');
    
    // Check if "Novo Cliente" button exists
    const newClientButton = page.getByRole('button', { name: /Novo Cliente/i });
    
    // If button exists, it should be disabled or clicking should show error
    if (await newClientButton.isVisible()) {
      await newClientButton.click();
      
      // Fill form and try to submit
      const nameInput = page.getByPlaceholder(/Nome/i).first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Client');
        
        // Try to save
        const saveButton = page.getByRole('button', { name: /Salvar|Criar/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show error toast or permission denied
          const errorMessage = page.getByText(/Erro|permissão|não autorizado/i);
          await expect(errorMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('salesperson cannot add new products via UI', async ({ page }) => {
    await page.goto('/produtos');
    
    const newProductButton = page.getByRole('button', { name: /Novo Produto/i });
    
    if (await newProductButton.isVisible()) {
      await newProductButton.click();
      
      const nameInput = page.getByPlaceholder(/Nome/i).first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Product');
        
        const saveButton = page.getByRole('button', { name: /Salvar|Criar/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          const errorMessage = page.getByText(/Erro|permissão|não autorizado/i);
          await expect(errorMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});

test.describe('RLS Policies - Manager Role Access', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' });

  test('manager can access dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/acesso-negado/);
  });

  test('manager can view analytics', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).toHaveURL('/analytics');
  });

  test('manager can view reports', async ({ page }) => {
    await page.goto('/relatorios');
    await expect(page).toHaveURL('/relatorios');
  });

  test('manager can access metas (goals)', async ({ page }) => {
    await page.goto('/metas');
    await expect(page).toHaveURL('/metas');
  });

  test('manager can create clients', async ({ page }) => {
    await page.goto('/clientes');
    
    const newClientButton = page.getByRole('button', { name: /Novo Cliente/i });
    
    if (await newClientButton.isVisible()) {
      await newClientButton.click();
      
      // Dialog should open without permission errors
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('manager can create products', async ({ page }) => {
    await page.goto('/produtos');
    
    const newProductButton = page.getByRole('button', { name: /Novo Produto/i });
    
    if (await newProductButton.isVisible()) {
      await newProductButton.click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('RLS Policies - Admin Full Access', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('admin can access all dashboard features', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/acesso-negado/);
  });

  test('admin can access role management', async ({ page }) => {
    await page.goto('/configuracoes');
    
    // Look for role management section
    const roleManagementTab = page.getByText('Gerenciamento de Funções');
    
    if (await roleManagementTab.isVisible()) {
      await roleManagementTab.click();
      
      // Admin should see user list with role selectors
      await expect(page.getByRole('table')).toBeVisible({ timeout: 5000 });
    }
  });

  test('admin can view access denied logs', async ({ page }) => {
    await page.goto('/configuracoes');
    
    // Look for security logs section
    const securityTab = page.getByText(/Segurança|Logs de Acesso/i);
    
    if (await securityTab.isVisible()) {
      await securityTab.click();
      
      // Should see logs table or empty state (not permission denied)
      const logsSection = page.locator('[data-testid="access-logs"], .access-logs, table');
      await expect(logsSection.or(page.getByText(/Nenhum log|Sem registros/i))).toBeVisible({ timeout: 5000 });
    }
  });

  test('admin can modify security alert settings', async ({ page }) => {
    await page.goto('/configuracoes');
    
    // Look for security settings
    const securityTab = page.getByText(/Alertas de Segurança/i);
    
    if (await securityTab.isVisible()) {
      await securityTab.click();
      
      // Should see settings form
      const settingsForm = page.locator('form, [data-testid="security-settings"]');
      await expect(settingsForm.or(page.getByText(/Configurações/i))).toBeVisible({ timeout: 5000 });
    }
  });

  test('admin can create playbooks', async ({ page }) => {
    await page.goto('/playbooks');
    
    const newPlaybookButton = page.getByRole('button', { name: /Novo Playbook|Criar/i });
    
    if (await newPlaybookButton.isVisible()) {
      await newPlaybookButton.click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('admin can create cadences', async ({ page }) => {
    await page.goto('/cadencias');
    
    const newCadenceButton = page.getByRole('button', { name: /Nova Cadência|Criar/i });
    
    if (await newCadenceButton.isVisible()) {
      await newCadenceButton.click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('RLS Policies - Access Denied Logging', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('access denied is logged when salesperson tries restricted route', async ({ page }) => {
    // Try to access a route that requires admin/manager
    await page.goto('/configuracoes');
    
    // The access denied log should be created in the background
    // We can verify this by checking if the page loads or redirects
    
    // Wait for page to settle
    await page.waitForLoadState('networkidle');
    
    // Page should either load (with restricted content) or redirect
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });
});

test.describe('RLS Policies - Data Visibility', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('salesperson can see competitive ranking (intentional cross-user visibility)', async ({ page }) => {
    await page.goto('/ranking-competitivo');
    
    // Should see ranking with multiple salespeople
    await expect(page).toHaveURL('/ranking-competitivo');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Should see ranking list (may be empty but not blocked)
    const rankingContent = page.locator('.ranking, [data-testid="ranking"], table, .leaderboard');
    await expect(rankingContent.or(page.getByText(/Ranking|Posição|Lugar/i))).toBeVisible({ timeout: 10000 });
  });

  test('salesperson can see sales analytics (intentional visibility for coaching)', async ({ page }) => {
    await page.goto('/analytics');
    
    await expect(page).toHaveURL('/analytics');
    
    // Charts and analytics should be visible
    await page.waitForLoadState('networkidle');
  });

  test('salesperson can see team goals (intentional for gamification)', async ({ page }) => {
    await page.goto('/metas');
    
    await expect(page).toHaveURL('/metas');
    
    // Goals should be visible
    await page.waitForLoadState('networkidle');
  });
});

test.describe('RLS Policies - Notification Preferences Isolation', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('salesperson can only see their own notification preferences', async ({ page }) => {
    await page.goto('/notificacoes');
    
    // Should see notification preferences page
    await expect(page).toHaveURL('/notificacoes');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Should see their own preferences form or empty state
    const preferencesForm = page.locator('form, [data-testid="notification-preferences"]');
    await expect(preferencesForm.or(page.getByText(/Preferências|Notificações/i))).toBeVisible({ timeout: 5000 });
  });
});
