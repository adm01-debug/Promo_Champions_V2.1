/**
 * Forecast & Analytics Tests
 * Tests: weighted forecast, confidence intervals, trend projection, scenario analysis
 */
import { describe, it, expect } from 'vitest';

describe('Weighted Forecast', () => {
  const calculateWeightedForecast = (deals: { value: number; probability: number }[]): number => {
    return Math.round(deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0));
  };

  it('should weight by probability', () => {
    const deals = [
      { value: 10000, probability: 80 },
      { value: 20000, probability: 50 },
      { value: 5000, probability: 90 },
    ];
    expect(calculateWeightedForecast(deals)).toBe(22500);
  });

  it('should return 0 for empty', () => {
    expect(calculateWeightedForecast([])).toBe(0);
  });

  it('should handle 100% probability', () => {
    expect(calculateWeightedForecast([{ value: 5000, probability: 100 }])).toBe(5000);
  });

  it('should handle 0% probability', () => {
    expect(calculateWeightedForecast([{ value: 5000, probability: 0 }])).toBe(0);
  });
});

describe('Confidence Intervals', () => {
  const calculateInterval = (forecast: number, confidence: number): { low: number; high: number } => {
    const margin = forecast * ((100 - confidence) / 100);
    return {
      low: Math.round(forecast - margin),
      high: Math.round(forecast + margin),
    };
  };

  it('should calculate 80% confidence interval', () => {
    const interval = calculateInterval(100000, 80);
    expect(interval.low).toBe(80000);
    expect(interval.high).toBe(120000);
  });

  it('should be exact at 100% confidence', () => {
    const interval = calculateInterval(100000, 100);
    expect(interval.low).toBe(100000);
    expect(interval.high).toBe(100000);
  });

  it('should be widest at 0% confidence', () => {
    const interval = calculateInterval(100000, 0);
    expect(interval.low).toBe(0);
    expect(interval.high).toBe(200000);
  });
});

describe('Trend Projection', () => {
  const linearProjection = (values: number[], periods: number): number[] => {
    if (values.length < 2) return Array(periods).fill(values[0] || 0);
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((s, v, i) => s + i * v, 0);
    const sumX2 = values.reduce((s, _, i) => s + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return Array.from({ length: periods }, (_, i) => Math.round(intercept + slope * (n + i)));
  };

  it('should project upward trend', () => {
    const projection = linearProjection([100, 200, 300, 400], 3);
    expect(projection[0]).toBeGreaterThan(400);
    expect(projection[2]).toBeGreaterThan(projection[0]);
  });

  it('should project flat trend', () => {
    const projection = linearProjection([100, 100, 100, 100], 2);
    expect(projection[0]).toBe(100);
  });

  it('should handle single value', () => {
    expect(linearProjection([100], 3)).toEqual([100, 100, 100]);
  });
});

describe('Scenario Analysis', () => {
  const createScenario = (base: number, modifier: number): { optimistic: number; realistic: number; pessimistic: number } => {
    return {
      optimistic: Math.round(base * (1 + modifier)),
      realistic: base,
      pessimistic: Math.round(base * (1 - modifier)),
    };
  };

  it('should create 3 scenarios with 20% variance', () => {
    const scenario = createScenario(100000, 0.2);
    expect(scenario.optimistic).toBe(120000);
    expect(scenario.realistic).toBe(100000);
    expect(scenario.pessimistic).toBe(80000);
  });

  it('should handle zero base', () => {
    const scenario = createScenario(0, 0.2);
    expect(scenario.optimistic).toBe(0);
    expect(scenario.pessimistic).toBe(0);
  });
});

describe('Revenue Velocity', () => {
  const calculateVelocity = (revenue: number, daysInPeriod: number): number => {
    return daysInPeriod > 0 ? Math.round(revenue / daysInPeriod) : 0;
  };

  const projectMonthEnd = (currentRevenue: number, daysPassed: number, totalDays: number): number => {
    if (daysPassed <= 0) return 0;
    const dailyRate = currentRevenue / daysPassed;
    return Math.round(dailyRate * totalDays);
  };

  it('should calculate daily velocity', () => {
    expect(calculateVelocity(150000, 15)).toBe(10000);
  });

  it('should project month end', () => {
    expect(projectMonthEnd(150000, 15, 30)).toBe(300000);
  });

  it('should handle zero days', () => {
    expect(calculateVelocity(100000, 0)).toBe(0);
    expect(projectMonthEnd(100000, 0, 30)).toBe(0);
  });
});

describe('Goal Achievement Probability', () => {
  const calculateAchievementProbability = (current: number, goal: number, daysLeft: number, dailyAvg: number): number => {
    if (goal <= 0) return 100;
    const remaining = goal - current;
    if (remaining <= 0) return 100;
    const projected = current + dailyAvg * daysLeft;
    const ratio = projected / goal;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  };

  it('should be 100% if already achieved', () => {
    expect(calculateAchievementProbability(100000, 80000, 10, 5000)).toBe(100);
  });

  it('should calculate based on projection', () => {
    const prob = calculateAchievementProbability(50000, 100000, 10, 5000);
    expect(prob).toBe(100); // 50000 + 50000 = 100000
  });

  it('should be low if behind pace', () => {
    const prob = calculateAchievementProbability(10000, 100000, 5, 1000);
    expect(prob).toBeLessThan(50);
  });
});
