
import { expect, test, describe } from 'vitest';
import { calculateLevelFromXP, LEVEL_THRESHOLDS } from '../useSalespersonXP';

describe('Gamification Engine - XP & Leveling', () => {
  test('Level 1: 0 XP should be level 1', () => {
    const result = calculateLevelFromXP(0);
    expect(result.level).toBe(1);
    expect(result.progress).toBe(0);
  });

  test('Level 2 boundary: 100 XP should be exactly level 2', () => {
    const result = calculateLevelFromXP(100);
    expect(result.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  test('In-between level 1 and 2: 50 XP should be level 1 with 50% progress', () => {
    const result = calculateLevelFromXP(50);
    expect(result.level).toBe(1);
    expect(result.progress).toBe(50);
  });

  test('Mid-range level: 5000 XP should be exactly level 10', () => {
    const result = calculateLevelFromXP(5000);
    expect(result.level).toBe(10);
    expect(result.progress).toBe(0);
  });

  test('High level progress: 4750 XP should be level 9 with 80%+ progress', () => {
    const result = calculateLevelFromXP(4740); // 3700 (L9) -> 5000 (L10). Range = 1300. XP in L9 = 1040. 1040/1300 = 0.8
    const result_val = calculateLevelFromXP(4740);
    expect(result_val.level).toBe(9);
    expect(result_val.progress).toBeCloseTo(80, 1);
  });

  test('Max level: 75000 XP should be level 20', () => {
    const result = calculateLevelFromXP(75000);
    expect(result.level).toBe(20);
    expect(result.progress).toBe(100);
  });

  test('Beyond max level: 1,000,000 XP should still be level 20 with 100% progress', () => {
    const result = calculateLevelFromXP(1000000);
    expect(result.level).toBe(20);
    expect(result.progress).toBe(100);
  });

  test('Monte Carlo Simulation: 1000 random XP values should result in valid levels', () => {
    for (let i = 0; i < 1000; i++) {
      const randomXP = Math.floor(Math.random() * 200000);
      const result = calculateLevelFromXP(randomXP);
      expect(result.level).toBeGreaterThanOrEqual(1);
      expect(result.level).toBeLessThanOrEqual(20);
      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(100);
    }
  });
});
