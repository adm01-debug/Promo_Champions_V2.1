/**
 * Gamification Module Tests
 * Tests: XP levels, titles, progress calculation, formatting
 */
import { describe, it, expect } from 'vitest';
import { getLevelFromXP, getXPForNextLevel, formatXP, LEVELS } from '@/lib/gamification';

describe('getLevelFromXP', () => {
  it('should return level 1 for 0 XP', () => {
    const result = getLevelFromXP(0);
    expect(result.level).toBe(1);
    expect(result.title).toBe('Iniciante');
    expect(result.emoji).toBe('🌱');
  });

  it('should return level 1 for XP below 100', () => {
    expect(getLevelFromXP(50).level).toBe(1);
    expect(getLevelFromXP(99).level).toBe(1);
  });

  it('should return level 2 for XP exactly 100', () => {
    expect(getLevelFromXP(100).level).toBe(2);
    expect(getLevelFromXP(100).title).toBe('Aprendiz');
  });

  it('should return level 2 for XP 200', () => {
    expect(getLevelFromXP(200).level).toBe(2);
  });

  it('should return correct levels at boundaries', () => {
    expect(getLevelFromXP(300).level).toBe(3);
    expect(getLevelFromXP(600).level).toBe(4);
    expect(getLevelFromXP(1000).level).toBe(5);
    expect(getLevelFromXP(1500).level).toBe(6);
    expect(getLevelFromXP(2100).level).toBe(7);
    expect(getLevelFromXP(2800).level).toBe(8);
    expect(getLevelFromXP(3600).level).toBe(9);
    expect(getLevelFromXP(4500).level).toBe(10);
  });

  it('should return max level for very high XP', () => {
    const result = getLevelFromXP(50000);
    expect(result.level).toBe(20);
    expect(result.title).toBe('Onipotente');
  });

  it('should calculate progress correctly at 50% through level', () => {
    // Level 1: 0-100, midpoint = 50
    const result = getLevelFromXP(50);
    expect(result.progressPercent).toBe(50);
  });

  it('should return 0% progress at level start', () => {
    const result = getLevelFromXP(100); // Start of level 2
    expect(result.progressPercent).toBe(0);
  });

  it('should cap progress at 100% for max level', () => {
    const result = getLevelFromXP(999999);
    expect(result.progressPercent).toBeLessThanOrEqual(100);
  });

  it('should return negative XP as level 1', () => {
    const result = getLevelFromXP(-10);
    expect(result.level).toBe(1);
  });

  it('should handle all 20 level titles', () => {
    const titles = LEVELS.map(l => l.title);
    expect(titles).toHaveLength(20);
    expect(new Set(titles).size).toBe(20); // All unique
  });

  it('should have emojis for all levels', () => {
    LEVELS.forEach(level => {
      expect(level.emoji).toBeTruthy();
    });
  });

  it('should have contiguous XP ranges', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXP).toBe(LEVELS[i - 1].maxXP);
    }
  });
});

describe('getXPForNextLevel', () => {
  it('should return 100 for 0 XP (need 100 to reach level 2)', () => {
    expect(getXPForNextLevel(0)).toBe(100);
  });

  it('should return 50 for 50 XP', () => {
    expect(getXPForNextLevel(50)).toBe(50);
  });

  it('should return correct XP needed at level boundary', () => {
    expect(getXPForNextLevel(100)).toBe(200); // Level 2: 100-300
  });

  it('should handle high XP values', () => {
    const result = getXPForNextLevel(19000);
    expect(result).toBe(Infinity);
  });
});

describe('formatXP', () => {
  it('should format small numbers as-is', () => {
    expect(formatXP(0)).toBe('0');
    expect(formatXP(500)).toBe('500');
    expect(formatXP(999)).toBe('999');
  });

  it('should format 1000+ as k notation', () => {
    expect(formatXP(1000)).toBe('1.0k');
    expect(formatXP(1500)).toBe('1.5k');
    expect(formatXP(2500)).toBe('2.5k');
  });

  it('should format 10000+ correctly', () => {
    expect(formatXP(10000)).toBe('10.0k');
    expect(formatXP(15300)).toBe('15.3k');
  });
});