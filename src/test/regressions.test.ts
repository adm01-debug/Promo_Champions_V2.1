import { describe, it, expect } from 'vitest';
import { computeForecast, computeStreak } from '@/utils/bi-helpers';
import { getXPForNextLevel, getLevelFromXP } from '@/lib/gamification';
import { sanitizeCsvCell } from '@/utils/csvExport';

/**
 * REGRESSION TESTS
 * Add tests for previously fixed bugs here to prevent them from reappearing.
 */
describe('Regression Tests', () => {
  it('computeForecast: confidence is never NaN when team has no goal set', () => {
    const forecast = computeForecast([], 0, 0, 10, 20);
    expect(Number.isNaN(forecast.confidenceLevel)).toBe(false);
    expect(forecast.confidenceLevel).toBe(20);
  });

  it('computeForecast: confidence stays finite when goal is 0 but revenue exists', () => {
    const forecast = computeForecast([], 5000, 0, 10, 20);
    expect(Number.isFinite(forecast.confidenceLevel)).toBe(true);
    expect(forecast.confidenceLevel).toBeLessThanOrEqual(100);
  });

  it('computeStreak: current streak is not capped at 7 days', () => {
    const now = new Date('2024-03-15T12:00:00Z');
    // 10 consecutive days ending today
    const dates: string[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const { currentStreak } = computeStreak(dates, now);
    expect(currentStreak).toBe(10);
  });

  it('getXPForNextLevel: never returns Infinity at the max level', () => {
    const maxLevel = getLevelFromXP(50_000);
    expect(maxLevel.level).toBe(20);
    expect(Number.isFinite(getXPForNextLevel(50_000))).toBe(true);
    expect(getXPForNextLevel(50_000)).toBe(0);
  });

  it('sanitizeCsvCell: neutralizes formula-injection prefixes', () => {
    expect(sanitizeCsvCell('=1+1')).toBe("'=1+1");
    expect(sanitizeCsvCell('+44')).toBe("'+44");
    expect(sanitizeCsvCell('-5')).toBe("'-5");
    expect(sanitizeCsvCell('@cmd')).toBe("'@cmd");
    // Normal values are left untouched
    expect(sanitizeCsvCell('Acme Corp')).toBe('Acme Corp');
    expect(sanitizeCsvCell('1500.50')).toBe('1500.50');
  });
});
