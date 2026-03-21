/**
 * Prospect Cadence & Email Tracking Tests
 * Tests: cadence execution, step scheduling, email open/click tracking, follow-up
 */
import { describe, it, expect } from 'vitest';

describe('Cadence - Step Scheduling', () => {
  const scheduleSteps = (startDate: string, steps: { dayNumber: number; action: string }[]): { date: string; action: string }[] => {
    const start = new Date(startDate);
    return steps.map(step => {
      const d = new Date(start);
      d.setDate(d.getDate() + step.dayNumber);
      return { date: d.toISOString().split('T')[0], action: step.action };
    });
  };

  it('should schedule steps from start date', () => {
    const scheduled = scheduleSteps('2024-01-01', [
      { dayNumber: 0, action: 'email' },
      { dayNumber: 3, action: 'call' },
      { dayNumber: 7, action: 'linkedin' },
    ]);
    expect(scheduled[0].date).toBe('2024-01-01');
    expect(scheduled[1].date).toBe('2024-01-04');
    expect(scheduled[2].date).toBe('2024-01-08');
  });
});

describe('Cadence - Prospect Status', () => {
  const getProspectCadenceStatus = (tasks: { status: string }[]): 'not_started' | 'in_progress' | 'completed' | 'stalled' => {
    if (tasks.length === 0) return 'not_started';
    const completed = tasks.filter(t => t.status === 'completed').length;
    if (completed === tasks.length) return 'completed';
    const pending = tasks.filter(t => t.status === 'pending').length;
    if (pending === tasks.length) return 'not_started';
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    if (overdue > 0) return 'stalled';
    return 'in_progress';
  };

  it('should detect not started', () => {
    expect(getProspectCadenceStatus([{ status: 'pending' }, { status: 'pending' }])).toBe('not_started');
  });

  it('should detect completed', () => {
    expect(getProspectCadenceStatus([{ status: 'completed' }, { status: 'completed' }])).toBe('completed');
  });

  it('should detect in progress', () => {
    expect(getProspectCadenceStatus([{ status: 'completed' }, { status: 'pending' }])).toBe('in_progress');
  });

  it('should detect stalled', () => {
    expect(getProspectCadenceStatus([{ status: 'completed' }, { status: 'overdue' }])).toBe('stalled');
  });

  it('should handle empty', () => {
    expect(getProspectCadenceStatus([])).toBe('not_started');
  });
});

describe('Email Tracking - Engagement Score', () => {
  const calculateEngagement = (events: { type: string }[]): { opens: number; clicks: number; replies: number; score: number } => {
    const opens = events.filter(e => e.type === 'open').length;
    const clicks = events.filter(e => e.type === 'click').length;
    const replies = events.filter(e => e.type === 'reply').length;
    const score = Math.min(100, opens * 10 + clicks * 25 + replies * 40);
    return { opens, clicks, replies, score };
  };

  it('should score high engagement', () => {
    const events = [
      { type: 'open' }, { type: 'open' }, { type: 'click' }, { type: 'reply' },
    ];
    const result = calculateEngagement(events);
    expect(result.opens).toBe(2);
    expect(result.clicks).toBe(1);
    expect(result.score).toBe(85); // 20 + 25 + 40 = 85
  });

  it('should score low engagement', () => {
    expect(calculateEngagement([{ type: 'open' }]).score).toBe(10);
  });

  it('should handle no engagement', () => {
    expect(calculateEngagement([]).score).toBe(0);
  });
});

describe('Email Tracking - Best Send Time', () => {
  const findBestSendTime = (opens: { hour: number }[]): number => {
    if (opens.length === 0) return 9; // Default 9am
    const hourCounts = new Map<number, number>();
    opens.forEach(o => hourCounts.set(o.hour, (hourCounts.get(o.hour) || 0) + 1));
    let bestHour = 9;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) { maxCount = count; bestHour = hour; }
    });
    return bestHour;
  };

  it('should find peak hour', () => {
    const opens = [
      { hour: 9 }, { hour: 10 }, { hour: 10 }, { hour: 10 }, { hour: 14 }, { hour: 14 },
    ];
    expect(findBestSendTime(opens)).toBe(10);
  });

  it('should default to 9am', () => {
    expect(findBestSendTime([])).toBe(9);
  });
});

describe('Follow-up - Timing Logic', () => {
  const shouldFollowUp = (lastContact: string, daysThreshold: number = 3): boolean => {
    const daysSince = Math.floor((Date.now() - new Date(lastContact).getTime()) / 86400000);
    return daysSince >= daysThreshold;
  };

  const getFollowUpPriority = (daysSince: number, dealValue: number): 'urgent' | 'normal' | 'low' => {
    if (daysSince >= 7 && dealValue >= 50000) return 'urgent';
    if (daysSince >= 5 || dealValue >= 30000) return 'normal';
    return 'low';
  };

  it('should trigger follow-up after threshold', () => {
    const old = new Date(Date.now() - 5 * 86400000).toISOString();
    expect(shouldFollowUp(old, 3)).toBe(true);
  });

  it('should not trigger before threshold', () => {
    expect(shouldFollowUp(new Date().toISOString(), 3)).toBe(false);
  });

  it('should prioritize urgent', () => {
    expect(getFollowUpPriority(10, 80000)).toBe('urgent');
  });

  it('should prioritize normal', () => {
    expect(getFollowUpPriority(6, 20000)).toBe('normal');
  });

  it('should default to low', () => {
    expect(getFollowUpPriority(2, 5000)).toBe('low');
  });
});

describe('Cadence - Completion Rate', () => {
  const calculateCompletionRate = (cadences: { totalSteps: number; completedSteps: number }[]): number => {
    if (cadences.length === 0) return 0;
    const totalSteps = cadences.reduce((s, c) => s + c.totalSteps, 0);
    const completedSteps = cadences.reduce((s, c) => s + c.completedSteps, 0);
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  it('should calculate overall completion', () => {
    const cadences = [
      { totalSteps: 5, completedSteps: 5 },
      { totalSteps: 5, completedSteps: 3 },
      { totalSteps: 5, completedSteps: 0 },
    ];
    expect(calculateCompletionRate(cadences)).toBe(53);
  });

  it('should handle empty', () => {
    expect(calculateCompletionRate([])).toBe(0);
  });
});
