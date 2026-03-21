/**
 * Demand Forecast & Inventory Logic Tests
 * Tests: stock movement, reorder logic, risk classification, trend detection
 */
import { describe, it, expect } from 'vitest';

describe('Inventory - Stock Movement', () => {
  const applyMovement = (currentStock: number, type: 'in' | 'out' | 'adjustment', quantity: number): number => {
    if (type === 'in') return currentStock + quantity;
    if (type === 'out') return Math.max(0, currentStock - quantity);
    return quantity; // adjustment sets absolute
  };

  it('should add stock on "in"', () => {
    expect(applyMovement(100, 'in', 50)).toBe(150);
  });

  it('should remove stock on "out"', () => {
    expect(applyMovement(100, 'out', 30)).toBe(70);
  });

  it('should not go below 0 on "out"', () => {
    expect(applyMovement(10, 'out', 50)).toBe(0);
  });

  it('should set absolute on "adjustment"', () => {
    expect(applyMovement(100, 'adjustment', 75)).toBe(75);
  });

  it('should handle zero stock', () => {
    expect(applyMovement(0, 'in', 10)).toBe(10);
    expect(applyMovement(0, 'out', 10)).toBe(0);
  });
});

describe('Inventory - Reorder Point', () => {
  const needsReorder = (currentStock: number, reorderPoint: number): boolean => {
    return currentStock <= reorderPoint;
  };

  it('should trigger reorder at threshold', () => {
    expect(needsReorder(20, 20)).toBe(true);
  });

  it('should trigger below threshold', () => {
    expect(needsReorder(10, 20)).toBe(true);
  });

  it('should not trigger above threshold', () => {
    expect(needsReorder(50, 20)).toBe(false);
  });
});

describe('Demand Forecast - Risk Classification', () => {
  const classifyRisk = (currentStock: number, predictedDemand30d: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (predictedDemand30d <= 0) return 'low';
    const coverageDays = (currentStock / predictedDemand30d) * 30;
    if (coverageDays < 7) return 'critical';
    if (coverageDays < 15) return 'high';
    if (coverageDays < 30) return 'medium';
    return 'low';
  };

  it('should be critical if <7 days coverage', () => {
    expect(classifyRisk(5, 30)).toBe('critical');
  });

  it('should be high if <15 days coverage', () => {
    expect(classifyRisk(10, 30)).toBe('high');
  });

  it('should be medium if <30 days coverage', () => {
    expect(classifyRisk(20, 30)).toBe('medium');
  });

  it('should be low if 30+ days coverage', () => {
    expect(classifyRisk(50, 30)).toBe('low');
  });

  it('should be low for zero demand', () => {
    expect(classifyRisk(100, 0)).toBe('low');
  });
});

describe('Demand Forecast - Trend Detection', () => {
  const detectTrend = (values: number[]): 'increasing' | 'stable' | 'decreasing' => {
    if (values.length < 2) return 'stable';
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((avg2 - avg1) / (avg1 || 1)) * 100;
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  };

  it('should detect increasing trend', () => {
    expect(detectTrend([10, 15, 20, 30, 40, 50])).toBe('increasing');
  });

  it('should detect decreasing trend', () => {
    expect(detectTrend([50, 40, 30, 20, 15, 10])).toBe('decreasing');
  });

  it('should detect stable trend', () => {
    expect(detectTrend([10, 11, 10, 11, 10, 11])).toBe('stable');
  });

  it('should return stable for single value', () => {
    expect(detectTrend([10])).toBe('stable');
  });

  it('should return stable for empty', () => {
    expect(detectTrend([])).toBe('stable');
  });
});

describe('Demand Forecast - Confidence Score', () => {
  const calculateConfidence = (dataPoints: number, variance: number): number => {
    const dataConfidence = Math.min(dataPoints / 30, 1) * 50;
    const varianceConfidence = Math.max(0, (1 - variance / 100)) * 50;
    return Math.round(dataConfidence + varianceConfidence);
  };

  it('should return high confidence for lots of data and low variance', () => {
    expect(calculateConfidence(30, 5)).toBeGreaterThan(90);
  });

  it('should return low confidence for few data points', () => {
    expect(calculateConfidence(5, 50)).toBeLessThan(40);
  });

  it('should return 0 for no data and high variance', () => {
    expect(calculateConfidence(0, 100)).toBe(0);
  });
});

describe('Inventory - Stock Level Validation', () => {
  const validateStockLevels = (min: number, max: number, reorderPoint: number): string[] => {
    const errors: string[] = [];
    if (min < 0) errors.push('Estoque mínimo não pode ser negativo');
    if (max <= min) errors.push('Estoque máximo deve ser maior que o mínimo');
    if (reorderPoint < min) errors.push('Ponto de reposição deve ser >= estoque mínimo');
    if (reorderPoint > max) errors.push('Ponto de reposição deve ser <= estoque máximo');
    return errors;
  };

  it('should pass valid levels', () => {
    expect(validateStockLevels(10, 100, 20)).toHaveLength(0);
  });

  it('should reject negative minimum', () => {
    expect(validateStockLevels(-5, 100, 20)).toContain('Estoque mínimo não pode ser negativo');
  });

  it('should reject max <= min', () => {
    expect(validateStockLevels(50, 50, 50)).toContain('Estoque máximo deve ser maior que o mínimo');
  });

  it('should reject reorder below min', () => {
    expect(validateStockLevels(20, 100, 10)).toContain('Ponto de reposição deve ser >= estoque mínimo');
  });

  it('should reject reorder above max', () => {
    expect(validateStockLevels(10, 50, 60)).toContain('Ponto de reposição deve ser <= estoque máximo');
  });
});
