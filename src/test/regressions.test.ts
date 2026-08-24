import { describe, it, expect } from 'vitest';
import { buildABCAnalysis } from '@/utils/bi-helpers';
import { getLevelFromXP, getLevelInfo, formatXP, getXPForNextLevel, LEVELS } from '@/lib/gamification';
import { getLocalISODate } from '@/utils/dateHelpers';

describe('Regression: ABC Analysis', () => {
  it('handles empty performance array', () => {
    const result = buildABCAnalysis([]);
    expect(result).toHaveLength(3);
    expect(result[0].count).toBe(0);
    expect(result[1].count).toBe(0);
    expect(result[2].count).toBe(0);
  });

  it('handles zero total revenue', () => {
    const result = buildABCAnalysis([
      { id: '1', name: 'A', avatar_url: null, role: 'sdr', revenue: 0, deals: 0, conversionRate: 0, goalProgress: 0, avgTicket: 0, activities: 0 },
    ]);
    expect(result[0].count).toBe(0); // A
    expect(result[2].count).toBe(1); // C
  });

  it('classifies by Pareto 80/15/5', () => {
    const data = [
      { id: '1', name: 'Top', avatar_url: null, role: 'closer', revenue: 800, deals: 10, conversionRate: 50, goalProgress: 200, avgTicket: 80, activities: 10 },
      { id: '2', name: 'Mid', avatar_url: null, role: 'sdr', revenue: 150, deals: 3, conversionRate: 30, goalProgress: 40, avgTicket: 50, activities: 5 },
      { id: '3', name: 'Low', avatar_url: null, role: 'sdr', revenue: 50, deals: 2, conversionRate: 20, goalProgress: 10, avgTicket: 25, activities: 2 },
    ];
    const result = buildABCAnalysis(data);
    expect(result[0].classification).toBe('A');
    expect(result[1].classification).toBe('B');
    expect(result[2].classification).toBe('C');
    expect(result[0].count).toBeGreaterThanOrEqual(1);
  });
});

describe('Regression: Gamification', () => {
  it('getLevelFromXP returns correct level for XP 0', () => {
    const info = getLevelFromXP(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Iniciante');
  });

  it('getLevelFromXP returns max level for huge XP', () => {
    const info = getLevelFromXP(999999);
    expect(info.level).toBe(20);
  });

  it('getLevelInfo returns correct info by level number', () => {
    const info = getLevelInfo(5);
    expect(info.level).toBe(5);
    expect(info.title).toBe('Proficiente');
    expect(info.emoji).toBe('🔥');
  });

  it('getLevelInfo clamps invalid levels', () => {
    expect(getLevelInfo(0).level).toBe(1);
    expect(getLevelInfo(999).level).toBe(20);
  });

  it('formatXP formats correctly', () => {
    expect(formatXP(500)).toBe('500');
    expect(formatXP(1500)).toBe('1.5k');
    expect(formatXP(10000)).toBe('10.0k');
  });

  it('getXPForNextLevel returns 0 for max level', () => {
    expect(getXPForNextLevel(999999)).toBe(0);
  });

  it('LEVELS has 20 entries', () => {
    expect(LEVELS).toHaveLength(20);
  });
});

describe('Regression: Date Helpers', () => {
  it('getLocalISODate returns valid ISO date string', () => {
    const date = getLocalISODate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
