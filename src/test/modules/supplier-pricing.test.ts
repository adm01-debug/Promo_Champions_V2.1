/**
 * Supplier & Price Comparison Tests
 * Tests: price comparison, savings calculation, alert thresholds
 */
import { describe, it, expect } from 'vitest';

describe('Price Comparison - Find Best Price', () => {
  const findBestPrice = (prices: { supplier: string; price: number }[]) => {
    if (prices.length === 0) return null;
    return prices.reduce((best, p) => p.price < best.price ? p : best, prices[0]);
  };

  it('should find lowest price', () => {
    const prices = [
      { supplier: 'A', price: 100 },
      { supplier: 'B', price: 80 },
      { supplier: 'C', price: 120 },
    ];
    expect(findBestPrice(prices)?.supplier).toBe('B');
  });

  it('should handle single supplier', () => {
    expect(findBestPrice([{ supplier: 'A', price: 50 }])?.price).toBe(50);
  });

  it('should return null for empty', () => {
    expect(findBestPrice([])).toBeNull();
  });
});

describe('Price Comparison - Savings Calculation', () => {
  const calculateSavings = (currentPrice: number, bestPrice: number): { amount: number; percent: number } => {
    const amount = currentPrice - bestPrice;
    const percent = currentPrice > 0 ? Math.round((amount / currentPrice) * 100) : 0;
    return { amount, percent };
  };

  it('should calculate savings amount and percent', () => {
    const savings = calculateSavings(100, 80);
    expect(savings.amount).toBe(20);
    expect(savings.percent).toBe(20);
  });

  it('should handle no savings', () => {
    const savings = calculateSavings(80, 80);
    expect(savings.amount).toBe(0);
    expect(savings.percent).toBe(0);
  });

  it('should handle negative savings (more expensive)', () => {
    const savings = calculateSavings(80, 100);
    expect(savings.amount).toBe(-20);
  });
});

describe('Price Alert - Significant Change Detection', () => {
  const isSignificantChange = (oldPrice: number, newPrice: number, threshold: number = 5): boolean => {
    if (oldPrice <= 0) return false;
    const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;
    return changePercent > threshold;
  };

  it('should detect >5% increase', () => {
    expect(isSignificantChange(100, 110)).toBe(true);
  });

  it('should detect >5% decrease', () => {
    expect(isSignificantChange(100, 90)).toBe(true);
  });

  it('should not alert for small changes', () => {
    expect(isSignificantChange(100, 103)).toBe(false);
  });

  it('should handle zero old price', () => {
    expect(isSignificantChange(0, 100)).toBe(false);
  });

  it('should support custom threshold', () => {
    expect(isSignificantChange(100, 108, 10)).toBe(false);
    expect(isSignificantChange(100, 112, 10)).toBe(true);
  });
});

describe('Price Alert - Type Classification', () => {
  const classifyAlert = (oldPrice: number, newPrice: number): 'price_drop' | 'price_increase' => {
    return newPrice < oldPrice ? 'price_drop' : 'price_increase';
  };

  it('should classify drops', () => {
    expect(classifyAlert(100, 80)).toBe('price_drop');
  });

  it('should classify increases', () => {
    expect(classifyAlert(80, 100)).toBe('price_increase');
  });

  it('should classify equal as increase', () => {
    expect(classifyAlert(100, 100)).toBe('price_increase');
  });
});

describe('Price History - Change Percentage', () => {
  const calculateChangePercent = (oldPrice: number, newPrice: number): number => {
    if (oldPrice <= 0) return 0;
    return Math.round(((newPrice - oldPrice) / oldPrice) * 100 * 10) / 10;
  };

  it('should calculate positive change', () => {
    expect(calculateChangePercent(100, 120)).toBe(20);
  });

  it('should calculate negative change', () => {
    expect(calculateChangePercent(100, 80)).toBe(-20);
  });

  it('should handle zero old price', () => {
    expect(calculateChangePercent(0, 100)).toBe(0);
  });

  it('should round to 1 decimal', () => {
    expect(calculateChangePercent(3, 1)).toBe(-66.7);
  });
});

describe('Supplier Rating', () => {
  const calculateRating = (metrics: {
    priceCompetitiveness: number; // 0-1
    deliveryReliability: number; // 0-1
    qualityScore: number; // 0-1
  }): number => {
    return Math.round(
      (metrics.priceCompetitiveness * 40 +
       metrics.deliveryReliability * 35 +
       metrics.qualityScore * 25)
    ) / 10;
  };

  it('should calculate weighted score', () => {
    const rating = calculateRating({
      priceCompetitiveness: 0.8,
      deliveryReliability: 0.9,
      qualityScore: 0.7,
    });
    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(10);
  });

  it('should return max for perfect scores', () => {
    expect(calculateRating({
      priceCompetitiveness: 1,
      deliveryReliability: 1,
      qualityScore: 1,
    })).toBe(10);
  });

  it('should return 0 for zero scores', () => {
    expect(calculateRating({
      priceCompetitiveness: 0,
      deliveryReliability: 0,
      qualityScore: 0,
    })).toBe(0);
  });
});
