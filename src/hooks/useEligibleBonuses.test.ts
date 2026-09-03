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
    expect(evaluateBonus({ ...base, salesperson_id: 'other' }, ctx)).toBeNull();
  });

  it('milestone: achieved when mtdRevenue >= threshold', () => {
    const b = { ...base, trigger_condition: { milestone_amount: 10000 } };
    expect(evaluateBonus(b, { ...ctx, mtdRevenue: 15000 })?.achieved).toBe(true);
    const inProgress = evaluateBonus(b, { ...ctx, mtdRevenue: 5000 });
    expect(inProgress?.achieved).toBe(false);
    expect(inProgress?.progress).toBeCloseTo(0.5);
  });

  it('rank_top: not achieved when rank unavailable', () => {
    const b = { ...base, trigger_condition: { rank_top: 3 } };
    expect(evaluateBonus(b, ctx)?.achieved).toBe(false);
    expect(evaluateBonus(b, { ...ctx, monthlyRank: 2 })?.achieved).toBe(true);
    expect(evaluateBonus(b, { ...ctx, monthlyRank: 5 })?.achieved).toBe(false);
  });

  it('streak_days: progress scales with current streak', () => {
    const b = { ...base, trigger_condition: { streak_days: 7 } };
    expect(evaluateBonus(b, { ...ctx, currentStreak: 7 })?.achieved).toBe(true);
    const p = evaluateBonus(b, { ...ctx, currentStreak: 3 });
    expect(p?.achieved).toBe(false);
    expect(p?.progress).toBeCloseTo(3 / 7);
  });

  it('first_sale: achieved with >=1 sale', () => {
    const b = { ...base, trigger_condition: { first_sale: true } };
    expect(evaluateBonus(b, { ...ctx, totalSalesCount: 1 })?.achieved).toBe(true);
    expect(evaluateBonus(b, ctx)?.achieved).toBe(false);
  });

  it('empty trigger: informational, achieved=true', () => {
    expect(evaluateBonus(base, ctx)?.achieved).toBe(true);
  });

  it('malformed trigger: does not throw', () => {
    const b = {
      ...base,
      // eslint-disable-next-line no-restricted-syntax
      trigger_condition: { milestone_amount: 'x' as unknown as number },
    };
    expect(() => evaluateBonus(b, ctx)).not.toThrow();
    expect(evaluateBonus(b, ctx)?.achieved).toBe(true);
  });
});
