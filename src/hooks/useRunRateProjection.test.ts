import { describe, it, expect } from 'vitest';
import { computeRunRateProjection } from './useRunRateProjection';

// Freeze "now" — use noon UTC to avoid TZ edge cases on daysElapsed math.
const at = (iso: string) => new Date(iso + 'T12:00:00Z');

describe('computeRunRateProjection', () => {
  it('primeiro dia do mês: paceDaily = mtd, projeta para todos os dias do mês', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 1000,
      goal: 30000,
      now: at('2026-07-01'),
    });
    expect(r.daysElapsed).toBe(1);
    expect(r.daysInMonth).toBe(31);
    expect(r.daysRemaining).toBe(30);
    expect(r.paceDaily).toBe(1000);
    expect(r.projectedEOM).toBe(31000); // 1000 + 1000*30
    expect(r.confidence).toBe('low');
  });

  it('meio do mês com bom ritmo: confidence media, projeção acima da meta', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 20000,
      goal: 30000,
      now: at('2026-07-10'), // dia 10 => daysElapsed=10
    });
    expect(r.daysElapsed).toBe(10);
    expect(r.paceDaily).toBe(2000);
    expect(r.projectedEOM).toBe(20000 + 2000 * 21); // 62000
    expect(r.attainmentProjected).toBeGreaterThan(1);
    expect(r.gap).toBeLessThan(0);
    expect(r.dailyPaceRequired).toBe(0);
    expect(r.confidence).toBe('medium');
  });

  it('gap grande: dailyPaceRequired calculado corretamente', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 5000,
      goal: 30000,
      now: at('2026-07-20'),
    });
    expect(r.daysElapsed).toBe(20);
    expect(r.gap).toBeGreaterThan(0);
    expect(r.dailyPaceRequired).toBe(r.gap / r.daysRemaining);
    expect(r.confidence).toBe('high');
  });

  it('último dia do mês: daysRemaining=0 sem divisão por zero', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 25000,
      goal: 30000,
      now: at('2026-07-31'),
    });
    expect(r.daysRemaining).toBe(0);
    expect(r.dailyPaceRequired).toBe(0);
    expect(r.projectedEOM).toBe(25000);
  });

  it('sem meta: hasGoal=false e attainment=0 sem NaN', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 10000,
      goal: 0,
      now: at('2026-07-15'),
    });
    expect(r.hasGoal).toBe(false);
    expect(r.attainmentProjected).toBe(0);
    expect(r.gap).toBe(0);
    expect(r.dailyPaceRequired).toBe(0);
    expect(Number.isFinite(r.projectedEOM)).toBe(true);
  });

  it('sem vendas: projectedEOM=0 sem NaN', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 0,
      goal: 30000,
      now: at('2026-07-10'),
    });
    expect(r.mtdRevenue).toBe(0);
    expect(r.paceDaily).toBe(0);
    expect(r.projectedEOM).toBe(0);
    expect(r.gap).toBe(30000);
    expect(r.dailyPaceRequired).toBe(30000 / r.daysRemaining);
  });

  it('mês de fevereiro (28 dias): daysInMonth respeita o mês real', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 14000,
      goal: 28000,
      now: at('2026-02-14'),
    });
    expect(r.daysInMonth).toBe(28);
    expect(r.daysElapsed).toBe(14);
    expect(r.daysRemaining).toBe(14);
    expect(r.projectedEOM).toBe(28000);
    expect(r.attainmentProjected).toBe(1);
  });

  it('valores negativos são normalizados para zero (defesa)', () => {
    const r = computeRunRateProjection({
      mtdRevenue: -500,
      goal: -100,
      now: at('2026-07-10'),
    });
    expect(r.mtdRevenue).toBe(0);
    expect(r.goal).toBe(0);
    expect(r.hasGoal).toBe(false);
  });

  it('commissionRate: calcula comissão MTD, projetada e gap de comissão', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 20000,
      goal: 100000,
      now: at('2026-07-10'),
      commissionRate: 0.05, // 5%
    });
    expect(r.hasCommissionRate).toBe(true);
    expect(r.commissionRate).toBe(0.05);
    expect(r.mtdCommission).toBe(1000); // 20000 * 0.05
    expect(r.projectedCommission).toBeCloseTo(r.projectedEOM * 0.05, 6);
    expect(r.goalCommission).toBe(5000);
    // gap positivo => commissionGap = gap * rate
    if (r.gap > 0) {
      expect(r.commissionGap).toBeCloseTo(r.gap * 0.05, 6);
    } else {
      expect(r.commissionGap).toBe(0);
    }
  });

  it('sem commissionRate: campos de comissão zerados sem NaN', () => {
    const r = computeRunRateProjection({
      mtdRevenue: 20000,
      goal: 30000,
      now: at('2026-07-10'),
    });
    expect(r.hasCommissionRate).toBe(false);
    expect(r.commissionRate).toBe(0);
    expect(r.mtdCommission).toBe(0);
    expect(r.projectedCommission).toBe(0);
    expect(r.commissionGap).toBe(0);
  });
});
