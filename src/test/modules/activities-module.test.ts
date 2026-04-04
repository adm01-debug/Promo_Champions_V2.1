/**
 * Activities Module Tests
 * Tests: activity types, duration tracking, outcome classification, daily summaries
 */
import { describe, it, expect } from 'vitest';

describe('Activity Types', () => {
  const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'whatsapp', 'linkedin', 'visit', 'follow_up'];

  it('should have 7 activity types', () => {
    expect(ACTIVITY_TYPES).toHaveLength(7);
  });

  it('should include all standard types', () => {
    expect(ACTIVITY_TYPES).toContain('call');
    expect(ACTIVITY_TYPES).toContain('email');
    expect(ACTIVITY_TYPES).toContain('meeting');
    expect(ACTIVITY_TYPES).toContain('whatsapp');
  });
});

describe('Activity Outcomes', () => {

  const classifyOutcome = (outcome: string): 'success' | 'failure' | 'pending' => {
    if (['positive', 'scheduled'].includes(outcome)) return 'success';
    if (['negative'].includes(outcome)) return 'failure';
    return 'pending';
  };

  it('should classify positive as success', () => {
    expect(classifyOutcome('positive')).toBe('success');
    expect(classifyOutcome('scheduled')).toBe('success');
  });

  it('should classify negative as failure', () => {
    expect(classifyOutcome('negative')).toBe('failure');
  });

  it('should classify neutral/no_answer as pending', () => {
    expect(classifyOutcome('neutral')).toBe('pending');
    expect(classifyOutcome('no_answer')).toBe('pending');
  });
});

describe('Activity Duration Tracking', () => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const calculateAvgDuration = (durations: number[]): number => {
    if (durations.length === 0) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  };

  it('should format minutes under 60', () => {
    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(5)).toBe('5min');
  });

  it('should format hours', () => {
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('should calculate average duration', () => {
    expect(calculateAvgDuration([30, 60, 45])).toBe(45);
    expect(calculateAvgDuration([])).toBe(0);
  });
});

describe('Activity Daily Summary', () => {
  const summarizeByType = (activities: { type: string }[]): Map<string, number> => {
    const map = new Map<string, number>();
    activities.forEach(a => map.set(a.type, (map.get(a.type) || 0) + 1));
    return map;
  };

  const calculateProductivity = (completed: number, planned: number): number => {
    return planned > 0 ? Math.round((completed / planned) * 100) : 0;
  };

  it('should summarize by type', () => {
    const activities = [
      { type: 'call' }, { type: 'call' }, { type: 'email' }, { type: 'meeting' },
    ];
    const summary = summarizeByType(activities);
    expect(summary.get('call')).toBe(2);
    expect(summary.get('email')).toBe(1);
    expect(summary.get('meeting')).toBe(1);
  });

  it('should calculate productivity', () => {
    expect(calculateProductivity(8, 10)).toBe(80);
    expect(calculateProductivity(12, 10)).toBe(120);
    expect(calculateProductivity(0, 0)).toBe(0);
  });
});

describe('Activity Filters', () => {
  type Activity = { type: string; outcome: string; date: string; salesperson_id: string };

  const filterActivities = (
    activities: Activity[],
    filters: { type?: string; outcome?: string; salesperson_id?: string }
  ): Activity[] => {
    return activities.filter(a => {
      if (filters.type && a.type !== filters.type) return false;
      if (filters.outcome && a.outcome !== filters.outcome) return false;
      if (filters.salesperson_id && a.salesperson_id !== filters.salesperson_id) return false;
      return true;
    });
  };

  const activities: Activity[] = [
    { type: 'call', outcome: 'positive', date: '2024-01-01', salesperson_id: '1' },
    { type: 'email', outcome: 'negative', date: '2024-01-01', salesperson_id: '2' },
    { type: 'call', outcome: 'neutral', date: '2024-01-02', salesperson_id: '1' },
  ];

  it('should filter by type', () => {
    expect(filterActivities(activities, { type: 'call' })).toHaveLength(2);
  });

  it('should filter by outcome', () => {
    expect(filterActivities(activities, { outcome: 'positive' })).toHaveLength(1);
  });

  it('should filter by salesperson', () => {
    expect(filterActivities(activities, { salesperson_id: '1' })).toHaveLength(2);
  });

  it('should combine filters', () => {
    expect(filterActivities(activities, { type: 'call', salesperson_id: '1' })).toHaveLength(2);
  });

  it('should return all for empty filters', () => {
    expect(filterActivities(activities, {})).toHaveLength(3);
  });
});

describe('Activity Streak Detection', () => {
  const calculateStreak = (activityDates: string[]): number => {
    if (activityDates.length === 0) return 0;
    const sorted = [...activityDates].sort().reverse();
    const unique = [...new Set(sorted)];
    let streak = 1;
    for (let i = 1; i < unique.length; i++) {
      const curr = new Date(unique[i - 1]);
      const prev = new Date(unique[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  };

  it('should count consecutive days', () => {
    expect(calculateStreak(['2024-01-01', '2024-01-02', '2024-01-03'])).toBe(3);
  });

  it('should break on gaps', () => {
    expect(calculateStreak(['2024-01-01', '2024-01-02', '2024-01-05'])).toBe(1);
  });

  it('should handle duplicates', () => {
    expect(calculateStreak(['2024-01-01', '2024-01-01', '2024-01-02'])).toBe(2);
  });

  it('should handle empty', () => {
    expect(calculateStreak([])).toBe(0);
  });
});
