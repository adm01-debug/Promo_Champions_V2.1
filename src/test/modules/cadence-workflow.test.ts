/**
 * Cadence Workflow Tests
 * Tests: step scheduling, task generation, completion tracking
 */
import { describe, it, expect } from 'vitest';
import { addDays, format } from 'date-fns';

describe('Cadence Step Scheduling', () => {
  const scheduleSteps = (startDate: Date, steps: { dayNumber: number; title: string }[]) => {
    return steps.map(step => ({
      ...step,
      scheduledDate: addDays(startDate, step.dayNumber),
      formattedDate: format(addDays(startDate, step.dayNumber), 'dd/MM/yyyy'),
    }));
  };

  it('should schedule steps relative to start date', () => {
    const start = new Date(2024, 0, 1);
    const steps = [
      { dayNumber: 0, title: 'Email inicial' },
      { dayNumber: 3, title: 'Follow-up telefone' },
      { dayNumber: 7, title: 'LinkedIn' },
    ];
    const scheduled = scheduleSteps(start, steps);
    expect(scheduled[0].formattedDate).toBe('01/01/2024');
    expect(scheduled[1].formattedDate).toBe('04/01/2024');
    expect(scheduled[2].formattedDate).toBe('08/01/2024');
  });

  it('should handle single step', () => {
    const start = new Date(2024, 5, 15);
    const scheduled = scheduleSteps(start, [{ dayNumber: 0, title: 'Only step' }]);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].formattedDate).toBe('15/06/2024');
  });

  it('should handle empty steps', () => {
    expect(scheduleSteps(new Date(), [])).toHaveLength(0);
  });
});

describe('Cadence Task Status', () => {
  type TaskStatus = 'pending' | 'completed' | 'skipped' | 'overdue';

  const getTaskStatus = (scheduledDate: Date, completedAt: string | null, now: Date): TaskStatus => {
    if (completedAt) return 'completed';
    if (scheduledDate < now) return 'overdue';
    return 'pending';
  };

  it('should be completed when has completedAt', () => {
    expect(getTaskStatus(new Date(), new Date().toISOString(), new Date())).toBe('completed');
  });

  it('should be overdue when past due', () => {
    const past = new Date(Date.now() - 86400000);
    expect(getTaskStatus(past, null, new Date())).toBe('overdue');
  });

  it('should be pending when future', () => {
    const future = new Date(Date.now() + 86400000);
    expect(getTaskStatus(future, null, new Date())).toBe('pending');
  });
});

describe('Cadence Completion Rate', () => {
  const calculateCompletionRate = (tasks: { status: string }[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  it('should return 0 for empty tasks', () => {
    expect(calculateCompletionRate([])).toBe(0);
  });

  it('should return 100 for all completed', () => {
    const tasks = [{ status: 'completed' }, { status: 'completed' }];
    expect(calculateCompletionRate(tasks)).toBe(100);
  });

  it('should return 50 for half completed', () => {
    const tasks = [{ status: 'completed' }, { status: 'pending' }];
    expect(calculateCompletionRate(tasks)).toBe(50);
  });

  it('should return 0 for none completed', () => {
    const tasks = [{ status: 'pending' }, { status: 'overdue' }];
    expect(calculateCompletionRate(tasks)).toBe(0);
  });
});

describe('Cadence Action Types', () => {
  const ACTION_TYPES = ['email', 'call', 'linkedin', 'whatsapp', 'meeting', 'task'];

  it('should have 6 action types', () => {
    expect(ACTION_TYPES).toHaveLength(6);
  });

  it('should include all communication channels', () => {
    expect(ACTION_TYPES).toContain('email');
    expect(ACTION_TYPES).toContain('call');
    expect(ACTION_TYPES).toContain('linkedin');
    expect(ACTION_TYPES).toContain('whatsapp');
  });

  it('should include meeting and task', () => {
    expect(ACTION_TYPES).toContain('meeting');
    expect(ACTION_TYPES).toContain('task');
  });
});
