/**
 * Pipeline & Deal Logic Tests
 * Tests: stage transitions, deal scoring, funnel calculations
 */
import { describe, it, expect } from 'vitest';

describe('Pipeline Stage Transitions', () => {
  const STAGES = ['lead', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  
  const isValidTransition = (from: string, to: string): boolean => {
    const fromIdx = STAGES.indexOf(from);
    const toIdx = STAGES.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return false;
    // Can move forward, or to closed_lost from any stage
    return toIdx > fromIdx || to === 'closed_lost';
  };

  it('should allow forward progression', () => {
    expect(isValidTransition('lead', 'qualification')).toBe(true);
    expect(isValidTransition('qualification', 'proposal')).toBe(true);
    expect(isValidTransition('proposal', 'negotiation')).toBe(true);
  });

  it('should allow closing from any stage', () => {
    STAGES.slice(0, -2).forEach(stage => {
      expect(isValidTransition(stage, 'closed_lost')).toBe(true);
    });
  });

  it('should not allow backward movement', () => {
    expect(isValidTransition('proposal', 'lead')).toBe(false);
    expect(isValidTransition('negotiation', 'qualification')).toBe(false);
  });

  it('should reject invalid stages', () => {
    expect(isValidTransition('invalid', 'lead')).toBe(false);
    expect(isValidTransition('lead', 'invalid')).toBe(false);
  });

  it('should not allow same-stage transition', () => {
    expect(isValidTransition('lead', 'lead')).toBe(false);
  });
});

describe('Deal Scoring', () => {
  const scoreDeal = (deal: {
    amount: number;
    hasEmail: boolean;
    hasPhone: boolean;
    daysSinceContact: number;
    meetingScheduled: boolean;
  }): number => {
    let score = 0;
    if (deal.amount >= 10000) score += 30;
    else if (deal.amount >= 5000) score += 20;
    else if (deal.amount > 0) score += 10;
    if (deal.hasEmail) score += 15;
    if (deal.hasPhone) score += 15;
    if (deal.meetingScheduled) score += 20;
    if (deal.daysSinceContact <= 7) score += 20;
    else if (deal.daysSinceContact <= 30) score += 10;
    return Math.min(score, 100);
  };

  it('should score perfect deal at 100', () => {
    const score = scoreDeal({
      amount: 50000,
      hasEmail: true,
      hasPhone: true,
      daysSinceContact: 1,
      meetingScheduled: true,
    });
    expect(score).toBe(100);
  });

  it('should score minimal deal low', () => {
    const score = scoreDeal({
      amount: 0,
      hasEmail: false,
      hasPhone: false,
      daysSinceContact: 90,
      meetingScheduled: false,
    });
    expect(score).toBe(0);
  });

  it('should reward recent contact', () => {
    const recent = scoreDeal({ amount: 5000, hasEmail: true, hasPhone: false, daysSinceContact: 3, meetingScheduled: false });
    const old = scoreDeal({ amount: 5000, hasEmail: true, hasPhone: false, daysSinceContact: 60, meetingScheduled: false });
    expect(recent).toBeGreaterThan(old);
  });

  it('should cap at 100', () => {
    const score = scoreDeal({
      amount: 100000,
      hasEmail: true,
      hasPhone: true,
      daysSinceContact: 0,
      meetingScheduled: true,
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('Funnel Conversion Rates', () => {
  const calculateFunnelRates = (stages: { name: string; count: number }[]) => {
    return stages.map((stage, i) => ({
      ...stage,
      conversionRate: i === 0 ? 100 : stages[i - 1].count > 0
        ? Math.round((stage.count / stages[i - 1].count) * 100)
        : 0,
      dropoff: i === 0 ? 0 : stages[i - 1].count - stage.count,
    }));
  };

  it('should calculate conversion rates between stages', () => {
    const funnel = calculateFunnelRates([
      { name: 'Leads', count: 100 },
      { name: 'Qualificados', count: 60 },
      { name: 'Proposta', count: 30 },
      { name: 'Fechado', count: 15 },
    ]);
    expect(funnel[0].conversionRate).toBe(100);
    expect(funnel[1].conversionRate).toBe(60);
    expect(funnel[2].conversionRate).toBe(50);
    expect(funnel[3].conversionRate).toBe(50);
  });

  it('should calculate dropoff correctly', () => {
    const funnel = calculateFunnelRates([
      { name: 'Leads', count: 100 },
      { name: 'Qualificados', count: 60 },
    ]);
    expect(funnel[0].dropoff).toBe(0);
    expect(funnel[1].dropoff).toBe(40);
  });

  it('should handle zero counts', () => {
    const funnel = calculateFunnelRates([
      { name: 'Leads', count: 0 },
      { name: 'Qualificados', count: 0 },
    ]);
    expect(funnel[1].conversionRate).toBe(0);
  });
});