import { describe, it, expect } from 'vitest';
import { evaluateBonus } from './useEligibleBonuses';
import type { CommissionBonus } from './useCommissionBonuses';

const base: CommissionBonus = {
  id: 'b1',
  name: 'X',
  description: null,
  bonus_type: 'milestone',
  bonus_kind: 'fixed',
  bonus_amount: 500,
  salesperson_id: null,
  priority: 0,
  is_active: true,
  trigger_condition: {},
  created_at: '',
  updated_at: '',
};

const ctx = {
  salespersonId: 'sp1',
  mtdRevenue: 0,
  totalSalesCount: 0,
  currentStreak: 0,
  monthlyRank: null as number | null,
};

describe('evaluateBonus', () => {
  it('rejects inactive', () => {
    expect(evaluateBonus({ ...base, is_active: false }, ctx)).toBeNull();
  });

  it('rejects individual bonus for other salesperson', () => {
    expect(
      evaluateBonus({ ...base, salesperson_id: 'other' }, ctx),
    ).toBeNull();
  });

  it('milestone: eligible when mtdRevenue >= threshold', () => {
    const b = { ...base, trigger_condition: { milestone_amount: 10000 } };
    expect(evaluateBonus(b, { ...ctx, mtdRevenue: 15000 })).not.toBeNull();
    expect(evaluateBonus(b, { ...ctx, mtdRevenue: 5000 })).toBeNull();
  });

  it('rank_top: requires monthlyRank present', () => {
    const b = { ...base, trigger_condition: { rank_top: 3 } };
    expect(evaluateBonus(b, ctx)).toBeNull();
    expect(evaluateBonus(b, { ...ctx, monthlyRank: 2 })).not.toBeNull();
    expect(evaluateBonus(b, { ...ctx, monthlyRank: 5 })).toBeNull();
  });

  it('streak_days: needs current streak', () => {
    const b = { ...base, trigger_condition: { streak_days: 7 } };
    expect(evaluateBonus(b, { ...ctx, currentStreak: 7 })).not.toBeNull();
    expect(evaluateBonus(b, { ...ctx, currentStreak: 6 })).toBeNull();
  });

  it('first_sale: requires at least 1 sale', () => {
    const b = { ...base, trigger_condition: { first_sale: true } };
    expect(evaluateBonus(b, { ...ctx, totalSalesCount: 1 })).not.toBeNull();
    expect(evaluateBonus(b, ctx)).toBeNull();
  });

  it('empty trigger: still eligible (informational)', () => {
    expect(evaluateBonus(base, ctx)).not.toBeNull();
  });

  it('malformed trigger: does not throw', () => {
    const b = { ...base, trigger_condition: { milestone_amount: 'x' as unknown as number } };
    expect(() => evaluateBonus(b, ctx)).not.toThrow();
    expect(evaluateBonus(b, ctx)).not.toBeNull(); // cai no fallback informativo
  });
});
