/**
 * Lead Scoring Edge Function Logic Tests
 * Tests: deal value scoring, stage progress, time in pipeline,
 * category multipliers, recent activity scoring, total score capping
 */
import { describe, it, expect } from 'vitest';

// Replicate edge function scoring logic
const stageValues: Record<string, number> = {
  lead: 10,
  qualificado: 30,
  proposta: 50,
  negociacao: 70,
  fechado: 100,
};

const categoryMultipliers: Record<string, number> = {
  enterprise: 1.3,
  subscription: 1.1,
  'one-time': 0.9,
  trial: 0.7,
};

interface ScoringFactors {
  dealValue: number;
  stageProgress: number;
  timeInPipeline: number;
  category: number;
  recentActivity: number;
}

function scoreDealValue(amount: number): { score: number; label: string } {
  if (amount >= 50000) return { score: 25, label: 'Valor alto (>50k)' };
  if (amount >= 20000) return { score: 20, label: 'Valor médio-alto (20-50k)' };
  if (amount >= 10000) return { score: 15, label: 'Valor médio (10-20k)' };
  if (amount >= 5000) return { score: 10, label: 'Valor baixo-médio (5-10k)' };
  return { score: 5, label: 'Valor baixo (<5k)' };
}

function scoreStageProgress(status: string): number {
  const stageScore = stageValues[status] || 10;
  return Math.round(stageScore * 0.25);
}

function scoreTimeInPipeline(daysInPipeline: number): { score: number; label: string } {
  if (daysInPipeline <= 7) return { score: 20, label: 'Lead recente (≤7 dias)' };
  if (daysInPipeline <= 14) return { score: 15, label: 'Lead ativo (8-14 dias)' };
  if (daysInPipeline <= 30) return { score: 10, label: 'Lead em andamento (15-30 dias)' };
  if (daysInPipeline <= 60) return { score: 5, label: 'Lead antigo (31-60 dias)' };
  return { score: 0, label: 'Lead estagnado (>60 dias)' };
}

function scoreCategoryFactor(category: string): number {
  const mult = categoryMultipliers[category] || 1;
  return Math.round((15 * mult) / 1.3);
}

function scoreRecentActivity(taskCount: number): { score: number; label: string } {
  if (taskCount >= 5) return { score: 15, label: 'Alta atividade (5+ tarefas)' };
  if (taskCount >= 3) return { score: 12, label: 'Boa atividade (3-4 tarefas)' };
  if (taskCount >= 1) return { score: 8, label: 'Alguma atividade (1-2 tarefas)' };
  return { score: 3, label: 'Sem atividade recente' };
}

function calculateTotal(factors: ScoringFactors): number {
  const raw = factors.dealValue + factors.stageProgress + factors.timeInPipeline + factors.category + factors.recentActivity;
  return Math.min(100, raw);
}

describe('Lead Scoring EF - Deal Value', () => {
  it('should score 25 for 50k+', () => {
    expect(scoreDealValue(50000).score).toBe(25);
    expect(scoreDealValue(100000).score).toBe(25);
  });

  it('should score 20 for 20k-50k', () => {
    expect(scoreDealValue(20000).score).toBe(20);
    expect(scoreDealValue(49999).score).toBe(20);
  });

  it('should score 15 for 10k-20k', () => {
    expect(scoreDealValue(10000).score).toBe(15);
    expect(scoreDealValue(19999).score).toBe(15);
  });

  it('should score 10 for 5k-10k', () => {
    expect(scoreDealValue(5000).score).toBe(10);
    expect(scoreDealValue(9999).score).toBe(10);
  });

  it('should score 5 for <5k', () => {
    expect(scoreDealValue(0).score).toBe(5);
    expect(scoreDealValue(4999).score).toBe(5);
  });

  it('should have correct labels', () => {
    expect(scoreDealValue(50000).label).toContain('>50k');
    expect(scoreDealValue(100).label).toContain('<5k');
  });
});

describe('Lead Scoring EF - Stage Progress', () => {
  it('should score lead at 3 (10 * 0.25 rounded)', () => {
    expect(scoreStageProgress('lead')).toBe(3);
  });

  it('should score qualificado at 8 (30 * 0.25)', () => {
    expect(scoreStageProgress('qualificado')).toBe(8);
  });

  it('should score proposta at 13 (50 * 0.25)', () => {
    expect(scoreStageProgress('proposta')).toBe(13);
  });

  it('should score negociacao at 18 (70 * 0.25)', () => {
    expect(scoreStageProgress('negociacao')).toBe(18);
  });

  it('should score fechado at 25 (100 * 0.25)', () => {
    expect(scoreStageProgress('fechado')).toBe(25);
  });

  it('should default to 3 for unknown status', () => {
    expect(scoreStageProgress('unknown')).toBe(3);
  });
});

describe('Lead Scoring EF - Time In Pipeline', () => {
  it('should score 20 for ≤7 days', () => {
    expect(scoreTimeInPipeline(1).score).toBe(20);
    expect(scoreTimeInPipeline(7).score).toBe(20);
  });

  it('should score 15 for 8-14 days', () => {
    expect(scoreTimeInPipeline(8).score).toBe(15);
    expect(scoreTimeInPipeline(14).score).toBe(15);
  });

  it('should score 10 for 15-30 days', () => {
    expect(scoreTimeInPipeline(15).score).toBe(10);
    expect(scoreTimeInPipeline(30).score).toBe(10);
  });

  it('should score 5 for 31-60 days', () => {
    expect(scoreTimeInPipeline(31).score).toBe(5);
    expect(scoreTimeInPipeline(60).score).toBe(5);
  });

  it('should score 0 for 61+ days', () => {
    expect(scoreTimeInPipeline(61).score).toBe(0);
    expect(scoreTimeInPipeline(365).score).toBe(0);
  });
});

describe('Lead Scoring EF - Category Multiplier', () => {
  it('should score enterprise highest', () => {
    expect(scoreCategoryFactor('enterprise')).toBe(15); // 15 * 1.3 / 1.3 = 15
  });

  it('should score subscription at ~13', () => {
    expect(scoreCategoryFactor('subscription')).toBe(Math.round((15 * 1.1) / 1.3));
  });

  it('should score one-time at ~10', () => {
    expect(scoreCategoryFactor('one-time')).toBe(Math.round((15 * 0.9) / 1.3));
  });

  it('should score trial lowest at ~8', () => {
    expect(scoreCategoryFactor('trial')).toBe(Math.round((15 * 0.7) / 1.3));
  });

  it('should default multiplier to 1 for unknown category', () => {
    expect(scoreCategoryFactor('unknown')).toBe(Math.round(15 / 1.3));
  });
});

describe('Lead Scoring EF - Recent Activity', () => {
  it('should score 15 for 5+ tasks', () => {
    expect(scoreRecentActivity(5).score).toBe(15);
    expect(scoreRecentActivity(20).score).toBe(15);
  });

  it('should score 12 for 3-4 tasks', () => {
    expect(scoreRecentActivity(3).score).toBe(12);
    expect(scoreRecentActivity(4).score).toBe(12);
  });

  it('should score 8 for 1-2 tasks', () => {
    expect(scoreRecentActivity(1).score).toBe(8);
    expect(scoreRecentActivity(2).score).toBe(8);
  });

  it('should score 3 for 0 tasks', () => {
    expect(scoreRecentActivity(0).score).toBe(3);
  });
});

describe('Lead Scoring EF - Total Score', () => {
  it('should sum all factors', () => {
    const factors: ScoringFactors = {
      dealValue: 25,
      stageProgress: 18,
      timeInPipeline: 20,
      category: 15,
      recentActivity: 15,
    };
    expect(calculateTotal(factors)).toBe(93);
  });

  it('should cap at 100', () => {
    const factors: ScoringFactors = {
      dealValue: 25,
      stageProgress: 25,
      timeInPipeline: 20,
      category: 15,
      recentActivity: 15,
    };
    expect(calculateTotal(factors)).toBe(100);
  });

  it('should calculate minimum possible score', () => {
    const factors: ScoringFactors = {
      dealValue: 5,
      stageProgress: 3,
      timeInPipeline: 0,
      category: 8,
      recentActivity: 3,
    };
    expect(calculateTotal(factors)).toBe(19);
  });

  it('should handle a realistic mid-range deal', () => {
    // 15k deal, proposta stage, 10 days, subscription, 2 tasks
    const factors: ScoringFactors = {
      dealValue: 15,
      stageProgress: 13,
      timeInPipeline: 15,
      category: Math.round((15 * 1.1) / 1.3),
      recentActivity: 8,
    };
    const total = calculateTotal(factors);
    expect(total).toBeGreaterThan(50);
    expect(total).toBeLessThan(80);
  });
});
