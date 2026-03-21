/**
 * Inventory & Supply Chain Tests
 * Tests: stock alerts, reorder logic, ABC inventory classification, supplier management
 */
import { describe, it, expect } from 'vitest';

describe('Inventory - Stock Level Alerts', () => {
  const getStockAlert = (current: number, min: number, reorder: number): { level: 'critical' | 'low' | 'normal' | 'overstock'; alert: boolean } => {
    if (current <= 0) return { level: 'critical', alert: true };
    if (current <= min) return { level: 'critical', alert: true };
    if (current <= reorder) return { level: 'low', alert: true };
    if (current > reorder * 3) return { level: 'overstock', alert: false };
    return { level: 'normal', alert: false };
  };

  it('should alert critical at zero', () => {
    expect(getStockAlert(0, 10, 25).level).toBe('critical');
  });

  it('should alert critical below min', () => {
    expect(getStockAlert(5, 10, 25).level).toBe('critical');
  });

  it('should alert low at reorder', () => {
    expect(getStockAlert(20, 10, 25).level).toBe('low');
  });

  it('should be normal', () => {
    expect(getStockAlert(50, 10, 25).level).toBe('normal');
  });

  it('should detect overstock', () => {
    expect(getStockAlert(100, 10, 25).level).toBe('overstock');
  });
});

describe('Inventory - Reorder Quantity', () => {
  const calculateReorderQty = (current: number, max: number, leadTimeDays: number, dailyUsage: number): number => {
    const safetyStock = Math.ceil(leadTimeDays * dailyUsage * 0.5);
    const target = max + safetyStock;
    return Math.max(0, target - current);
  };

  it('should calculate reorder quantity', () => {
    const qty = calculateReorderQty(20, 100, 7, 5);
    expect(qty).toBeGreaterThan(0);
    expect(qty).toBeLessThanOrEqual(200);
  });

  it('should return 0 when overstocked', () => {
    expect(calculateReorderQty(200, 100, 7, 5)).toBe(0);
  });
});

describe('Inventory - Coverage Days', () => {
  const calculateCoverageDays = (currentStock: number, avgDailySales: number): number => {
    if (avgDailySales <= 0) return Infinity;
    return Math.floor(currentStock / avgDailySales);
  };

  it('should calculate days of coverage', () => {
    expect(calculateCoverageDays(100, 10)).toBe(10);
  });

  it('should handle zero sales', () => {
    expect(calculateCoverageDays(100, 0)).toBe(Infinity);
  });

  it('should handle zero stock', () => {
    expect(calculateCoverageDays(0, 10)).toBe(0);
  });
});

describe('Inventory - ABC Classification', () => {
  const classifyABC = (items: { id: string; revenue: number }[]): Map<string, 'A' | 'B' | 'C'> => {
    const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sorted.reduce((s, i) => s + i.revenue, 0);
    const result = new Map<string, 'A' | 'B' | 'C'>();
    let cumulative = 0;
    sorted.forEach(item => {
      cumulative += item.revenue;
      const pct = (cumulative / totalRevenue) * 100;
      if (pct <= 80) result.set(item.id, 'A');
      else if (pct <= 95) result.set(item.id, 'B');
      else result.set(item.id, 'C');
    });
    return result;
  };

  it('should classify high-revenue as A', () => {
    const items = [
      { id: 'p1', revenue: 50000 },
      { id: 'p2', revenue: 30000 },
      { id: 'p3', revenue: 10000 },
      { id: 'p4', revenue: 5000 },
      { id: 'p5', revenue: 5000 },
    ];
    const classified = classifyABC(items);
    expect(classified.get('p1')).toBe('A');
    expect(classified.get('p5')).toBe('C');
  });
});

describe('Supplier - Lead Time Tracking', () => {
  const calculateAvgLeadTime = (orders: { orderedAt: string; deliveredAt: string }[]): number => {
    if (orders.length === 0) return 0;
    const totalDays = orders.reduce((sum, o) => {
      return sum + (new Date(o.deliveredAt).getTime() - new Date(o.orderedAt).getTime()) / 86400000;
    }, 0);
    return Math.round(totalDays / orders.length);
  };

  it('should calculate average lead time', () => {
    const orders = [
      { orderedAt: '2024-01-01', deliveredAt: '2024-01-08' },
      { orderedAt: '2024-02-01', deliveredAt: '2024-02-11' },
    ];
    expect(calculateAvgLeadTime(orders)).toBe(9); // (7+10)/2
  });

  it('should handle empty orders', () => {
    expect(calculateAvgLeadTime([])).toBe(0);
  });
});
