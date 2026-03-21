/**
 * Deal Velocity & Forecast Logic Tests
 * Tests: velocity calculation, bottleneck detection, probability adjustments
 */
import { describe, it, expect } from 'vitest';

describe('Deal Velocity - Stage Duration', () => {
  const calculateStageDuration = (enteredAt: string, exitedAt: string): number => {
    const entered = new Date(enteredAt);
    const exited = new Date(exitedAt);
    return Math.max(0.1, (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
  };

  it('should calculate days between dates', () => {
    const days = calculateStageDuration('2024-01-01T00:00:00Z', '2024-01-08T00:00:00Z');
    expect(days).toBeCloseTo(7, 1);
  });

  it('should handle same day (minimum 0.1)', () => {
    const days = calculateStageDuration('2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');
    expect(days).toBe(0.1);
  });

  it('should handle fractional days', () => {
    const days = calculateStageDuration('2024-01-01T00:00:00Z', '2024-01-01T12:00:00Z');
    expect(days).toBeCloseTo(0.5, 1);
  });
});

describe('Deal Velocity - Bottleneck Detection', () => {
  const BOTTLENECK_THRESHOLD = 14;

  const detectBottlenecks = (stages: { stage: string; avgDays: number }[]) => {
    return stages
      .filter(s => s.avgDays > BOTTLENECK_THRESHOLD)
      .map(s => s.stage);
  };

  it('should detect stages over 14 days', () => {
    const stages = [
      { stage: 'lead', avgDays: 5 },
      { stage: 'proposal', avgDays: 20 },
      { stage: 'negotiation', avgDays: 15 },
    ];
    const bottlenecks = detectBottlenecks(stages);
    expect(bottlenecks).toContain('proposal');
    expect(bottlenecks).toContain('negotiation');
    expect(bottlenecks).not.toContain('lead');
  });

  it('should return empty for fast pipeline', () => {
    const stages = [
      { stage: 'lead', avgDays: 3 },
      { stage: 'proposal', avgDays: 7 },
    ];
    expect(detectBottlenecks(stages)).toHaveLength(0);
  });

  it('should handle empty stages', () => {
    expect(detectBottlenecks([])).toHaveLength(0);
  });
});

describe('Weighted Forecast - Probability Adjustments', () => {
  const adjustProbability = (
    baseProbability: number,
    leadScore: number | null,
    daysInStage: number
  ): number => {
    let probability = baseProbability;

    // Adjust based on lead score
    if (leadScore !== null) {
      const scoreMultiplier = leadScore > 70 ? 1.2 : leadScore > 40 ? 1.0 : 0.8;
      probability = Math.min(0.95, probability * scoreMultiplier);
    }

    // Penalize stagnant deals
    if (daysInStage > 60) {
      probability *= 0.5;
    } else if (daysInStage > 30) {
      probability *= 0.8;
    }

    return Math.round(probability * 100) / 100;
  };

  it('should boost probability for high lead score', () => {
    const base = adjustProbability(0.5, null, 5);
    const boosted = adjustProbability(0.5, 80, 5);
    expect(boosted).toBeGreaterThan(base);
  });

  it('should reduce probability for low lead score', () => {
    const base = adjustProbability(0.5, null, 5);
    const reduced = adjustProbability(0.5, 20, 5);
    expect(reduced).toBeLessThan(base);
  });

  it('should penalize stagnant deals (>30 days)', () => {
    const fresh = adjustProbability(0.5, null, 10);
    const stagnant = adjustProbability(0.5, null, 45);
    expect(stagnant).toBeLessThan(fresh);
  });

  it('should heavily penalize very stagnant deals (>60 days)', () => {
    const mod = adjustProbability(0.5, null, 45);
    const severe = adjustProbability(0.5, null, 90);
    expect(severe).toBeLessThan(mod);
  });

  it('should cap probability at 0.95', () => {
    const result = adjustProbability(0.9, 100, 1);
    expect(result).toBeLessThanOrEqual(0.95);
  });

  it('should not modify for null lead score and fresh deal', () => {
    expect(adjustProbability(0.5, null, 5)).toBe(0.5);
  });
});

describe('Weighted Forecast - Confidence Score', () => {
  const calculateConfidence = (
    dealCount: number,
    weightedForecast: number,
    scoredRatio: number,
    goalAttainment: number
  ): number => {
    return Math.min(100, Math.round(
      (dealCount > 0 ? 20 : 0) +
      (weightedForecast > 0 ? 30 : 0) +
      scoredRatio * 30 +
      goalAttainment * 20
    ));
  };

  it('should return 0 for no data', () => {
    expect(calculateConfidence(0, 0, 0, 0)).toBe(0);
  });

  it('should max at 100', () => {
    expect(calculateConfidence(10, 50000, 1, 1.5)).toBe(100);
  });

  it('should give 20 points for having deals', () => {
    expect(calculateConfidence(1, 0, 0, 0)).toBe(20);
  });

  it('should give 50 points for deals + forecast', () => {
    expect(calculateConfidence(1, 10000, 0, 0)).toBe(50);
  });

  it('should reward scored deals', () => {
    const noScores = calculateConfidence(10, 10000, 0, 0);
    const allScored = calculateConfidence(10, 10000, 1, 0);
    expect(allScored).toBeGreaterThan(noScores);
  });
});

describe('Projected Revenue Calculation', () => {
  const projectRevenue = (currentRevenue: number, dayOfMonth: number, daysInMonth: number): number => {
    if (dayOfMonth <= 0) return currentRevenue;
    const dailyRate = currentRevenue / dayOfMonth;
    return Math.round(currentRevenue + dailyRate * (daysInMonth - dayOfMonth));
  };

  it('should project based on daily rate', () => {
    // R$100k in 15 days, 30 days in month → R$200k projected
    expect(projectRevenue(100000, 15, 30)).toBe(200000);
  });

  it('should return current revenue at end of month', () => {
    expect(projectRevenue(100000, 30, 30)).toBe(100000);
  });

  it('should project high at month start', () => {
    // R$10k in 1 day, 30 days → R$300k projected
    expect(projectRevenue(10000, 1, 30)).toBe(300000);
  });

  it('should handle zero revenue', () => {
    expect(projectRevenue(0, 15, 30)).toBe(0);
  });

  it('should handle day 0 edge case', () => {
    expect(projectRevenue(0, 0, 30)).toBe(0);
  });
});
