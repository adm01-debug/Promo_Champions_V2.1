/**
 * Deal Probability Calculation Tests
 * Tests: stage scoring, value scoring, time decay, engagement scoring
 */
import { describe, it, expect } from 'vitest';

describe('Deal Probability - Stage Score', () => {
  const calculateStageScore = (status: string): number => {
    const scores: Record<string, number> = {
      pending: 30, completed: 100, cancelled: 0,
      lead: 10, prospecting: 20, qualified: 40,
      proposal: 60, negotiation: 75, won: 100, lost: 0,
    };
    return scores[status] ?? 20;
  };

  it('should return 100 for won/completed', () => {
    expect(calculateStageScore('won')).toBe(100);
    expect(calculateStageScore('completed')).toBe(100);
  });

  it('should return 0 for lost/cancelled', () => {
    expect(calculateStageScore('lost')).toBe(0);
    expect(calculateStageScore('cancelled')).toBe(0);
  });

  it('should increase through pipeline stages', () => {
    const lead = calculateStageScore('lead');
    const qualified = calculateStageScore('qualified');
    const proposal = calculateStageScore('proposal');
    const negotiation = calculateStageScore('negotiation');
    expect(lead).toBeLessThan(qualified);
    expect(qualified).toBeLessThan(proposal);
    expect(proposal).toBeLessThan(negotiation);
  });

  it('should default to 20 for unknown stages', () => {
    expect(calculateStageScore('unknown')).toBe(20);
    expect(calculateStageScore('')).toBe(20);
  });
});

describe('Deal Probability - Value Score', () => {
  const calculateValueScore = (value: number): number => {
    return Math.min(value / 1000, 100);
  };

  it('should scale linearly', () => {
    expect(calculateValueScore(1000)).toBe(1);
    expect(calculateValueScore(50000)).toBe(50);
  });

  it('should cap at 100', () => {
    expect(calculateValueScore(100000)).toBe(100);
    expect(calculateValueScore(500000)).toBe(100);
  });

  it('should handle zero', () => {
    expect(calculateValueScore(0)).toBe(0);
  });
});

describe('Deal Probability - Time Decay Score', () => {
  const calculateTimeScore = (createdAt: string): number => {
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(100 - days * 2, 0);
  };

  it('should start at ~100 for today', () => {
    const score = calculateTimeScore(new Date().toISOString());
    expect(score).toBeGreaterThanOrEqual(99);
  });

  it('should decay by 2 per day', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
    const score = calculateTimeScore(tenDaysAgo);
    expect(score).toBeCloseTo(80, 0);
  });

  it('should floor at 0 after 50 days', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    expect(calculateTimeScore(sixtyDaysAgo)).toBe(0);
  });
});

describe('Deal Probability - Engagement Score', () => {
  const calculateEngagementScore = (activityCount: number): number => {
    return Math.min(activityCount * 5, 100);
  };

  it('should scale by 5x', () => {
    expect(calculateEngagementScore(1)).toBe(5);
    expect(calculateEngagementScore(10)).toBe(50);
  });

  it('should cap at 100', () => {
    expect(calculateEngagementScore(20)).toBe(100);
    expect(calculateEngagementScore(50)).toBe(100);
  });

  it('should return 0 for no activities', () => {
    expect(calculateEngagementScore(0)).toBe(0);
  });
});

describe('Deal Probability - Overall Calculation', () => {
  const calculateProbability = (factors: Record<string, number>): number => {
    const values = Object.values(factors);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  it('should average all factors', () => {
    expect(calculateProbability({ stage: 60, value: 40, time: 80, engagement: 20 })).toBe(50);
  });

  it('should return 100 for max factors', () => {
    expect(calculateProbability({ stage: 100, value: 100, time: 100, engagement: 100 })).toBe(100);
  });

  it('should return 0 for min factors', () => {
    expect(calculateProbability({ stage: 0, value: 0, time: 0, engagement: 0 })).toBe(0);
  });
});
