/**
 * Task Management Tests
 * Tests: task CRUD, priority sorting, due date logic, stagnation detection
 */
import { describe, it, expect } from 'vitest';

describe('Task Priority', () => {
  const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
  const PRIORITY_WEIGHTS: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const sortByPriority = (tasks: { title: string; priority: string }[]) => {
    return [...tasks].sort((a, b) => (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0));
  };

  it('should have 4 priorities', () => {
    expect(PRIORITIES).toHaveLength(4);
  });

  it('should sort critical first', () => {
    const tasks = [
      { title: 'Low task', priority: 'low' },
      { title: 'Critical task', priority: 'critical' },
      { title: 'Medium task', priority: 'medium' },
    ];
    expect(sortByPriority(tasks)[0].priority).toBe('critical');
  });
});

describe('Task Due Date Logic', () => {
  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date(new Date().toISOString().split('T')[0]);
  };

  const isDueToday = (dueDate: string): boolean => {
    return dueDate === new Date().toISOString().split('T')[0];
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date(new Date().toISOString().split('T')[0]);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  it('should detect overdue tasks', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
  });

  it('should detect future tasks as not overdue', () => {
    expect(isOverdue('2030-01-01')).toBe(false);
  });

  it('should detect due today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isDueToday(today)).toBe(true);
  });

  it('should calculate days until due', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(getDaysUntilDue(future.toISOString().split('T')[0])).toBe(5);
  });
});

describe('Task Status Transitions', () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    'pending': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'pending', 'cancelled'],
    'completed': ['pending'],
    'cancelled': ['pending'],
  };

  const canTransition = (from: string, to: string): boolean => {
    return (VALID_TRANSITIONS[from] || []).includes(to);
  };

  it('should allow pending -> in_progress', () => {
    expect(canTransition('pending', 'in_progress')).toBe(true);
  });

  it('should allow in_progress -> completed', () => {
    expect(canTransition('in_progress', 'completed')).toBe(true);
  });

  it('should block completed -> in_progress', () => {
    expect(canTransition('completed', 'in_progress')).toBe(false);
  });

  it('should allow reopen from completed', () => {
    expect(canTransition('completed', 'pending')).toBe(true);
  });

  it('should allow cancel from any active state', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true);
    expect(canTransition('in_progress', 'cancelled')).toBe(true);
  });
});

describe('Task Stagnation Detection', () => {
  const isStagnant = (lastUpdated: string, thresholdDays: number = 3): boolean => {
    const daysSince = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > thresholdDays;
  };

  it('should detect stagnant task', () => {
    const old = new Date();
    old.setDate(old.getDate() - 5);
    expect(isStagnant(old.toISOString())).toBe(true);
  });

  it('should not flag recent task', () => {
    expect(isStagnant(new Date().toISOString())).toBe(false);
  });

  it('should respect custom threshold', () => {
    const old = new Date();
    old.setDate(old.getDate() - 5);
    expect(isStagnant(old.toISOString(), 7)).toBe(false);
    expect(isStagnant(old.toISOString(), 3)).toBe(true);
  });
});

describe('Task Completion Rate', () => {
  const calculateCompletionRate = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCompletionTrend = (rates: number[]): 'improving' | 'stable' | 'declining' => {
    if (rates.length < 2) return 'stable';
    const recent = rates.slice(-3);
    const older = rates.slice(0, 3);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
    if (avgRecent - avgOlder > 5) return 'improving';
    if (avgOlder - avgRecent > 5) return 'declining';
    return 'stable';
  };

  it('should calculate rate', () => {
    expect(calculateCompletionRate(7, 10)).toBe(70);
    expect(calculateCompletionRate(0, 0)).toBe(0);
  });

  it('should detect improving trend', () => {
    expect(getCompletionTrend([50, 55, 60, 70, 80, 85])).toBe('improving');
  });

  it('should detect declining trend', () => {
    expect(getCompletionTrend([85, 80, 70, 55, 50, 45])).toBe('declining');
  });

  it('should detect stable trend', () => {
    expect(getCompletionTrend([70, 72, 71, 70, 71, 72])).toBe('stable');
  });
});
