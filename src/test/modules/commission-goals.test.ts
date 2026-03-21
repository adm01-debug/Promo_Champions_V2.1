/**
 * Commission & Goals System Tests
 * Tests: commission tiers, goal tracking, bonus calculation, team goals
 */
import { describe, it, expect } from 'vitest';

describe('Commission - Tiered Calculation', () => {
  const calculateCommission = (revenue: number): { rate: number; amount: number; tier: string } => {
    const tiers = [
      { min: 100000, rate: 0.10, name: 'Platinum' },
      { min: 50000, rate: 0.07, name: 'Gold' },
      { min: 20000, rate: 0.05, name: 'Silver' },
      { min: 0, rate: 0.03, name: 'Bronze' },
    ];
    const tier = tiers.find(t => revenue >= t.min) || tiers[tiers.length - 1];
    return { rate: tier.rate, amount: Math.round(revenue * tier.rate), tier: tier.name };
  };

  it('should apply Bronze tier', () => {
    const result = calculateCommission(10000);
    expect(result.tier).toBe('Bronze');
    expect(result.amount).toBe(300);
  });

  it('should apply Silver tier', () => {
    const result = calculateCommission(30000);
    expect(result.tier).toBe('Silver');
    expect(result.amount).toBe(1500);
  });

  it('should apply Gold tier', () => {
    const result = calculateCommission(75000);
    expect(result.tier).toBe('Gold');
    expect(result.amount).toBe(5250);
  });

  it('should apply Platinum tier', () => {
    const result = calculateCommission(150000);
    expect(result.tier).toBe('Platinum');
    expect(result.amount).toBe(15000);
  });

  it('should handle zero revenue', () => {
    expect(calculateCommission(0).amount).toBe(0);
  });
});

describe('Commission - Accelerator Bonus', () => {
  const calculateAccelerator = (achievement: number): number => {
    if (achievement >= 150) return 2.0;
    if (achievement >= 120) return 1.5;
    if (achievement >= 100) return 1.2;
    return 1.0;
  };

  it('should return base multiplier below target', () => {
    expect(calculateAccelerator(80)).toBe(1.0);
  });

  it('should apply 1.2x at 100%', () => {
    expect(calculateAccelerator(100)).toBe(1.2);
  });

  it('should apply 1.5x at 120%', () => {
    expect(calculateAccelerator(130)).toBe(1.5);
  });

  it('should apply 2x at 150%+', () => {
    expect(calculateAccelerator(200)).toBe(2.0);
  });
});

describe('Goals - Progress Tracking', () => {
  const calculateGoalProgress = (current: number, target: number): { pct: number; remaining: number; status: string; onTrack: boolean } => {
    const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    const remaining = Math.max(target - current, 0);
    const status = pct >= 100 ? 'achieved' : pct >= 80 ? 'close' : pct >= 50 ? 'on_track' : 'behind';
    const dayOfMonth = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const expectedPct = Math.round((dayOfMonth / daysInMonth) * 100);
    return { pct, remaining, status, onTrack: pct >= expectedPct - 10 };
  };

  it('should calculate 100% when achieved', () => {
    const result = calculateGoalProgress(50000, 50000);
    expect(result.pct).toBe(100);
    expect(result.remaining).toBe(0);
    expect(result.status).toBe('achieved');
  });

  it('should cap at 100%', () => {
    expect(calculateGoalProgress(60000, 50000).pct).toBe(100);
  });

  it('should handle zero target', () => {
    expect(calculateGoalProgress(100, 0).pct).toBe(0);
  });

  it('should classify statuses', () => {
    expect(calculateGoalProgress(90, 100).status).toBe('close');
    expect(calculateGoalProgress(60, 100).status).toBe('on_track');
    expect(calculateGoalProgress(20, 100).status).toBe('behind');
  });
});

describe('Goals - Team Aggregation', () => {
  const aggregateTeamGoals = (members: { current: number; target: number }[]): { totalCurrent: number; totalTarget: number; teamPct: number; membersBehind: number } => {
    const totalCurrent = members.reduce((s, m) => s + m.current, 0);
    const totalTarget = members.reduce((s, m) => s + m.target, 0);
    const teamPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
    const membersBehind = members.filter(m => m.target > 0 && (m.current / m.target) < 0.5).length;
    return { totalCurrent, totalTarget, teamPct, membersBehind };
  };

  it('should aggregate team totals', () => {
    const result = aggregateTeamGoals([
      { current: 30000, target: 50000 },
      { current: 45000, target: 50000 },
      { current: 10000, target: 50000 },
    ]);
    expect(result.totalCurrent).toBe(85000);
    expect(result.totalTarget).toBe(150000);
    expect(result.teamPct).toBe(57);
    expect(result.membersBehind).toBe(1);
  });

  it('should handle empty team', () => {
    expect(aggregateTeamGoals([]).teamPct).toBe(0);
  });
});

describe('Goals - Period Types', () => {
  const getGoalPeriod = (type: 'daily' | 'weekly' | 'monthly' | 'quarterly'): { start: string; end: string; label: string } => {
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    switch (type) {
      case 'daily': return { start: formatDate(now), end: formatDate(now), label: 'Hoje' };
      case 'weekly': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { start: formatDate(weekStart), end: formatDate(weekEnd), label: 'Esta Semana' };
      }
      case 'monthly': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: formatDate(monthStart), end: formatDate(monthEnd), label: 'Este Mês' };
      }
      case 'quarterly': {
        const q = Math.floor(now.getMonth() / 3);
        const qStart = new Date(now.getFullYear(), q * 3, 1);
        const qEnd = new Date(now.getFullYear(), (q + 1) * 3, 0);
        return { start: formatDate(qStart), end: formatDate(qEnd), label: `Q${q + 1}` };
      }
    }
  };

  it('should return daily period', () => {
    const period = getGoalPeriod('daily');
    expect(period.start).toBe(period.end);
    expect(period.label).toBe('Hoje');
  });

  it('should return weekly period with 7 days', () => {
    const period = getGoalPeriod('weekly');
    const diff = (new Date(period.end).getTime() - new Date(period.start).getTime()) / 86400000;
    expect(diff).toBe(6);
  });

  it('should return monthly period', () => {
    const period = getGoalPeriod('monthly');
    expect(period.label).toBe('Este Mês');
    expect(new Date(period.start).getDate()).toBe(1);
  });

  it('should return quarterly period', () => {
    const period = getGoalPeriod('quarterly');
    expect(period.label).toMatch(/^Q[1-4]$/);
  });
});

describe('Commission - Clawback Rules', () => {
  const shouldClawback = (sale: { amount: number; closedAt: string; cancelledAt?: string }, gracePeriodDays: number = 30): boolean => {
    if (!sale.cancelledAt) return false;
    const closed = new Date(sale.closedAt).getTime();
    const cancelled = new Date(sale.cancelledAt).getTime();
    return (cancelled - closed) / 86400000 <= gracePeriodDays;
  };

  it('should clawback within grace period', () => {
    expect(shouldClawback({ amount: 10000, closedAt: '2024-01-01', cancelledAt: '2024-01-15' })).toBe(true);
  });

  it('should not clawback after grace period', () => {
    expect(shouldClawback({ amount: 10000, closedAt: '2024-01-01', cancelledAt: '2024-03-01' })).toBe(false);
  });

  it('should not clawback active sale', () => {
    expect(shouldClawback({ amount: 10000, closedAt: '2024-01-01' })).toBe(false);
  });
});
