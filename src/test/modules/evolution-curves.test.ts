/**
 * Evolution Curves & Chart Data Tests
 * Tests: cumulative calculation, date range generation, data filtering
 */
import { describe, it, expect } from 'vitest';

describe('Evolution Curves - Cumulative Revenue', () => {
  const calculateCumulative = (dailyValues: number[]): number[] => {
    let sum = 0;
    return dailyValues.map(v => { sum += v; return sum; });
  };

  it('should accumulate values', () => {
    expect(calculateCumulative([100, 200, 300])).toEqual([100, 300, 600]);
  });

  it('should handle zeros', () => {
    expect(calculateCumulative([100, 0, 0, 200])).toEqual([100, 100, 100, 300]);
  });

  it('should handle empty', () => {
    expect(calculateCumulative([])).toEqual([]);
  });

  it('should handle single value', () => {
    expect(calculateCumulative([500])).toEqual([500]);
  });
});

describe('Evolution Curves - Date Range Generation', () => {
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  it('should generate inclusive date range', () => {
    const range = generateDateRange('2024-01-01', '2024-01-03');
    expect(range).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('should handle single day', () => {
    expect(generateDateRange('2024-01-01', '2024-01-01')).toEqual(['2024-01-01']);
  });

  it('should generate 30 days for a month', () => {
    const range = generateDateRange('2024-01-01', '2024-01-30');
    expect(range).toHaveLength(30);
  });
});

describe('Evolution Curves - Salesperson Filtering', () => {
  const filterPeople = (all: { id: string; name: string }[], selectedIds: string[]) => {
    if (selectedIds.length === 0) return all;
    return all.filter(sp => selectedIds.includes(sp.id));
  };

  it('should return all if no filter', () => {
    const all = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
    expect(filterPeople(all, [])).toHaveLength(2);
  });

  it('should filter by selected IDs', () => {
    const all = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }, { id: '3', name: 'C' }];
    expect(filterPeople(all, ['1', '3'])).toHaveLength(2);
  });

  it('should handle non-existent IDs', () => {
    const all = [{ id: '1', name: 'A' }];
    expect(filterPeople(all, ['99'])).toHaveLength(0);
  });
});

describe('Evolution Curves - Daily Grouping', () => {
  const groupByDay = (sales: { created_at: string; amount: number; salesperson_id: string }[]) => {
    const map = new Map<string, number>();
    sales.forEach(s => {
      const day = s.created_at.split('T')[0];
      map.set(day, (map.get(day) || 0) + s.amount);
    });
    return map;
  };

  it('should group sales by day', () => {
    const sales = [
      { created_at: '2024-01-01T10:00:00Z', amount: 100, salesperson_id: '1' },
      { created_at: '2024-01-01T15:00:00Z', amount: 200, salesperson_id: '1' },
      { created_at: '2024-01-02T10:00:00Z', amount: 300, salesperson_id: '1' },
    ];
    const grouped = groupByDay(sales);
    expect(grouped.get('2024-01-01')).toBe(300);
    expect(grouped.get('2024-01-02')).toBe(300);
  });

  it('should handle empty sales', () => {
    expect(groupByDay([]).size).toBe(0);
  });
});

describe('Evolution Curves - Period Calculation', () => {
  const getStartDate = (periodDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - periodDays);
    return d.toISOString().split('T')[0];
  };

  it('should calculate start date for 30 days', () => {
    const start = getStartDate(30);
    const expected = new Date();
    expected.setDate(expected.getDate() - 30);
    expect(start).toBe(expected.toISOString().split('T')[0]);
  });

  it('should calculate start date for 90 days', () => {
    const start = getStartDate(90);
    const now = new Date();
    const expected = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    expect(start).toBe(expected.toISOString().split('T')[0]);
  });
});
