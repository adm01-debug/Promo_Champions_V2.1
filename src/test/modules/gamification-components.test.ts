/**
 * Gamification Components Logic Tests
 * Tests: XP bar calculations, level badge, streak counter, progress ring
 */
import { describe, it, expect } from 'vitest';

describe('XP Bar - Progress Calculation', () => {
  const calculateXPProgress = (currentXP: number, levelMinXP: number, levelMaxXP: number): number => {
    const range = levelMaxXP - levelMinXP;
    if (range <= 0) return 100;
    return Math.min(100, Math.round(((currentXP - levelMinXP) / range) * 100));
  };

  it('should calculate 0% at level start', () => {
    expect(calculateXPProgress(1000, 1000, 2000)).toBe(0);
  });

  it('should calculate 50% at midpoint', () => {
    expect(calculateXPProgress(1500, 1000, 2000)).toBe(50);
  });

  it('should calculate 100% at level end', () => {
    expect(calculateXPProgress(2000, 1000, 2000)).toBe(100);
  });

  it('should cap at 100% if over', () => {
    expect(calculateXPProgress(2500, 1000, 2000)).toBe(100);
  });

  it('should return 100% for zero range', () => {
    expect(calculateXPProgress(100, 100, 100)).toBe(100);
  });
});

describe('Level Badge - Level from XP', () => {
  const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

  const getLevelFromXP = (xp: number): number => {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  };

  it('should return level 1 for 0 XP', () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it('should return level 2 for 100 XP', () => {
    expect(getLevelFromXP(100)).toBe(2);
  });

  it('should handle max level', () => {
    expect(getLevelFromXP(10000)).toBe(11);
  });

  it('should handle in-between XP', () => {
    expect(getLevelFromXP(450)).toBe(3); // Between 300 and 600
  });
});

describe('Streak Counter - Display Logic', () => {
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    if (streak >= 1) return '✨';
    return '';
  };

  it('should return empty for 0', () => {
    expect(getStreakEmoji(0)).toBe('');
  });

  it('should return ✨ for 1-2', () => {
    expect(getStreakEmoji(1)).toBe('✨');
    expect(getStreakEmoji(2)).toBe('✨');
  });

  it('should return ⚡ for 3-6', () => {
    expect(getStreakEmoji(3)).toBe('⚡');
    expect(getStreakEmoji(6)).toBe('⚡');
  });

  it('should return 🔥 for 7-13', () => {
    expect(getStreakEmoji(7)).toBe('🔥');
    expect(getStreakEmoji(13)).toBe('🔥');
  });

  it('should return 🔥🔥 for 14-29', () => {
    expect(getStreakEmoji(14)).toBe('🔥🔥');
  });

  it('should return 🔥🔥🔥 for 30+', () => {
    expect(getStreakEmoji(30)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(100)).toBe('🔥🔥🔥');
  });
});

describe('Progress Ring - SVG Calculation', () => {
  const calculateStrokeDasharray = (progress: number, circumference: number): string => {
    const filled = (progress / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  };

  it('should calculate 0% progress', () => {
    expect(calculateStrokeDasharray(0, 100)).toBe('0 100');
  });

  it('should calculate 50% progress', () => {
    expect(calculateStrokeDasharray(50, 100)).toBe('50 50');
  });

  it('should calculate 100% progress', () => {
    expect(calculateStrokeDasharray(100, 100)).toBe('100 0');
  });
});

describe('Achievement Card - Rarity Colors', () => {
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
    };
    return colors[rarity] || 'text-gray-400';
  };

  it('should return correct colors', () => {
    expect(getRarityColor('common')).toBe('text-gray-400');
    expect(getRarityColor('legendary')).toBe('text-yellow-400');
    expect(getRarityColor('epic')).toBe('text-purple-400');
  });

  it('should default to gray for unknown', () => {
    expect(getRarityColor('unknown')).toBe('text-gray-400');
  });
});

describe('Leaderboard - Rank Formatting', () => {
  const getRankBadge = (rank: number): { emoji: string; label: string } => {
    if (rank === 1) return { emoji: '🥇', label: '1º Lugar' };
    if (rank === 2) return { emoji: '🥈', label: '2º Lugar' };
    if (rank === 3) return { emoji: '🥉', label: '3º Lugar' };
    return { emoji: '', label: `${rank}º Lugar` };
  };

  it('should format top 3 with medals', () => {
    expect(getRankBadge(1).emoji).toBe('🥇');
    expect(getRankBadge(2).emoji).toBe('🥈');
    expect(getRankBadge(3).emoji).toBe('🥉');
  });

  it('should format positions without medals', () => {
    expect(getRankBadge(4).emoji).toBe('');
    expect(getRankBadge(4).label).toBe('4º Lugar');
  });
});
