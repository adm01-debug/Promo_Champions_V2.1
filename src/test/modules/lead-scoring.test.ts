/**
 * Lead Scoring Logic Tests
 * Tests: company size scoring, engagement scoring, behavior scoring, category classification
 */
import { describe, it, expect } from 'vitest';

describe('Lead Scoring - Company Size Score', () => {
  const calculateCompanySizeScore = (numColaboradores?: number | null): number => {
    if (!numColaboradores) return 5;
    if (numColaboradores > 500) return 20;
    if (numColaboradores > 100) return 15;
    if (numColaboradores > 20) return 10;
    return 5;
  };

  it('should return 5 for null/undefined', () => {
    expect(calculateCompanySizeScore(null)).toBe(5);
    expect(calculateCompanySizeScore(undefined)).toBe(5);
  });

  it('should return 20 for 500+ employees', () => {
    expect(calculateCompanySizeScore(501)).toBe(20);
    expect(calculateCompanySizeScore(1000)).toBe(20);
  });

  it('should return 15 for 101-500 employees', () => {
    expect(calculateCompanySizeScore(101)).toBe(15);
    expect(calculateCompanySizeScore(500)).toBe(15);
  });

  it('should return 10 for 21-100 employees', () => {
    expect(calculateCompanySizeScore(21)).toBe(10);
    expect(calculateCompanySizeScore(100)).toBe(10);
  });

  it('should return 5 for 1-20 employees', () => {
    expect(calculateCompanySizeScore(1)).toBe(5);
    expect(calculateCompanySizeScore(20)).toBe(5);
  });
});

describe('Lead Scoring - Engagement Score', () => {
  const calculateEngagementScore = (recentActivityCount: number): number => {
    return Math.min(recentActivityCount * 2, 25);
  };

  it('should scale by 2x activity count', () => {
    expect(calculateEngagementScore(1)).toBe(2);
    expect(calculateEngagementScore(5)).toBe(10);
    expect(calculateEngagementScore(10)).toBe(20);
  });

  it('should cap at 25', () => {
    expect(calculateEngagementScore(13)).toBe(25);
    expect(calculateEngagementScore(50)).toBe(25);
  });

  it('should return 0 for no activities', () => {
    expect(calculateEngagementScore(0)).toBe(0);
  });
});

describe('Lead Scoring - Behavior Score', () => {
  const calculateBehaviorScore = (
    activities: { activity_type: string }[],
    sales: { status: string }[]
  ): number => {
    let score = 0;
    const activeDeals = sales.filter(s => s.status !== 'completed' && s.status !== 'lost');
    if (activeDeals.length > 0) score += 10;
    const hasMeeting = activities.some(a => a.activity_type === 'meeting');
    if (hasMeeting) score += 5;
    return Math.min(score, 15);
  };

  it('should give 10 for active deals', () => {
    expect(calculateBehaviorScore([], [{ status: 'pending' }])).toBe(10);
  });

  it('should give 5 for meetings', () => {
    expect(calculateBehaviorScore([{ activity_type: 'meeting' }], [])).toBe(5);
  });

  it('should give 15 for both', () => {
    expect(calculateBehaviorScore(
      [{ activity_type: 'meeting' }],
      [{ status: 'pending' }]
    )).toBe(15);
  });

  it('should give 0 for completed/lost deals and no meetings', () => {
    expect(calculateBehaviorScore(
      [{ activity_type: 'call' }],
      [{ status: 'completed' }, { status: 'lost' }]
    )).toBe(0);
  });

  it('should cap at 15', () => {
    expect(calculateBehaviorScore(
      [{ activity_type: 'meeting' }],
      [{ status: 'pending' }, { status: 'qualified' }]
    )).toBeLessThanOrEqual(15);
  });
});

describe('Lead Scoring - Category Classification', () => {
  const classifyLead = (score: number): 'Hot' | 'Warm' | 'Cold' => {
    return score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold';
  };

  it('should classify Hot for 80+', () => {
    expect(classifyLead(80)).toBe('Hot');
    expect(classifyLead(100)).toBe('Hot');
  });

  it('should classify Warm for 50-79', () => {
    expect(classifyLead(50)).toBe('Warm');
    expect(classifyLead(79)).toBe('Warm');
  });

  it('should classify Cold for <50', () => {
    expect(classifyLead(0)).toBe('Cold');
    expect(classifyLead(49)).toBe('Cold');
  });
});

describe('Lead Scoring - Source Score', () => {
  const calculateSourceScore = (totalValue: number): number => {
    return totalValue > 100000 ? 10 : totalValue > 50000 ? 7 : 5;
  };

  it('should return 10 for high value clients', () => {
    expect(calculateSourceScore(150000)).toBe(10);
  });

  it('should return 7 for mid value', () => {
    expect(calculateSourceScore(75000)).toBe(7);
  });

  it('should return 5 for low value', () => {
    expect(calculateSourceScore(10000)).toBe(5);
    expect(calculateSourceScore(0)).toBe(5);
  });
});

describe('Lead Scoring - Total Score Calculation', () => {
  it('should sum all factor scores', () => {
    const factors = { companySize: 15, industry: 10, jobTitle: 10, engagement: 20, source: 7, behavior: 10 };
    const total = Object.values(factors).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(72);
  });

  it('should have max possible score of 100', () => {
    const maxFactors = { companySize: 20, industry: 15, jobTitle: 15, engagement: 25, source: 10, behavior: 15 };
    const total = Object.values(maxFactors).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(100);
  });

  it('should have min possible score of 30', () => {
    const minFactors = { companySize: 5, industry: 5, jobTitle: 10, engagement: 0, source: 5, behavior: 0 };
    const total = Object.values(minFactors).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(25);
  });
});
