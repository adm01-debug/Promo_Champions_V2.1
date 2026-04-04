/**
 * Win/Loss Analysis Logic Tests
 * Tests: win rate, reason counting, monthly trends
 */
import { describe, it, expect } from 'vitest';

describe('Win Rate Calculation', () => {
  const calcWinRate = (wins: number, losses: number): number => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  it('should calculate 50% for equal wins/losses', () => {
    expect(calcWinRate(10, 10)).toBe(50);
  });

  it('should calculate 100% for all wins', () => {
    expect(calcWinRate(10, 0)).toBe(100);
  });

  it('should calculate 0% for all losses', () => {
    expect(calcWinRate(0, 10)).toBe(0);
  });

  it('should return 0 for no data', () => {
    expect(calcWinRate(0, 0)).toBe(0);
  });

  it('should round correctly', () => {
    expect(calcWinRate(1, 2)).toBe(33); // 33.33...
    expect(calcWinRate(2, 1)).toBe(67); // 66.66...
  });
});

describe('Reason Counting', () => {
  const countReasons = (items: { reason: string | null }[]) => {
    const map = new Map<string, number>();
    items.forEach(item => {
      const r = item.reason || 'Não informado';
      map.set(r, (map.get(r) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  it('should count and sort reasons by frequency', () => {
    const items = [
      { reason: 'Preço' },
      { reason: 'Preço' },
      { reason: 'Preço' },
      { reason: 'Funcionalidade' },
      { reason: 'Concorrência' },
    ];
    const result = countReasons(items);
    expect(result[0].reason).toBe('Preço');
    expect(result[0].count).toBe(3);
  });

  it('should handle null reasons', () => {
    const items: { reason: string | null }[] = [{ reason: null }, { reason: null }];
    const result = countReasons(items);
    expect(result[0].reason).toBe('Não informado');
    expect(result[0].count).toBe(2);
  });

  it('should limit to top 5', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ reason: `Reason ${i}` }));
    expect(countReasons(items)).toHaveLength(5);
  });

  it('should handle empty array', () => {
    expect(countReasons([])).toHaveLength(0);
  });
});

describe('Monthly Trend Aggregation', () => {
  const aggregateMonthly = (outcomes: { outcome: string; created_at: string }[]) => {
    const map = new Map<string, { wins: number; losses: number }>();
    outcomes.forEach(o => {
      const date = new Date(o.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = map.get(key) || { wins: 0, losses: 0 };
      if (o.outcome === 'won') existing.wins++;
      else existing.losses++;
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  };

  it('should aggregate by month', () => {
    const outcomes = [
      { outcome: 'won', created_at: '2024-01-15T00:00:00Z' },
      { outcome: 'won', created_at: '2024-01-20T00:00:00Z' },
      { outcome: 'lost', created_at: '2024-01-25T00:00:00Z' },
      { outcome: 'won', created_at: '2024-02-10T00:00:00Z' },
    ];
    const result = aggregateMonthly(outcomes);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe('2024-01');
    expect(result[0].wins).toBe(2);
    expect(result[0].losses).toBe(1);
    expect(result[1].month).toBe('2024-02');
    expect(result[1].wins).toBe(1);
  });

  it('should sort chronologically', () => {
    const outcomes = [
      { outcome: 'won', created_at: '2024-03-01T00:00:00Z' },
      { outcome: 'won', created_at: '2024-01-01T00:00:00Z' },
      { outcome: 'won', created_at: '2024-02-01T00:00:00Z' },
    ];
    const result = aggregateMonthly(outcomes);
    expect(result[0].month).toBe('2024-01');
    expect(result[1].month).toBe('2024-02');
    expect(result[2].month).toBe('2024-03');
  });

  it('should limit to last 6 months', () => {
    const outcomes = Array.from({ length: 12 }, (_, i) => ({
      outcome: 'won',
      created_at: `2024-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`,
    }));
    expect(aggregateMonthly(outcomes)).toHaveLength(6);
  });

  it('should handle empty data', () => {
    expect(aggregateMonthly([])).toHaveLength(0);
  });
});
