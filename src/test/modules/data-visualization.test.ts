/**
 * Data Visualization & Chart Helpers Tests
 * Tests: chart data formatting, color generation, tooltip formatting, axis labels
 */
import { describe, it, expect } from 'vitest';

describe('Chart - Color Palette Generation', () => {
  const generatePalette = (count: number): string[] => {
    const baseColors = [
      'hsl(210, 70%, 55%)', 'hsl(150, 60%, 45%)', 'hsl(350, 65%, 55%)',
      'hsl(45, 80%, 50%)', 'hsl(280, 60%, 55%)', 'hsl(195, 70%, 50%)',
      'hsl(15, 75%, 55%)', 'hsl(120, 50%, 45%)', 'hsl(260, 55%, 50%)',
      'hsl(30, 70%, 50%)',
    ];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  };

  it('should generate requested count', () => {
    expect(generatePalette(5)).toHaveLength(5);
  });

  it('should cycle colors for large counts', () => {
    const palette = generatePalette(15);
    expect(palette).toHaveLength(15);
    expect(palette[0]).toBe(palette[10]);
  });

  it('should handle single color', () => {
    expect(generatePalette(1)).toHaveLength(1);
  });
});

describe('Chart - Tooltip Formatting', () => {
  const formatTooltipValue = (value: number, type: 'currency' | 'percent' | 'number'): string => {
    if (type === 'currency') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (type === 'percent') return `${value.toFixed(1)}%`;
    return value.toLocaleString('pt-BR');
  };

  it('should format currency', () => {
    expect(formatTooltipValue(15000, 'currency')).toContain('R$');
    expect(formatTooltipValue(15000, 'currency')).toContain('15');
  });

  it('should format percent', () => {
    expect(formatTooltipValue(85.5, 'percent')).toBe('85.5%');
  });

  it('should format number', () => {
    expect(formatTooltipValue(1500, 'number')).toContain('1.500');
  });
});

describe('Chart - Axis Label Generation', () => {
  const generateYAxisTicks = (maxValue: number, tickCount: number = 5): number[] => {
    const step = Math.ceil(maxValue / tickCount / 1000) * 1000;
    return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
  };

  it('should generate evenly spaced ticks', () => {
    const ticks = generateYAxisTicks(50000, 5);
    expect(ticks).toHaveLength(6);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(50000);
  });

  it('should round to thousands', () => {
    const ticks = generateYAxisTicks(7500, 5);
    ticks.forEach(t => expect(t % 1000).toBe(0));
  });
});

describe('Chart - Date Label Formatting', () => {
  const formatChartDate = (dateStr: string, granularity: 'day' | 'week' | 'month'): string => {
    const d = new Date(dateStr);
    if (granularity === 'day') return `${d.getDate()}/${d.getMonth() + 1}`;
    if (granularity === 'week') return `Sem ${Math.ceil(d.getDate() / 7)}`;
    return d.toLocaleString('pt-BR', { month: 'short' });
  };

  it('should format daily labels', () => {
    expect(formatChartDate('2024-03-15', 'day')).toBe('15/3');
  });

  it('should format weekly labels', () => {
    expect(formatChartDate('2024-03-15', 'week')).toBe('Sem 3');
  });

  it('should format monthly labels', () => {
    const result = formatChartDate('2024-03-15', 'month');
    expect(result).toBeTruthy();
  });
});

describe('Chart - Data Normalization', () => {
  const normalizeData = (values: number[]): number[] => {
    if (values.length === 0) return [];
    const max = Math.max(...values);
    if (max === 0) return values.map(() => 0);
    return values.map(v => Math.round((v / max) * 100));
  };

  it('should normalize to 0-100 range', () => {
    const normalized = normalizeData([25, 50, 100]);
    expect(normalized).toEqual([25, 50, 100]);
  });

  it('should handle all zeros', () => {
    expect(normalizeData([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('should handle empty', () => {
    expect(normalizeData([])).toEqual([]);
  });

  it('should handle equal values', () => {
    expect(normalizeData([50, 50, 50])).toEqual([100, 100, 100]);
  });
});

describe('Chart - Legend Truncation', () => {
  const truncateLabel = (label: string, maxLength: number = 15): string => {
    return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
  };

  it('should not truncate short labels', () => {
    expect(truncateLabel('Short')).toBe('Short');
  });

  it('should truncate long labels', () => {
    expect(truncateLabel('This is a very long label name')).toBe('This is a ve...');
    expect(truncateLabel('This is a very long label name').length).toBe(15);
  });

  it('should handle exact length', () => {
    expect(truncateLabel('123456789012345')).toBe('123456789012345');
  });
});

describe('Chart - Sparkline Data Preparation', () => {
  const prepareSparkline = (values: number[], maxPoints: number = 7): number[] => {
    if (values.length <= maxPoints) return values;
    const step = Math.floor(values.length / maxPoints);
    return Array.from({ length: maxPoints }, (_, i) => values[i * step]);
  };

  it('should return all values if under max', () => {
    expect(prepareSparkline([1, 2, 3], 7)).toEqual([1, 2, 3]);
  });

  it('should downsample large datasets', () => {
    const data = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(prepareSparkline(data, 7)).toHaveLength(7);
  });
});
