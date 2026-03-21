/**
 * ABC Analysis Logic Tests
 * Tests: classification algorithm, edge cases, sorting
 */
import { describe, it, expect } from 'vitest';

describe('ABC Classification Algorithm', () => {
  type ABCClass = 'A' | 'B' | 'C';

  interface ABCItem {
    name: string;
    revenue: number;
    percentage: number;
    cumulativePercentage: number;
    classification: ABCClass;
  }

  function classifyABC(items: { name: string; revenue: number }[]): ABCItem[] {
    const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sorted.reduce((sum, i) => sum + i.revenue, 0);
    if (totalRevenue === 0) return [];

    let cumulative = 0;
    return sorted.map(item => {
      cumulative += item.revenue;
      const percentage = (item.revenue / totalRevenue) * 100;
      const cumulativePercentage = (cumulative / totalRevenue) * 100;
      const classification: ABCClass =
        cumulativePercentage <= 80 ? 'A' :
        cumulativePercentage <= 95 ? 'B' : 'C';

      return { name: item.name, revenue: item.revenue, percentage, cumulativePercentage, classification };
    });
  }

  it('should classify items by revenue contribution', () => {
    const items = [
      { name: 'Product A', revenue: 50000 },
      { name: 'Product B', revenue: 30000 },
      { name: 'Product C', revenue: 10000 },
      { name: 'Product D', revenue: 5000 },
      { name: 'Product E', revenue: 3000 },
      { name: 'Product F', revenue: 2000 },
    ];
    const result = classifyABC(items);
    
    // Should be sorted by revenue descending
    expect(result[0].name).toBe('Product A');
    expect(result[0].classification).toBe('A');
    
    // A items should be top ~80%
    const aItems = result.filter(i => i.classification === 'A');
    expect(aItems.length).toBeGreaterThan(0);
    expect(aItems.length).toBeLessThan(result.length);
  });

  it('should return empty for zero revenue', () => {
    const result = classifyABC([{ name: 'A', revenue: 0 }]);
    expect(result).toEqual([]);
  });

  it('should handle single item (100% cumulative = C)', () => {
    const result = classifyABC([{ name: 'Only', revenue: 1000 }]);
    expect(result).toHaveLength(1);
    // Single item at 100% cumulative is > 95%, so classified as C
    expect(result[0].classification).toBe('C');
    expect(result[0].percentage).toBe(100);
    expect(result[0].cumulativePercentage).toBe(100);
  });

  it('should handle equal revenues', () => {
    const items = [
      { name: 'A', revenue: 100 },
      { name: 'B', revenue: 100 },
      { name: 'C', revenue: 100 },
      { name: 'D', revenue: 100 },
      { name: 'E', revenue: 100 },
    ];
    const result = classifyABC(items);
    expect(result).toHaveLength(5);
    // Each is 20%, cumulative: 20, 40, 60, 80, 100
    expect(result[3].classification).toBe('A'); // cumulative 80%
    expect(result[4].classification).toBe('B'); // cumulative 100%
  });

  it('should have cumulative percentage reach 100', () => {
    const items = [
      { name: 'A', revenue: 500 },
      { name: 'B', revenue: 300 },
      { name: 'C', revenue: 200 },
    ];
    const result = classifyABC(items);
    expect(result[result.length - 1].cumulativePercentage).toBeCloseTo(100, 1);
  });

  it('should sort by revenue descending', () => {
    const items = [
      { name: 'C', revenue: 100 },
      { name: 'A', revenue: 500 },
      { name: 'B', revenue: 300 },
    ];
    const result = classifyABC(items);
    expect(result[0].name).toBe('A');
    expect(result[1].name).toBe('B');
    expect(result[2].name).toBe('C');
  });

  it('Pareto: ~20% items should account for ~80% revenue', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      name: `Item ${i}`,
      revenue: Math.pow(100 - i, 2), // Power law distribution
    }));
    const result = classifyABC(items);
    const aItems = result.filter(i => i.classification === 'A');
    // With power law, A items should be roughly 20-40% of total
    expect(aItems.length).toBeLessThan(60);
    expect(aItems.length).toBeGreaterThan(5);
  });
});

describe('ABC Summary Counting', () => {
  it('should count by classification', () => {
    const items = [
      { classification: 'A' as const },
      { classification: 'A' as const },
      { classification: 'B' as const },
      { classification: 'C' as const },
      { classification: 'C' as const },
      { classification: 'C' as const },
    ];
    const summary = {
      A: items.filter(i => i.classification === 'A').length,
      B: items.filter(i => i.classification === 'B').length,
      C: items.filter(i => i.classification === 'C').length,
    };
    expect(summary.A).toBe(2);
    expect(summary.B).toBe(1);
    expect(summary.C).toBe(3);
  });

  it('should handle all same classification', () => {
    const items = Array(5).fill({ classification: 'A' as const });
    expect(items.filter(i => i.classification === 'A').length).toBe(5);
  });
});
