/**
 * Business Calculations Tests
 * Tests: commissions, quotas, forecasting, pipeline math
 */
import { describe, it, expect } from 'vitest';

describe('Commission Tiers', () => {
  const calculateTieredCommission = (revenue: number): number => {
    if (revenue <= 0) return 0;
    if (revenue <= 50000) return revenue * 0.05;
    if (revenue <= 100000) return 50000 * 0.05 + (revenue - 50000) * 0.08;
    return 50000 * 0.05 + 50000 * 0.08 + (revenue - 100000) * 0.12;
  };

  it('should return 0 for 0 revenue', () => {
    expect(calculateTieredCommission(0)).toBe(0);
  });

  it('should return 0 for negative revenue', () => {
    expect(calculateTieredCommission(-1000)).toBe(0);
  });

  it('should calculate tier 1 correctly (5%)', () => {
    expect(calculateTieredCommission(10000)).toBe(500);
    expect(calculateTieredCommission(50000)).toBe(2500);
  });

  it('should calculate tier 2 correctly (8%)', () => {
    // 50000 * 5% + 25000 * 8% = 2500 + 2000 = 4500
    expect(calculateTieredCommission(75000)).toBe(4500);
  });

  it('should calculate tier 3 correctly (12%)', () => {
    // 50000 * 5% + 50000 * 8% + 50000 * 12% = 2500 + 4000 + 6000 = 12500
    expect(calculateTieredCommission(150000)).toBe(12500);
  });
});

describe('Goal Attainment', () => {
  const calculateAttainment = (actual: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.round((actual / target) * 100);
  };

  it('should return 100 when met exactly', () => {
    expect(calculateAttainment(100000, 100000)).toBe(100);
  });

  it('should return 0 for no actual', () => {
    expect(calculateAttainment(0, 100000)).toBe(0);
  });

  it('should handle overachievement', () => {
    expect(calculateAttainment(150000, 100000)).toBe(150);
  });

  it('should return 0 for zero target', () => {
    expect(calculateAttainment(50000, 0)).toBe(0);
  });

  it('should handle partial attainment', () => {
    expect(calculateAttainment(75000, 100000)).toBe(75);
  });
});

describe('Pipeline Velocity', () => {
  const calculateVelocity = (
    numDeals: number,
    avgDealSize: number,
    winRate: number,
    avgCycleDays: number
  ): number => {
    if (avgCycleDays <= 0) return 0;
    return (numDeals * avgDealSize * winRate) / avgCycleDays;
  };

  it('should calculate correctly', () => {
    // 10 deals * R$5000 * 30% / 30 days = R$500/day
    expect(calculateVelocity(10, 5000, 0.3, 30)).toBe(500);
  });

  it('should return 0 for no deals', () => {
    expect(calculateVelocity(0, 5000, 0.3, 30)).toBe(0);
  });

  it('should return 0 for zero cycle days', () => {
    expect(calculateVelocity(10, 5000, 0.3, 0)).toBe(0);
  });

  it('should return 0 for zero win rate', () => {
    expect(calculateVelocity(10, 5000, 0, 30)).toBe(0);
  });

  it('should increase with more deals', () => {
    const v1 = calculateVelocity(10, 5000, 0.3, 30);
    const v2 = calculateVelocity(20, 5000, 0.3, 30);
    expect(v2).toBeGreaterThan(v1);
  });
});

describe('Weighted Forecast', () => {
  const calculateWeightedForecast = (
    deals: { amount: number; probability: number }[]
  ): number => {
    return deals.reduce((sum, deal) => sum + deal.amount * deal.probability, 0);
  };

  it('should calculate weighted sum', () => {
    const deals = [
      { amount: 10000, probability: 0.8 },
      { amount: 5000, probability: 0.5 },
      { amount: 20000, probability: 0.2 },
    ];
    // 8000 + 2500 + 4000 = 14500
    expect(calculateWeightedForecast(deals)).toBe(14500);
  });

  it('should return 0 for empty pipeline', () => {
    expect(calculateWeightedForecast([])).toBe(0);
  });

  it('should return full amount at 100%', () => {
    expect(calculateWeightedForecast([{ amount: 10000, probability: 1 }])).toBe(10000);
  });

  it('should return 0 at 0%', () => {
    expect(calculateWeightedForecast([{ amount: 10000, probability: 0 }])).toBe(0);
  });
});

describe('Average Ticket Calculation', () => {
  const calculateAvgTicket = (totalRevenue: number, numSales: number): number => {
    if (numSales <= 0) return 0;
    return totalRevenue / numSales;
  };

  it('should calculate correctly', () => {
    expect(calculateAvgTicket(100000, 20)).toBe(5000);
  });

  it('should return 0 for zero sales', () => {
    expect(calculateAvgTicket(100000, 0)).toBe(0);
  });

  it('should handle single sale', () => {
    expect(calculateAvgTicket(5000, 1)).toBe(5000);
  });

  it('should handle fractional results', () => {
    const result = calculateAvgTicket(10000, 3);
    expect(result).toBeCloseTo(3333.33, 1);
  });
});

describe('Conversion Rate', () => {
  const calculateConversionRate = (won: number, total: number): number => {
    if (total <= 0) return 0;
    return (won / total) * 100;
  };

  it('should calculate percentage', () => {
    expect(calculateConversionRate(30, 100)).toBe(30);
  });

  it('should return 0 for no deals', () => {
    expect(calculateConversionRate(0, 0)).toBe(0);
  });

  it('should return 100 for all won', () => {
    expect(calculateConversionRate(10, 10)).toBe(100);
  });

  it('should handle zero won', () => {
    expect(calculateConversionRate(0, 50)).toBe(0);
  });
});