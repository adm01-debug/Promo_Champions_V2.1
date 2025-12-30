// e2e/sales-flow.spec.ts
// Teste E2E: Fluxo completo de vendas (Lead → Deal Won)
// Data: 2024-12-28

import { test, expect } from '@playwright/test';

test.describe('Sales Flow - Complete Cycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@salespro.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Aguardar dashboard carregar
    await page.waitForURL('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-loaded"]');
  });

  test('should complete full sales cycle from lead to won deal', async ({ page }) => {
    // ========================================================================
    // ETAPA 1: CRIAR LEAD
    // ========================================================================
    
    await page.goto('/leads');
    await page.click('[data-testid="new-lead"]');
    
    // Preencher formulário de lead
    const leadName = `Test Lead ${Date.now()}`;
    await page.fill('[data-testid="lead-name"]', leadName);
    await page.fill('[data-testid="lead-email"]', 'testlead@example.com');
    await page.fill('[data-testid="lead-phone"]', '(11) 98765-4321');
    await page.fill('[data-testid="lead-company"]', 'Test Company');
    await page.selectOption('[data-testid="lead-source"]', 'website');
    
    // Salvar lead
    await page.click('[data-testid="save-lead"]');
    
    // Validar criação
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator(`text=${leadName}`)).toBeVisible();
    
    // Capturar ID do lead
    const leadCard = page.locator('[data-testid^="lead-card-"]').first();
    const leadId = await leadCard.getAttribute('data-testid');
    
    // ========================================================================
    // ETAPA 2: QUALIFICAR LEAD
    // ========================================================================
    
    await leadCard.click();
    await page.click('[data-testid="qualify-lead"]');
    
    // Preencher dados de qualificação
    await page.fill('[data-testid="lead-score"]', '85');
    await page.fill('[data-testid="budget"]', '50000');
    await page.selectOption('[data-testid="urgency"]', 'high');
    await page.fill('[data-testid="notes"]', 'Lead qualificado via E2E test');
    
    await page.click('[data-testid="confirm-qualify"]');
    
    // Validar qualificação
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-status"]')).toHaveText('Qualified');
    
    // ========================================================================
    // ETAPA 3: CONVERTER PARA DEAL
    // ========================================================================
    
    await page.click('[data-testid="convert-to-deal"]');
    
    // Preencher dados do deal
    const dealTitle = `Deal from ${leadName}`;
    await page.fill('[data-testid="deal-title"]', dealTitle);
    await page.fill('[data-testid="deal-value"]', '50000');
    await page.fill('[data-testid="expected-close-date"]', '2025-03-31');
    await page.fill('[data-testid="deal-description"]', 'Deal criado via E2E test');
    
    await page.click('[data-testid="save-deal"]');
    
    // Validar conversão
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Deal criado');
    
    // ========================================================================
    // ETAPA 4: MOVER PELO PIPELINE
    // ========================================================================
    
    await page.goto('/pipeline');
    await page.waitForSelector('[data-testid="pipeline-loaded"]');
    
    // Encontrar deal card
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${dealTitle}")`);
    await expect(dealCard).toBeVisible();
    
    // Verificar estágio inicial
    const initialStage = await page.locator('[data-testid="stage-name"]').first().textContent();
    expect(initialStage).toBeTruthy();
    
    // Mover para "Proposal"
    const proposalStage = page.locator('[data-testid="stage-proposal"]');
    await dealCard.dragTo(proposalStage);
    
    // Aguardar atualização
    await page.waitForTimeout(1000);
    
    // Validar mudança de estágio
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Estágio atualizado');
    
    // Mover para "Negotiation"
    const negotiationStage = page.locator('[data-testid="stage-negotiation"]');
    await dealCard.dragTo(negotiationStage);
    await page.waitForTimeout(1000);
    
    // ========================================================================
    // ETAPA 5: ADICIONAR ATIVIDADES
    // ========================================================================
    
    await dealCard.click();
    await page.click('[data-testid="add-activity"]');
    
    // Criar atividade de follow-up
    await page.fill('[data-testid="activity-title"]', 'Follow-up call');
    await page.selectOption('[data-testid="activity-type"]', 'call');
    await page.fill('[data-testid="activity-notes"]', 'Discutir proposta final');
    await page.click('[data-testid="save-activity"]');
    
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // ========================================================================
    // ETAPA 6: FECHAR VENDA (WON)
    // ========================================================================
    
    await page.click('[data-testid="mark-won"]');
    
    // Confirmar valores finais
    await page.fill('[data-testid="closed-value"]', '50000');
    await page.fill('[data-testid="won-date"]', new Date().toISOString().split('T')[0]);
    await page.fill('[data-testid="won-notes"]', 'Deal fechado com sucesso via E2E test');
    
    await page.click('[data-testid="confirm-won"]');
    
    // Validar fechamento
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Deal ganho');
    
    // Verificar status final
    await expect(page.locator('[data-testid="deal-status"]')).toHaveText('Won');
    await expect(page.locator('[data-testid="deal-value"]')).toContainText('R$ 50.000,00');
    
    // ========================================================================
    // ETAPA 7: VALIDAR HISTÓRICO
    // ========================================================================
    
    await page.click('[data-testid="deal-history"]');
    
    // Verificar eventos no histórico
    const historyItems = page.locator('[data-testid="history-item"]');
    await expect(historyItems).toHaveCount(5); // criação + 3 mudanças de estágio + won
    
    // Verificar último evento
    const lastEvent = historyItems.first();
    await expect(lastEvent).toContainText('marked as Won');
    
    // ========================================================================
    // ETAPA 8: VERIFICAR DASHBOARD ATUALIZADO
    // ========================================================================
    
    await page.goto('/dashboard');
    
    // Aguardar KPIs atualizarem
    await page.waitForTimeout(2000);
    
    // Verificar que o deal aparece em "Won Deals"
    const wonDealsCard = page.locator('[data-testid="won-deals-card"]');
    const wonCount = await wonDealsCard.locator('[data-testid="count"]').textContent();
    expect(parseInt(wonCount || '0')).toBeGreaterThan(0);
    
    // Verificar revenue
    const revenueCard = page.locator('[data-testid="revenue-card"]');
    await expect(revenueCard).toContainText('50.000');
    
    // ========================================================================
    // VALIDAÇÕES FINAIS
    // ========================================================================
    
    // Verificar que lead foi convertido
    await page.goto('/leads');
    const convertedLead = page.locator(`[data-testid="lead-card"]:has-text("${leadName}")`);
    await expect(convertedLead).toHaveAttribute('data-status', 'converted');
    
    // Verificar que atividade foi criada
    await page.goto('/activities');
    await expect(page.locator('text=Follow-up call')).toBeVisible();
  });

  test('should handle sales cycle with lost deal', async ({ page }) => {
    // Criar lead
    await page.goto('/leads');
    await page.click('[data-testid="new-lead"]');
    
    const leadName = `Lost Lead ${Date.now()}`;
    await page.fill('[data-testid="lead-name"]', leadName);
    await page.fill('[data-testid="lead-email"]', 'lostlead@example.com');
    await page.click('[data-testid="save-lead"]');
    
    // Qualificar
    await page.click(`[data-testid="lead-card"]:has-text("${leadName}")`);
    await page.click('[data-testid="qualify-lead"]');
    await page.fill('[data-testid="lead-score"]', '60');
    await page.click('[data-testid="confirm-qualify"]');
    
    // Converter
    await page.click('[data-testid="convert-to-deal"]');
    await page.fill('[data-testid="deal-title"]', `Lost Deal from ${leadName}`);
    await page.fill('[data-testid="deal-value"]', '30000');
    await page.click('[data-testid="save-deal"]');
    
    // Ir para pipeline
    await page.goto('/pipeline');
    
    // Marcar como perdido
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("Lost Deal")`);
    await dealCard.click();
    await page.click('[data-testid="mark-lost"]');
    
    // Preencher razão da perda
    await page.selectOption('[data-testid="lost-reason"]', 'price');
    await page.fill('[data-testid="lost-notes"]', 'Preço muito alto para budget do cliente');
    await page.click('[data-testid="confirm-lost"]');
    
    // Validar
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Deal marcado como perdido');
    await expect(page.locator('[data-testid="deal-status"]')).toHaveText('Lost');
    
    // Verificar dashboard
    await page.goto('/dashboard');
    const lostDealsCard = page.locator('[data-testid="lost-deals-card"]');
    const lostCount = await lostDealsCard.locator('[data-testid="count"]').textContent();
    expect(parseInt(lostCount || '0')).toBeGreaterThan(0);
  });

  test('should validate required fields in each stage', async ({ page }) => {
    // Tentar criar lead sem campos obrigatórios
    await page.goto('/leads');
    await page.click('[data-testid="new-lead"]');
    await page.click('[data-testid="save-lead"]');
    
    // Validar mensagens de erro
    await expect(page.locator('[data-testid="error-name"]')).toContainText('obrigatório');
    await expect(page.locator('[data-testid="error-email"]')).toContainText('obrigatório');
    
    // Preencher apenas nome
    await page.fill('[data-testid="lead-name"]', 'Test');
    await page.click('[data-testid="save-lead"]');
    
    // Ainda deve mostrar erro de email
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
  });
});
