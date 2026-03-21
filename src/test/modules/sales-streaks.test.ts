/**
 * Sales Streaks Logic Tests
 * Tests: XP multiplier, streak sorting, streak data structure
 */
import { describe, it, expect } from 'vitest';

describe('Sales Streaks - XP Multiplier', () => {
  const getMultiplier = (streak: number): number => {
    if (streak >= 10) return 3.0;
    if (streak >= 5) return 2.0;
    if (streak >= 2) return 1.5;
    return 1.0;
  };

  it('should return 1.0 for no streak', () => {
    expect(getMultiplier(0)).toBe(1.0);
    expect(getMultiplier(1)).toBe(1.0);
  });

  it('should return 1.5 for 2-4 streak', () => {
    expect(getMultiplier(2)).toBe(1.5);
    expect(getMultiplier(4)).toBe(1.5);
  });

  it('should return 2.0 for 5-9 streak', () => {
    expect(getMultiplier(5)).toBe(2.0);
    expect(getMultiplier(9)).toBe(2.0);
  });

  it('should return 3.0 for 10+ streak', () => {
    expect(getMultiplier(10)).toBe(3.0);
    expect(getMultiplier(50)).toBe(3.0);
  });
});

describe('Sales Streaks - Sorting', () => {
  it('should sort by current streak descending', () => {
    const streaks = [
      { name: 'A', current_streak: 3 },
      { name: 'B', current_streak: 10 },
      { name: 'C', current_streak: 1 },
      { name: 'D', current_streak: 7 },
    ];
    const sorted = [...streaks].sort((a, b) => b.current_streak - a.current_streak);
    expect(sorted[0].name).toBe('B');
    expect(sorted[1].name).toBe('D');
    expect(sorted[2].name).toBe('A');
    expect(sorted[3].name).toBe('C');
  });
});

describe('Sales Streaks - Data Validation', () => {
  interface SalesStreak {
    id: string;
    salesperson_id: string;
    salesperson_name: string;
    current_streak: number;
    longest_streak: number;
    xp_multiplier: number;
  }

  const createStreak = (currentStreak: number, longestStreak: number): SalesStreak => {
    const multiplier = currentStreak >= 10 ? 3.0 :
      currentStreak >= 5 ? 2.0 :
      currentStreak >= 2 ? 1.5 : 1.0;
    return {
      id: 'test',
      salesperson_id: 'sp-1',
      salesperson_name: 'Test',
      current_streak: currentStreak,
      longest_streak: Math.max(longestStreak, currentStreak),
      xp_multiplier: multiplier,
    };
  };

  it('should ensure longest >= current', () => {
    const streak = createStreak(5, 3);
    expect(streak.longest_streak).toBeGreaterThanOrEqual(streak.current_streak);
  });

  it('should keep longest when higher', () => {
    const streak = createStreak(3, 10);
    expect(streak.longest_streak).toBe(10);
  });

  it('should set correct multiplier', () => {
    expect(createStreak(0, 0).xp_multiplier).toBe(1.0);
    expect(createStreak(3, 3).xp_multiplier).toBe(1.5);
    expect(createStreak(7, 7).xp_multiplier).toBe(2.0);
    expect(createStreak(15, 15).xp_multiplier).toBe(3.0);
  });
});

describe('Sales Streaks - Streak Calculation from Dates', () => {
  const calculateStreak = (saleDates: string[]): number => {
    if (saleDates.length === 0) return 0;
    const sorted = [...saleDates]
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = (sorted[i].getTime() - sorted[i + 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  it('should count consecutive days', () => {
    const dates = ['2024-01-03', '2024-01-02', '2024-01-01'];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('should break on gaps', () => {
    const dates = ['2024-01-05', '2024-01-03', '2024-01-02'];
    expect(calculateStreak(dates)).toBe(1);
  });

  it('should handle single date', () => {
    expect(calculateStreak(['2024-01-01'])).toBe(1);
  });

  it('should handle empty array', () => {
    expect(calculateStreak([])).toBe(0);
  });
});
