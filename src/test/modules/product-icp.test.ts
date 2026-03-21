/**
 * Product & ICP (Ideal Customer Profile) Tests
 * Tests: product catalog, ICP matching, scoring, categorization
 */
import { describe, it, expect } from 'vitest';

describe('Product Catalog - Search', () => {
  const searchProducts = (products: { name: string; category: string }[], query: string) => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  };

  const products = [
    { name: 'CRM Enterprise', category: 'Software' },
    { name: 'Suporte Premium', category: 'Serviço' },
    { name: 'CRM Starter', category: 'Software' },
  ];

  it('should search by name', () => {
    expect(searchProducts(products, 'CRM')).toHaveLength(2);
  });

  it('should search by category', () => {
    expect(searchProducts(products, 'serviço')).toHaveLength(1);
  });

  it('should return all for empty', () => {
    expect(searchProducts(products, '')).toHaveLength(3);
  });
});

describe('Product - Price Tiers', () => {
  const getPriceTier = (price: number): string => {
    if (price >= 50000) return 'enterprise';
    if (price >= 10000) return 'professional';
    if (price >= 1000) return 'standard';
    return 'starter';
  };

  it('should classify tiers correctly', () => {
    expect(getPriceTier(100000)).toBe('enterprise');
    expect(getPriceTier(25000)).toBe('professional');
    expect(getPriceTier(5000)).toBe('standard');
    expect(getPriceTier(500)).toBe('starter');
  });
});

describe('ICP - Match Score Calculation', () => {
  type ICPCriteria = {
    minEmployees: number;
    maxEmployees: number;
    minCapital: number;
    targetSectors: string[];
  };

  const calculateICPScore = (
    company: { employees: number; capital: number; sector: string },
    criteria: ICPCriteria
  ): number => {
    let score = 0;
    const maxScore = 100;

    // Employee count (40 points)
    if (company.employees >= criteria.minEmployees && company.employees <= criteria.maxEmployees) {
      score += 40;
    } else if (company.employees >= criteria.minEmployees * 0.5) {
      score += 20;
    }

    // Capital (30 points)
    if (company.capital >= criteria.minCapital) {
      score += 30;
    } else if (company.capital >= criteria.minCapital * 0.5) {
      score += 15;
    }

    // Sector match (30 points)
    if (criteria.targetSectors.includes(company.sector)) {
      score += 30;
    }

    return Math.min(maxScore, score);
  };

  const criteria: ICPCriteria = {
    minEmployees: 50,
    maxEmployees: 500,
    minCapital: 1000000,
    targetSectors: ['tecnologia', 'saúde', 'educação'],
  };

  it('should score perfect match', () => {
    expect(calculateICPScore(
      { employees: 200, capital: 5000000, sector: 'tecnologia' },
      criteria
    )).toBe(100);
  });

  it('should score partial match', () => {
    const score = calculateICPScore(
      { employees: 200, capital: 300000, sector: 'varejo' },
      criteria
    );
    expect(score).toBe(55); // 40 (employees) + 15 (partial capital)
  });

  it('should score low for poor match', () => {
    const score = calculateICPScore(
      { employees: 5, capital: 10000, sector: 'varejo' },
      criteria
    );
    expect(score).toBeLessThan(20);
  });
});

describe('ICP - Classification', () => {
  const classifyICPMatch = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Forte', color: 'green' };
    if (score >= 50) return { label: 'Moderado', color: 'yellow' };
    if (score >= 25) return { label: 'Fraco', color: 'orange' };
    return { label: 'Fora do ICP', color: 'red' };
  };

  it('should classify correctly', () => {
    expect(classifyICPMatch(90).label).toBe('Forte');
    expect(classifyICPMatch(60).label).toBe('Moderado');
    expect(classifyICPMatch(30).label).toBe('Fraco');
    expect(classifyICPMatch(10).label).toBe('Fora do ICP');
  });
});

describe('Product - Margin Calculation', () => {
  const calculateMargin = (sellPrice: number, costPrice: number): { amount: number; percent: number } => {
    const amount = sellPrice - costPrice;
    const percent = sellPrice > 0 ? Math.round((amount / sellPrice) * 100 * 10) / 10 : 0;
    return { amount, percent };
  };

  it('should calculate margin', () => {
    const margin = calculateMargin(10000, 6000);
    expect(margin.amount).toBe(4000);
    expect(margin.percent).toBe(40);
  });

  it('should handle zero sell price', () => {
    expect(calculateMargin(0, 1000).percent).toBe(0);
  });

  it('should handle negative margin', () => {
    expect(calculateMargin(5000, 7000).amount).toBe(-2000);
  });
});

describe('Product - Bundle Pricing', () => {
  const calculateBundlePrice = (
    items: { price: number; quantity: number }[],
    discountPercent: number
  ): number => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return Math.round(subtotal * (1 - discountPercent / 100));
  };

  it('should apply discount to bundle', () => {
    const items = [
      { price: 1000, quantity: 2 },
      { price: 500, quantity: 3 },
    ];
    expect(calculateBundlePrice(items, 10)).toBe(3150);
  });

  it('should handle no discount', () => {
    expect(calculateBundlePrice([{ price: 100, quantity: 1 }], 0)).toBe(100);
  });

  it('should handle empty bundle', () => {
    expect(calculateBundlePrice([], 10)).toBe(0);
  });
});
