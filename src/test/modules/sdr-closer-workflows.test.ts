/**
 * SDR & Closer Workflow Tests
 * Tests: lead qualification, handoff, consecutive alerts, pipeline transitions
 */
import { describe, it, expect } from 'vitest';

describe('SDR - Lead Qualification Scoring', () => {
  const qualifyLead = (criteria: {
    hasEmail: boolean; hasPhone: boolean; companySize: number;
    budget: number; timeline: string; decisionMaker: boolean;
  }): { score: number; qualified: boolean; priority: 'hot' | 'warm' | 'cold' } => {
    let score = 0;
    if (criteria.hasEmail) score += 10;
    if (criteria.hasPhone) score += 10;
    if (criteria.companySize >= 50) score += 20;
    else if (criteria.companySize >= 10) score += 10;
    if (criteria.budget >= 50000) score += 25;
    else if (criteria.budget >= 10000) score += 15;
    if (criteria.timeline === 'immediate') score += 20;
    else if (criteria.timeline === '30days') score += 10;
    if (criteria.decisionMaker) score += 15;
    const priority = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
    return { score, qualified: score >= 50, priority };
  };

  it('should qualify hot lead', () => {
    const result = qualifyLead({ hasEmail: true, hasPhone: true, companySize: 100, budget: 80000, timeline: 'immediate', decisionMaker: true });
    expect(result.qualified).toBe(true);
    expect(result.priority).toBe('hot');
    expect(result.score).toBe(100);
  });

  it('should classify cold lead', () => {
    const result = qualifyLead({ hasEmail: true, hasPhone: false, companySize: 5, budget: 2000, timeline: 'unknown', decisionMaker: false });
    expect(result.priority).toBe('cold');
    expect(result.qualified).toBe(false);
  });

  it('should classify warm lead', () => {
    const result = qualifyLead({ hasEmail: true, hasPhone: true, companySize: 20, budget: 15000, timeline: '30days', decisionMaker: false });
    expect(result.priority).toBe('warm');
  });
});

describe('SDR - Consecutive Days Below Target', () => {
  const checkConsecutiveDays = (dailyResults: { date: string; achieved: boolean }[]): number => {
    let maxConsecutive = 0;
    let current = 0;
    const sorted = [...dailyResults].sort((a, b) => a.date.localeCompare(b.date));
    for (const day of sorted) {
      if (!day.achieved) { current++; maxConsecutive = Math.max(maxConsecutive, current); }
      else { current = 0; }
    }
    return maxConsecutive;
  };

  const shouldTriggerAlert = (consecutiveDays: number, threshold: number = 3): boolean => {
    return consecutiveDays >= threshold;
  };

  it('should count consecutive failures', () => {
    const results = [
      { date: '2024-01-01', achieved: true },
      { date: '2024-01-02', achieved: false },
      { date: '2024-01-03', achieved: false },
      { date: '2024-01-04', achieved: false },
      { date: '2024-01-05', achieved: true },
    ];
    expect(checkConsecutiveDays(results)).toBe(3);
  });

  it('should trigger alert at threshold', () => {
    expect(shouldTriggerAlert(3, 3)).toBe(true);
    expect(shouldTriggerAlert(2, 3)).toBe(false);
  });
});

describe('SDR → Closer Handoff', () => {
  type HandoffData = { leadId: string; sdrId: string; closerId: string; qualificationScore: number; notes: string };

  const validateHandoff = (data: HandoffData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.leadId) errors.push('Lead ID obrigatório');
    if (!data.sdrId) errors.push('SDR ID obrigatório');
    if (!data.closerId) errors.push('Closer ID obrigatório');
    if (data.sdrId === data.closerId) errors.push('SDR e Closer devem ser diferentes');
    if (data.qualificationScore < 50) errors.push('Score mínimo de 50 para handoff');
    if (!data.notes.trim()) errors.push('Notas obrigatórias');
    return { valid: errors.length === 0, errors };
  };

  it('should validate complete handoff', () => {
    const result = validateHandoff({ leadId: 'l1', sdrId: 's1', closerId: 'c1', qualificationScore: 75, notes: 'Lead qualificado' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject low score handoff', () => {
    const result = validateHandoff({ leadId: 'l1', sdrId: 's1', closerId: 'c1', qualificationScore: 30, notes: 'Test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Score mínimo de 50 para handoff');
  });

  it('should reject same person handoff', () => {
    const result = validateHandoff({ leadId: 'l1', sdrId: 's1', closerId: 's1', qualificationScore: 80, notes: 'Test' });
    expect(result.errors).toContain('SDR e Closer devem ser diferentes');
  });
});

describe('Closer - Deal Stage Progression', () => {
  const CLOSER_STAGES = ['qualified', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost'];

  const canProgress = (currentStage: string, targetStage: string): boolean => {
    const currentIdx = CLOSER_STAGES.indexOf(currentStage);
    const targetIdx = CLOSER_STAGES.indexOf(targetStage);
    if (currentIdx === -1 || targetIdx === -1) return false;
    if (targetStage === 'closed_lost') return true; // Can lose at any stage
    return targetIdx === currentIdx + 1;
  };

  it('should allow forward progression', () => {
    expect(canProgress('qualified', 'proposal')).toBe(true);
    expect(canProgress('proposal', 'negotiation')).toBe(true);
  });

  it('should prevent skipping stages', () => {
    expect(canProgress('qualified', 'contract')).toBe(false);
  });

  it('should allow closing lost at any stage', () => {
    expect(canProgress('qualified', 'closed_lost')).toBe(true);
    expect(canProgress('negotiation', 'closed_lost')).toBe(true);
  });
});

describe('Closer - Win Rate Calculation', () => {
  const calculateWinRate = (deals: { status: string }[]): { winRate: number; won: number; lost: number; open: number } => {
    const won = deals.filter(d => d.status === 'closed_won').length;
    const lost = deals.filter(d => d.status === 'closed_lost').length;
    const open = deals.filter(d => d.status !== 'closed_won' && d.status !== 'closed_lost').length;
    const closed = won + lost;
    return { winRate: closed > 0 ? Math.round((won / closed) * 100) : 0, won, lost, open };
  };

  it('should calculate win rate', () => {
    const deals = [
      { status: 'closed_won' }, { status: 'closed_won' }, { status: 'closed_won' },
      { status: 'closed_lost' }, { status: 'closed_lost' },
      { status: 'negotiation' },
    ];
    const result = calculateWinRate(deals);
    expect(result.winRate).toBe(60);
    expect(result.won).toBe(3);
    expect(result.lost).toBe(2);
    expect(result.open).toBe(1);
  });

  it('should handle no closed deals', () => {
    expect(calculateWinRate([{ status: 'proposal' }]).winRate).toBe(0);
  });
});

describe('SDR - Activity Metrics', () => {
  const calculateActivityRate = (activities: { type: string }[], target: Record<string, number>): Record<string, { count: number; target: number; pct: number }> => {
    const result: Record<string, { count: number; target: number; pct: number }> = {};
    for (const [type, goal] of Object.entries(target)) {
      const count = activities.filter(a => a.type === type).length;
      result[type] = { count, target: goal, pct: goal > 0 ? Math.round((count / goal) * 100) : 0 };
    }
    return result;
  };

  it('should compute metrics per activity type', () => {
    const activities = [
      { type: 'call' }, { type: 'call' }, { type: 'call' },
      { type: 'email' }, { type: 'email' },
      { type: 'meeting' },
    ];
    const result = calculateActivityRate(activities, { call: 5, email: 10, meeting: 2 });
    expect(result.call.pct).toBe(60);
    expect(result.email.count).toBe(2);
    expect(result.meeting.pct).toBe(50);
  });
});
