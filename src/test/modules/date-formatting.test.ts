/**
 * Date Formatting & Manipulation Tests
 * Tests: date-fns wrappers, locale handling, edge cases
 */
import { describe, it, expect } from 'vitest';
import { format, subDays, addDays, isAfter, isBefore, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

describe('Date Formatting with ptBR locale', () => {
  it('should format date in Brazilian format', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(format(date, 'dd/MM/yyyy')).toBe('15/01/2024');
  });

  it('should format with month name in Portuguese', () => {
    const date = new Date(2024, 0, 15);
    const result = format(date, 'MMMM', { locale: ptBR });
    expect(result).toBe('janeiro');
  });

  it('should format datetime with hours', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    expect(format(date, 'dd/MM/yyyy HH:mm')).toBe('15/01/2024 14:30');
  });

  it('should handle ISO string dates', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    const formatted = format(date, 'dd/MM/yyyy');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('Date Arithmetic', () => {
  const today = new Date();

  it('should subtract days correctly', () => {
    const result = subDays(today, 7);
    expect(differenceInDays(today, result)).toBe(7);
  });

  it('should add days correctly', () => {
    const result = addDays(today, 30);
    expect(differenceInDays(result, today)).toBe(30);
  });

  it('should compare dates with isAfter/isBefore', () => {
    const yesterday = subDays(today, 1);
    const tomorrow = addDays(today, 1);
    expect(isAfter(tomorrow, today)).toBe(true);
    expect(isBefore(yesterday, today)).toBe(true);
  });

  it('should get start/end of month', () => {
    const date = new Date(2024, 5, 15); // June 15
    expect(format(startOfMonth(date), 'dd')).toBe('01');
    expect(format(endOfMonth(date), 'dd')).toBe('30');
  });

  it('should handle leap year', () => {
    const feb2024 = new Date(2024, 1, 1); // Feb 1, 2024 (leap year)
    expect(format(endOfMonth(feb2024), 'dd')).toBe('29');
  });

  it('should handle non-leap year', () => {
    const feb2023 = new Date(2023, 1, 1); // Feb 1, 2023
    expect(format(endOfMonth(feb2023), 'dd')).toBe('28');
  });
});

describe('Report Date Ranges', () => {
  it('should calculate 7-day range', () => {
    const end = new Date();
    const start = subDays(end, 7);
    expect(differenceInDays(end, start)).toBe(7);
  });

  it('should calculate 30-day range', () => {
    const end = new Date();
    const start = subDays(end, 30);
    expect(differenceInDays(end, start)).toBe(30);
  });

  it('should calculate 90-day range', () => {
    const end = new Date();
    const start = subDays(end, 90);
    expect(differenceInDays(end, start)).toBe(90);
  });
});