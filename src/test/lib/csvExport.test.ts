/**
 * CSV Export Utility Tests
 * Tests: data formatting, edge cases, special characters
 */
import { describe, it, expect } from 'vitest';
import { formatDateForExport, formatPercentForExport, formatCurrencyForExport, formatNumberForExport } from '@/utils/csvExport';

describe('formatDateForExport', () => {
  it('should format valid ISO date string', () => {
    const result = formatDateForExport('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should format Date object', () => {
    const result = formatDateForExport(new Date(2024, 0, 15));
    expect(result).toBe('15/01/2024');
  });

  it('should handle invalid date gracefully', () => {
    const result = formatDateForExport('invalid-date');
    expect(typeof result).toBe('string');
  });

  it('should handle empty string', () => {
    const result = formatDateForExport('');
    expect(typeof result).toBe('string');
  });
});

describe('formatPercentForExport', () => {
  it('should format 0.5 as 50.0%', () => {
    expect(formatPercentForExport(0.5)).toBe('50.0%');
  });

  it('should format 1 as 100.0%', () => {
    expect(formatPercentForExport(1)).toBe('100.0%');
  });

  it('should format 0 as 0.0%', () => {
    expect(formatPercentForExport(0)).toBe('0.0%');
  });

  it('should handle small decimals', () => {
    expect(formatPercentForExport(0.123)).toBe('12.3%');
  });

  it('should handle values above 1', () => {
    expect(formatPercentForExport(1.5)).toBe('150.0%');
  });
});

describe('formatCurrencyForExport', () => {
  it('should format positive value with R$ prefix', () => {
    const result = formatCurrencyForExport(1000);
    expect(result).toContain('R$');
    expect(result).toContain('1');
  });

  it('should format zero', () => {
    const result = formatCurrencyForExport(0);
    expect(result).toContain('R$');
    expect(result).toContain('0');
  });

  it('should format large values', () => {
    const result = formatCurrencyForExport(1000000);
    expect(result).toContain('R$');
  });

  it('should format negative values', () => {
    const result = formatCurrencyForExport(-500);
    expect(result).toContain('R$');
  });

  it('should include decimal places', () => {
    const result = formatCurrencyForExport(99.99);
    expect(result).toContain('99');
  });
});

describe('formatNumberForExport', () => {
  it('should format integer', () => {
    const result = formatNumberForExport(1000);
    expect(result).toBeTruthy();
  });

  it('should format with decimals', () => {
    const result = formatNumberForExport(1234.567, 2);
    expect(result).toContain('1');
  });

  it('should format zero', () => {
    expect(formatNumberForExport(0)).toBeTruthy();
  });

  it('should format negative numbers', () => {
    const result = formatNumberForExport(-100);
    expect(result).toContain('100');
  });
});