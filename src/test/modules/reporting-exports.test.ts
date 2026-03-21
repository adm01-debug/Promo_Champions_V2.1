/**
 * Reporting & Executive Reports Tests
 * Tests: report generation, data aggregation, chart data preparation, export formatting
 */
import { describe, it, expect } from 'vitest';

describe('Report - Monthly Aggregation', () => {
  const aggregateByMonth = (data: { date: string; value: number }[]): Map<string, number> => {
    const map = new Map<string, number>();
    data.forEach(d => {
      const month = d.date.substring(0, 7); // YYYY-MM
      map.set(month, (map.get(month) || 0) + d.value);
    });
    return map;
  };

  it('should group by month', () => {
    const data = [
      { date: '2024-01-05', value: 100 },
      { date: '2024-01-20', value: 200 },
      { date: '2024-02-10', value: 300 },
    ];
    const agg = aggregateByMonth(data);
    expect(agg.get('2024-01')).toBe(300);
    expect(agg.get('2024-02')).toBe(300);
  });

  it('should handle empty data', () => {
    expect(aggregateByMonth([]).size).toBe(0);
  });
});

describe('Report - Top N Items', () => {
  const getTopN = <T extends { value: number }>(items: T[], n: number): T[] => {
    return [...items].sort((a, b) => b.value - a.value).slice(0, n);
  };

  it('should return top 3', () => {
    const items = [
      { name: 'A', value: 10 },
      { name: 'B', value: 50 },
      { name: 'C', value: 30 },
      { name: 'D', value: 20 },
      { name: 'E', value: 40 },
    ];
    const top = getTopN(items, 3);
    expect(top).toHaveLength(3);
    expect(top[0].value).toBe(50);
    expect(top[2].value).toBe(30);
  });

  it('should handle n > items length', () => {
    expect(getTopN([{ value: 10 }], 5)).toHaveLength(1);
  });
});

describe('Report - Percentage Distribution', () => {
  const calculateDistribution = (items: { label: string; value: number }[]): { label: string; percent: number }[] => {
    const total = items.reduce((s, i) => s + i.value, 0);
    if (total <= 0) return items.map(i => ({ label: i.label, percent: 0 }));
    return items.map(i => ({ label: i.label, percent: Math.round((i.value / total) * 1000) / 10 }));
  };

  it('should calculate percentages', () => {
    const dist = calculateDistribution([
      { label: 'Produto A', value: 50 },
      { label: 'Produto B', value: 30 },
      { label: 'Produto C', value: 20 },
    ]);
    expect(dist[0].percent).toBe(50);
    expect(dist[1].percent).toBe(30);
    expect(dist[2].percent).toBe(20);
  });

  it('should handle zero total', () => {
    const dist = calculateDistribution([{ label: 'A', value: 0 }]);
    expect(dist[0].percent).toBe(0);
  });
});

describe('Report - YoY Comparison', () => {
  const calculateYoY = (currentYear: number, previousYear: number): { change: number; direction: string } => {
    if (previousYear <= 0) return { change: 0, direction: 'flat' };
    const change = Math.round(((currentYear - previousYear) / previousYear) * 100 * 10) / 10;
    return {
      change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    };
  };

  it('should calculate growth', () => {
    const result = calculateYoY(1200000, 1000000);
    expect(result.change).toBe(20);
    expect(result.direction).toBe('up');
  });

  it('should calculate decline', () => {
    const result = calculateYoY(800000, 1000000);
    expect(result.change).toBe(-20);
    expect(result.direction).toBe('down');
  });

  it('should handle zero previous', () => {
    expect(calculateYoY(100000, 0).direction).toBe('flat');
  });
});

describe('Report - Table Data Formatting', () => {
  const formatTableRow = (row: Record<string, any>, columns: { key: string; format?: 'currency' | 'percent' | 'number' }[]): string[] => {
    return columns.map(col => {
      const value = row[col.key];
      if (col.format === 'currency') return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      if (col.format === 'percent') return `${value}%`;
      return String(value ?? '-');
    });
  };

  it('should format currency', () => {
    const row = formatTableRow({ revenue: 15000 }, [{ key: 'revenue', format: 'currency' }]);
    expect(row[0]).toContain('R$');
    expect(row[0]).toContain('15');
  });

  it('should format percent', () => {
    const row = formatTableRow({ rate: 85 }, [{ key: 'rate', format: 'percent' }]);
    expect(row[0]).toBe('85%');
  });

  it('should handle missing values', () => {
    const row = formatTableRow({}, [{ key: 'missing' }]);
    expect(row[0]).toBe('-');
  });
});

describe('Report - Summary Statistics', () => {
  const calculateSummary = (values: number[]): { min: number; max: number; avg: number; median: number; total: number } => {
    if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0, total: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const total = values.reduce((a, b) => a + b, 0);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(total / values.length),
      median,
      total,
    };
  };

  it('should calculate all summary stats', () => {
    const summary = calculateSummary([10, 20, 30, 40, 50]);
    expect(summary.min).toBe(10);
    expect(summary.max).toBe(50);
    expect(summary.avg).toBe(30);
    expect(summary.median).toBe(30);
    expect(summary.total).toBe(150);
  });

  it('should handle even-length arrays for median', () => {
    expect(calculateSummary([10, 20, 30, 40]).median).toBe(25);
  });

  it('should handle empty', () => {
    expect(calculateSummary([]).total).toBe(0);
  });
});

describe('Report - Period Label Generation', () => {
  const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 90 dias',
      'mtd': 'Mês atual',
      'ytd': 'Ano atual',
    };
    return labels[period] || period;
  };

  it('should return correct labels', () => {
    expect(getPeriodLabel('7d')).toBe('Últimos 7 dias');
    expect(getPeriodLabel('mtd')).toBe('Mês atual');
    expect(getPeriodLabel('ytd')).toBe('Ano atual');
  });

  it('should return raw for unknown', () => {
    expect(getPeriodLabel('custom')).toBe('custom');
  });
});
