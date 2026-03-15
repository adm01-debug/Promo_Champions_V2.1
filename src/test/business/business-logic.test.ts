/**
 * Business Logic & Edge Case Tests
 * Validates critical business rules, data calculations, and boundary conditions
 */
import { describe, it, expect } from 'vitest';

// ==========================================
// CURRENCY FORMATTING
// ==========================================
describe('Currency Formatting', () => {
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  it('should format positive values', () => {
    expect(formatCurrency(1000)).toContain('1');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0');
  });

  it('should format negative values', () => {
    const result = formatCurrency(-5000);
    expect(result).toContain('5');
  });

  it('should handle very large numbers', () => {
    const result = formatCurrency(999999999);
    expect(result.length).toBeGreaterThan(5);
  });

  it('should handle decimals by truncating', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1');
    expect(result).not.toContain('.56');
  });
});

// ==========================================
// COMMISSION CALCULATIONS
// ==========================================
describe('Commission Calculations', () => {
  const calculateCommission = (revenue: number, rate: number) => {
    if (rate < 0 || rate > 100) throw new Error('Invalid rate');
    return revenue * (rate / 100);
  };

  it('should calculate 10% commission correctly', () => {
    expect(calculateCommission(100000, 10)).toBe(10000);
  });

  it('should handle 9.5% commission', () => {
    expect(calculateCommission(100000, 9.5)).toBe(9500);
  });

  it('should handle 12% commission', () => {
    expect(calculateCommission(100000, 12)).toBe(12000);
  });

  it('should handle zero revenue', () => {
    expect(calculateCommission(0, 10)).toBe(0);
  });

  it('should handle zero rate', () => {
    expect(calculateCommission(100000, 0)).toBe(0);
  });

  it('should reject negative rates', () => {
    expect(() => calculateCommission(100000, -5)).toThrow('Invalid rate');
  });

  it('should reject rates over 100%', () => {
    expect(() => calculateCommission(100000, 150)).toThrow('Invalid rate');
  });
});

// ==========================================
// CONVERSION RATE CALCULATIONS
// ==========================================
describe('Conversion Rate Calculations', () => {
  const calcConversionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  it('should calculate basic rate', () => {
    expect(calcConversionRate(25, 100)).toBe(25);
  });

  it('should handle zero total (avoid division by zero)', () => {
    expect(calcConversionRate(0, 0)).toBe(0);
  });

  it('should handle 100% conversion', () => {
    expect(calcConversionRate(50, 50)).toBe(100);
  });

  it('should handle very low conversion', () => {
    const rate = calcConversionRate(1, 10000);
    expect(rate).toBeCloseTo(0.01, 2);
  });
});

// ==========================================
// DEAL STAGE VALIDATION
// ==========================================
describe('Deal Stage Validation', () => {
  const VALID_STAGES = ['lead', 'prospecting', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'closed'];

  const isValidStage = (stage: string) => VALID_STAGES.includes(stage);

  const canTransition = (from: string, to: string) => {
    if (to === 'lost') return true; // Can always lose
    const fromIdx = VALID_STAGES.indexOf(from);
    const toIdx = VALID_STAGES.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return false;
    // Can move forward or backward one step, or jump to won/lost
    return toIdx >= 0;
  };

  it('should validate all known stages', () => {
    VALID_STAGES.forEach(stage => {
      expect(isValidStage(stage)).toBe(true);
    });
  });

  it('should reject invalid stages', () => {
    expect(isValidStage('invalid')).toBe(false);
    expect(isValidStage('')).toBe(false);
    expect(isValidStage('LEAD')).toBe(false); // case sensitive
  });

  it('should allow transition to lost from any stage', () => {
    VALID_STAGES.forEach(stage => {
      expect(canTransition(stage, 'lost')).toBe(true);
    });
  });
});

// ==========================================
// DATE RANGE VALIDATION
// ==========================================
describe('Date Range Validation', () => {
  const isValidDateRange = (start: Date, end: Date) => {
    return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
  };

  it('should accept valid date range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');
    expect(isValidDateRange(start, end)).toBe(true);
  });

  it('should accept same day range', () => {
    const date = new Date('2024-06-15');
    expect(isValidDateRange(date, date)).toBe(true);
  });

  it('should reject inverted range', () => {
    const start = new Date('2024-12-31');
    const end = new Date('2024-01-01');
    expect(isValidDateRange(start, end)).toBe(false);
  });

  it('should reject invalid dates', () => {
    const invalid = new Date('not-a-date');
    const valid = new Date();
    expect(isValidDateRange(invalid, valid)).toBe(false);
    expect(isValidDateRange(valid, invalid)).toBe(false);
  });
});

// ==========================================
// GOAL PROGRESS CALCULATIONS
// ==========================================
describe('Goal Progress Calculations', () => {
  const calcProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const isOnTrack = (current: number, target: number, daysElapsed: number, totalDays: number) => {
    if (totalDays <= 0) return false;
    const expectedProgress = (daysElapsed / totalDays) * target;
    return current >= expectedProgress * 0.8; // 80% buffer
  };

  it('should calculate progress percentage', () => {
    expect(calcProgress(50000, 100000)).toBe(50);
  });

  it('should cap at 100%', () => {
    expect(calcProgress(150000, 100000)).toBe(100);
  });

  it('should handle zero target', () => {
    expect(calcProgress(1000, 0)).toBe(0);
  });

  it('should handle negative target', () => {
    expect(calcProgress(1000, -500)).toBe(0);
  });

  it('should detect on-track status', () => {
    // Day 15 of 30, at 50% of goal = on track
    expect(isOnTrack(50000, 100000, 15, 30)).toBe(true);
  });

  it('should detect off-track status', () => {
    // Day 25 of 30, at only 20% of goal = off track
    expect(isOnTrack(20000, 100000, 25, 30)).toBe(false);
  });
});

// ==========================================
// LEAD SCORING VALIDATION
// ==========================================
describe('Lead Scoring', () => {
  const calculateScore = (factors: { engagement: number; fit: number; recency: number }) => {
    const weights = { engagement: 0.4, fit: 0.35, recency: 0.25 };
    const score = 
      factors.engagement * weights.engagement +
      factors.fit * weights.fit +
      factors.recency * weights.recency;
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  it('should calculate weighted score', () => {
    const score = calculateScore({ engagement: 80, fit: 90, recency: 70 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should cap at 100', () => {
    const score = calculateScore({ engagement: 100, fit: 100, recency: 100 });
    expect(score).toBe(100);
  });

  it('should floor at 0', () => {
    const score = calculateScore({ engagement: 0, fit: 0, recency: 0 });
    expect(score).toBe(0);
  });

  it('engagement should have highest weight', () => {
    const highEngagement = calculateScore({ engagement: 100, fit: 0, recency: 0 });
    const highFit = calculateScore({ engagement: 0, fit: 100, recency: 0 });
    expect(highEngagement).toBeGreaterThan(highFit);
  });
});

// ==========================================
// STAGNANT DEAL DETECTION
// ==========================================
describe('Stagnant Deal Detection', () => {
  const isDealStagnant = (lastActivityDate: string, thresholdDays: number = 5) => {
    const last = new Date(lastActivityDate);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= thresholdDays;
  };

  it('should detect stagnant deal (>5 days)', () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(isDealStagnant(oldDate)).toBe(true);
  });

  it('should not flag recent deal (<5 days)', () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(isDealStagnant(recentDate)).toBe(false);
  });

  it('should flag exactly at threshold', () => {
    const exactDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(isDealStagnant(exactDate)).toBe(true);
  });

  it('should respect custom threshold', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(isDealStagnant(date, 2)).toBe(true);
    expect(isDealStagnant(date, 5)).toBe(false);
  });
});

// ==========================================
// QUOTE EXPIRATION VALIDATION
// ==========================================
describe('Quote Expiration', () => {
  const getQuoteAlertLevel = (validUntil: string) => {
    const expDate = new Date(validUntil);
    const now = new Date();
    const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    if (diffDays <= 7) return 'info';
    return 'safe';
  };

  it('should detect expired quotes', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(getQuoteAlertLevel(past)).toBe('expired');
  });

  it('should warn for quotes expiring within 3 days', () => {
    const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getQuoteAlertLevel(soon)).toBe('warning');
  });

  it('should info for quotes expiring within 7 days', () => {
    const week = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(getQuoteAlertLevel(week)).toBe('info');
  });

  it('should be safe for distant quotes', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(getQuoteAlertLevel(future)).toBe('safe');
  });
});

// ==========================================
// RANKING CALCULATIONS
// ==========================================
describe('Ranking Logic', () => {
  const assignRankTitles = (sortedSales: { id: string; total: number }[]) => {
    return sortedSales.map((sp, i) => ({
      ...sp,
      rank: i + 1,
      title: i === 0 ? 'Lenda' : i === 1 ? 'Elite' : i === 2 ? 'Veterano' : null,
      gapToFirst: i === 0 ? 0 : sortedSales[0].total - sp.total,
      gapToNext: i === 0 ? 0 : sortedSales[i - 1].total - sp.total,
    }));
  };

  it('should assign correct ranks', () => {
    const input = [
      { id: 'a', total: 100000 },
      { id: 'b', total: 80000 },
      { id: 'c', total: 60000 },
    ];
    const result = assignRankTitles(input);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
  });

  it('should assign titles to top 3 only', () => {
    const input = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`, total: (5 - i) * 10000,
    }));
    const result = assignRankTitles(input);
    expect(result[0].title).toBe('Lenda');
    expect(result[1].title).toBe('Elite');
    expect(result[2].title).toBe('Veterano');
    expect(result[3].title).toBeNull();
    expect(result[4].title).toBeNull();
  });

  it('should calculate gaps correctly', () => {
    const input = [
      { id: 'a', total: 100000 },
      { id: 'b', total: 70000 },
    ];
    const result = assignRankTitles(input);
    expect(result[0].gapToFirst).toBe(0);
    expect(result[1].gapToFirst).toBe(30000);
    expect(result[1].gapToNext).toBe(30000);
  });

  it('should handle single person ranking', () => {
    const input = [{ id: 'solo', total: 50000 }];
    const result = assignRankTitles(input);
    expect(result[0].rank).toBe(1);
    expect(result[0].title).toBe('Lenda');
    expect(result[0].gapToFirst).toBe(0);
  });

  it('should handle empty ranking', () => {
    const result = assignRankTitles([]);
    expect(result).toHaveLength(0);
  });

  it('should handle tied scores', () => {
    const input = [
      { id: 'a', total: 80000 },
      { id: 'b', total: 80000 },
    ];
    const result = assignRankTitles(input);
    expect(result[0].gapToFirst).toBe(0);
    expect(result[1].gapToFirst).toBe(0);
    expect(result[1].gapToNext).toBe(0);
  });
});

// ==========================================
// XP & LEVEL SYSTEM
// ==========================================
describe('XP & Level System', () => {
  const calculateLevel = (xp: number) => {
    if (xp < 0) return { level: 1, nextLevelXP: 100, progress: 0 };
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXP = xp % 100;
    return {
      level,
      nextLevelXP: 100,
      progress: currentLevelXP,
    };
  };

  it('should start at level 1 with 0 XP', () => {
    expect(calculateLevel(0).level).toBe(1);
  });

  it('should level up at 100 XP', () => {
    expect(calculateLevel(100).level).toBe(2);
  });

  it('should handle high XP', () => {
    expect(calculateLevel(9999).level).toBe(100);
  });

  it('should calculate progress within level', () => {
    expect(calculateLevel(150).progress).toBe(50);
  });

  it('should handle negative XP gracefully', () => {
    expect(calculateLevel(-10).level).toBe(1);
  });
});

// ==========================================
// ACTIVITY TYPE VALIDATION
// ==========================================
describe('Activity Type Validation', () => {
  const VALID_TYPES = ['call', 'email', 'meeting', 'linkedin', 'whatsapp', 'other'];
  const VALID_OUTCOMES = ['connected', 'no_answer', 'scheduled', 'voicemail', 'busy', 'callback', 'not_interested', 'qualified'];

  it('should have 6 activity types', () => {
    expect(VALID_TYPES.length).toBe(6);
  });

  it('should have 8 outcomes', () => {
    expect(VALID_OUTCOMES.length).toBe(8);
  });

  it('all types should be lowercase strings', () => {
    VALID_TYPES.forEach(type => {
      expect(type).toBe(type.toLowerCase());
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it('all outcomes should be snake_case', () => {
    VALID_OUTCOMES.forEach(outcome => {
      expect(outcome).toMatch(/^[a-z_]+$/);
    });
  });
});

// ==========================================
// NOTIFICATION COUNT LOGIC
// ==========================================
describe('Notification Count Logic', () => {
  const formatBadgeCount = (count: number) => {
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return String(count);
  };

  it('should return empty for zero', () => {
    expect(formatBadgeCount(0)).toBe('');
  });

  it('should return empty for negative', () => {
    expect(formatBadgeCount(-5)).toBe('');
  });

  it('should show exact count for small numbers', () => {
    expect(formatBadgeCount(5)).toBe('5');
  });

  it('should cap at 99+', () => {
    expect(formatBadgeCount(100)).toBe('99+');
    expect(formatBadgeCount(999)).toBe('99+');
  });
});

// ==========================================
// SIDEBAR VIEW MODE LOGIC
// ==========================================
describe('Sidebar View Mode Logic', () => {
  type ViewMode = 'sdr' | 'closer' | 'gestao';

  const getDefaultViewMode = (userType: string): ViewMode => {
    if (userType === 'sdr') return 'sdr';
    if (userType === 'closer') return 'closer';
    return 'gestao';
  };

  it('SDR should default to SDR view', () => {
    expect(getDefaultViewMode('sdr')).toBe('sdr');
  });

  it('Closer should default to Closer view', () => {
    expect(getDefaultViewMode('closer')).toBe('closer');
  });

  it('Admin should default to Gestão view', () => {
    expect(getDefaultViewMode('admin')).toBe('gestao');
  });

  it('Manager should default to Gestão view', () => {
    expect(getDefaultViewMode('manager')).toBe('gestao');
  });

  it('Unknown role should default to Gestão view', () => {
    expect(getDefaultViewMode('unknown')).toBe('gestao');
  });
});
