// e2e/pipeline-dnd.spec.ts
// Teste E2E: Pipeline Drag and Drop
// Data: 2024-12-28

import { test, expect } from '@playwright/test';

test.describe('Pipeline Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@salespro.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should update deal stage on drag and drop', async ({ page }) => {
    await page.goto('/pipeline');
    await page.waitForSelector('[data-testid="pipeline-loaded"]');
    
    // Pegar deal inicial
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    const initialStage = await page.locator('[data-testid="deal-card"]').first()
      .locator('..')
      .getAttribute('data-stage-name');
    
    // Arrastar para estágio "Negotiation"
    const negotiationStage = page.locator('[data-testid="stage-negotiation"]');
    await dealCard.dragTo(negotiationStage);
    
    // Validar mudança visual
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // Verificar no banco
    const dealId = await dealCard.getAttribute('data-deal-id');
    await page.waitForTimeout(500);
    
    // Recarregar página e verificar persistência
    await page.reload();
    await page.waitForSelector('[data-testid="pipeline-loaded"]');
    
    const updatedDeal = page.locator(`[data-deal-id="${dealId}"]`);
    const currentStage = await updatedDeal.locator('..')
      .getAttribute('data-stage-name');
    
    expect(currentStage).toBe('Negotiation');
  });

  test('should not allow drag to invalid stages', async ({ page }) => {
    await page.goto('/pipeline');
    
    const wonDeal = page.locator('[data-testid="deal-card"][data-status="won"]').first();
    const proposalStage = page.locator('[data-testid="stage-proposal"]');
    
    await wonDeal.dragTo(proposalStage);
    
    // Deve mostrar erro
    await expect(page.locator('[data-testid="toast-error"]'))
      .toContainText('não pode ser movido');
  });

  test('should show deal details on hover', async ({ page }) => {
    await page.goto('/pipeline');
    
    const dealCard = page.locator('[data-testid="deal-card"]').first();
    await dealCard.hover();
    
    // Tooltip deve aparecer
    const tooltip = page.locator('[data-testid="deal-tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('R$');
  });
});

// ============================================================================
// e2e/gamification.spec.ts
// Teste E2E: Sistema de Gamificação
// ============================================================================

test.describe('Gamification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@salespro.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('should award XP and level up on completing activity', async ({ page }) => {
    await page.goto('/dashboard');
    
    // XP inicial
    const initialXP = await page.locator('[data-testid="user-xp"]').textContent();
    const initialLevel = await page.locator('[data-testid="user-level"]').textContent();
    
    // Completar atividade
    await page.goto('/activities');
    const pendingActivity = page.locator('[data-testid="activity-item"][data-status="pending"]').first();
    await pendingActivity.click();
    await page.click('[data-testid="mark-complete"]');
    
    // Aguardar animação de XP
    await page.waitForSelector('[data-testid="xp-animation"]', { timeout: 5000 });
    
    // Validar XP ganho
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    
    const newXP = await page.locator('[data-testid="user-xp"]').textContent();
    expect(parseInt(newXP || '0')).toBeGreaterThan(parseInt(initialXP || '0'));
    
    // Se level up, validar celebração
    const newLevel = await page.locator('[data-testid="user-level"]').textContent();
    if (parseInt(newLevel || '0') > parseInt(initialLevel || '0')) {
      await expect(page.locator('[data-testid="level-up-celebration"]')).toBeVisible();
      await expect(page.locator('[data-testid="level-up-animation"]')).toBeVisible();
    }
  });

  test('should display achievements correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="achievements-tab"]');
    
    const achievements = page.locator('[data-testid="achievement-card"]');
    await expect(achievements.first()).toBeVisible();
    
    // Verificar achievement desbloqueado
    const unlockedAchievement = page.locator('[data-testid="achievement-card"][data-unlocked="true"]').first();
    await expect(unlockedAchievement).toHaveClass(/unlocked/);
    
    // Verificar achievement bloqueado
    const lockedAchievement = page.locator('[data-testid="achievement-card"][data-unlocked="false"]').first();
    await expect(lockedAchievement).toHaveClass(/locked/);
  });

  test('should update leaderboard after points change', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Posição inicial
    const initialRank = await page.locator('[data-testid="user-rank"]').textContent();
    
    // Ganhar pontos (fechar deal)
    await page.goto('/pipeline');
    const deal = page.locator('[data-testid="deal-card"]').first();
    await deal.click();
    await page.click('[data-testid="mark-won"]');
    await page.fill('[data-testid="closed-value"]', '100000');
    await page.click('[data-testid="confirm-won"]');
    
    // Verificar leaderboard
    await page.goto('/dashboard');
    await page.click('[data-testid="leaderboard-tab"]');
    
    const newRank = await page.locator('[data-testid="user-rank"]').textContent();
    // Posição deve melhorar (número menor) ou manter
    expect(parseInt(newRank || '999')).toBeLessThanOrEqual(parseInt(initialRank || '999'));
  });

  test('should show weekly challenges', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="challenges-tab"]');
    
    const challenges = page.locator('[data-testid="challenge-card"]');
    await expect(challenges.first()).toBeVisible();
    
    // Verificar progresso
    const challenge = challenges.first();
    const progress = await challenge.locator('[data-testid="challenge-progress"]').textContent();
    expect(progress).toMatch(/\d+\/\d+/); // formato "5/10"
  });
});

// ============================================================================
// e2e/cadences.spec.ts
// Teste E2E: Cadências de Vendas
// ============================================================================

test.describe('Sales Cadences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@salespro.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('should create and execute cadence steps', async ({ page }) => {
    // Criar cadência
    await page.goto('/cadences');
    await page.click('[data-testid="new-cadence"]');
    
    const cadenceName = `Follow-up Sequence ${Date.now()}`;
    await page.fill('[data-testid="cadence-name"]', cadenceName);
    await page.fill('[data-testid="cadence-description"]', 'E2E test cadence');
    
    // Adicionar step 1: Email
    await page.click('[data-testid="add-step"]');
    await page.selectOption('[data-testid="step-type"]', 'email');
    await page.fill('[data-testid="step-delay"]', '0'); // imediato
    await page.fill('[data-testid="step-subject"]', 'Primeiro contato');
    await page.fill('[data-testid="step-body"]', 'Olá! Gostaria de conversar sobre...');
    await page.click('[data-testid="save-step"]');
    
    // Adicionar step 2: Call
    await page.click('[data-testid="add-step"]');
    await page.selectOption('[data-testid="step-type"]', 'call');
    await page.fill('[data-testid="step-delay"]', '2'); // 2 dias depois
    await page.fill('[data-testid="step-notes"]', 'Ligar para apresentar solução');
    await page.click('[data-testid="save-step"]');
    
    // Adicionar step 3: Task
    await page.click('[data-testid="add-step"]');
    await page.selectOption('[data-testid="step-type"]', 'task');
    await page.fill('[data-testid="step-delay"]', '5'); // 5 dias depois
    await page.fill('[data-testid="step-title"]', 'Send proposal');
    await page.click('[data-testid="save-step"]');
    
    // Salvar cadência
    await page.click('[data-testid="save-cadence"]');
    
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // ========================================================================
    // Adicionar leads à cadência
    // ========================================================================
    
    await page.click(`[data-testid="cadence-card"]:has-text("${cadenceName}")`);
    await page.click('[data-testid="add-leads"]');
    
    // Selecionar 2 leads
    await page.click('[data-testid="lead-checkbox-1"]');
    await page.click('[data-testid="lead-checkbox-2"]');
    await page.click('[data-testid="start-cadence"]');
    
    await expect(page.locator('[data-testid="toast-success"]'))
      .toContainText('2 leads adicionados');
    
    // ========================================================================
    // Validar execução
    // ========================================================================
    
    // Ir para atividades
    await page.goto('/activities');
    await page.waitForTimeout(2000);
    
    // Deve ter criado atividades para ambos os leads (step 1 - email)
    const cadenceActivities = page.locator('[data-testid="cadence-activity"]');
    await expect(cadenceActivities).toHaveCount(2);
    
    // Verificar tipo
    const firstActivity = cadenceActivities.first();
    await expect(firstActivity).toContainText('Email');
    
    // Verificar agendamento do próximo step
    await page.goto('/cadences');
    await page.click(`[data-testid="cadence-card"]:has-text("${cadenceName}")`);
    
    const nextSteps = page.locator('[data-testid="next-step-date"]');
    const nextStepDate = await nextSteps.first().textContent();
    
    // Data deve ser futura (step 2 em 2 dias)
    const scheduledDate = new Date(nextStepDate || '');
    const today = new Date();
    expect(scheduledDate.getTime()).toBeGreaterThan(today.getTime());
  });

  test('should pause and resume cadence', async ({ page }) => {
    await page.goto('/cadences');
    
    const cadence = page.locator('[data-testid="cadence-card"]').first();
    await cadence.click();
    
    // Pausar
    await page.click('[data-testid="pause-cadence"]');
    await expect(page.locator('[data-testid="toast-success"]'))
      .toContainText('pausada');
    
    // Verificar status
    await expect(page.locator('[data-testid="cadence-status"]'))
      .toHaveText('Paused');
    
    // Resumir
    await page.click('[data-testid="resume-cadence"]');
    await expect(page.locator('[data-testid="toast-success"]'))
      .toContainText('retomada');
    
    await expect(page.locator('[data-testid="cadence-status"]'))
      .toHaveText('Active');
  });

  test('should show cadence analytics', async ({ page }) => {
    await page.goto('/cadences');
    
    const cadence = page.locator('[data-testid="cadence-card"]').first();
    await cadence.click();
    
    await page.click('[data-testid="analytics-tab"]');
    
    // Verificar métricas
    await expect(page.locator('[data-testid="enrolled-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
    
    // Verificar gráfico de performance
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
  });

  test('should remove lead from cadence', async ({ page }) => {
    await page.goto('/cadences');
    
    const cadence = page.locator('[data-testid="cadence-card"]').first();
    await cadence.click();
    
    await page.click('[data-testid="enrolled-leads-tab"]');
    
    const leadRow = page.locator('[data-testid="enrolled-lead-row"]').first();
    await leadRow.locator('[data-testid="remove-lead"]').click();
    
    await page.click('[data-testid="confirm-remove"]');
    
    await expect(page.locator('[data-testid="toast-success"]'))
      .toContainText('removido da cadência');
  });
});
