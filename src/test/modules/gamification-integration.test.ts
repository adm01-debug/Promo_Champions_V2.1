/**
 * Gamification Integration Tests
 * Tests: XP flow, level progression, rank systems
 */
import { describe, it, expect } from 'vitest';
import { getLevelFromXP, getXPForNextLevel, formatXP, LEVELS } from '@/lib/gamification';

describe('Gamification - Full Level Progression', () => {
  it('should progress through all levels sequentially', () => {
    let prevLevel = 0;
    LEVELS.forEach(levelDef => {
      const result = getLevelFromXP(levelDef.minXP);
      expect(result.level).toBe(levelDef.level);
      expect(result.level).toBeGreaterThan(prevLevel);
      prevLevel = result.level;
    });
  });

  it('should never skip levels', () => {
    for (let xp = 0; xp <= 20000; xp += 50) {
      const level = getLevelFromXP(xp);
      expect(level.level).toBeGreaterThanOrEqual(1);
      expect(level.level).toBeLessThanOrEqual(20);
    }
  });

  it('should calculate XP needed consistently', () => {
    for (let xp = 0; xp < 19000; xp += 100) {
      const needed = getXPForNextLevel(xp);
      expect(needed).toBeGreaterThan(0);
    }
  });

  it('should have monotonically increasing level requirements', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXP).toBeGreaterThan(LEVELS[i - 1].minXP);
    }
  });
});

describe('Gamification - Ranking Edge Cases', () => {
  it('should handle exact boundary XP values', () => {
    LEVELS.forEach(level => {
      const result = getLevelFromXP(level.minXP);
      expect(result.level).toBe(level.level);
      expect(result.progressPercent).toBe(0);
    });
  });

  it('should handle XP just below boundaries', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const result = getLevelFromXP(LEVELS[i].minXP - 1);
      expect(result.level).toBe(LEVELS[i - 1].level);
    }
  });

  it('should format XP correctly across ranges', () => {
    expect(formatXP(0)).toBe('0');
    expect(formatXP(999)).toBe('999');
    expect(formatXP(1000)).toBe('1.0k');
    expect(formatXP(19999)).toBe('20.0k');
  });
});