/**
 * Automation & Workflow Engine Tests
 * Tests: trigger evaluation, action execution, condition chains, scheduling
 */
import { describe, it, expect } from 'vitest';

describe('Automation - Trigger Evaluation', () => {
  type Trigger = { field: string; operator: 'equals' | 'gt' | 'lt' | 'contains' | 'not_empty'; value: any };

  const evaluateTrigger = (trigger: Trigger, data: Record<string, any>): boolean => {
    const fieldValue = data[trigger.field];
    switch (trigger.operator) {
      case 'equals': return fieldValue === trigger.value;
      case 'gt': return Number(fieldValue) > Number(trigger.value);
      case 'lt': return Number(fieldValue) < Number(trigger.value);
      case 'contains': return String(fieldValue).toLowerCase().includes(String(trigger.value).toLowerCase());
      case 'not_empty': return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
      default: return false;
    }
  };

  it('should evaluate equals', () => {
    expect(evaluateTrigger({ field: 'status', operator: 'equals', value: 'won' }, { status: 'won' })).toBe(true);
    expect(evaluateTrigger({ field: 'status', operator: 'equals', value: 'won' }, { status: 'lost' })).toBe(false);
  });

  it('should evaluate greater than', () => {
    expect(evaluateTrigger({ field: 'amount', operator: 'gt', value: 10000 }, { amount: 15000 })).toBe(true);
    expect(evaluateTrigger({ field: 'amount', operator: 'gt', value: 10000 }, { amount: 5000 })).toBe(false);
  });

  it('should evaluate less than', () => {
    expect(evaluateTrigger({ field: 'days', operator: 'lt', value: 30 }, { days: 20 })).toBe(true);
  });

  it('should evaluate contains', () => {
    expect(evaluateTrigger({ field: 'name', operator: 'contains', value: 'corp' }, { name: 'ABC Corp' })).toBe(true);
  });

  it('should evaluate not_empty', () => {
    expect(evaluateTrigger({ field: 'email', operator: 'not_empty', value: null }, { email: 'a@b.com' })).toBe(true);
    expect(evaluateTrigger({ field: 'email', operator: 'not_empty', value: null }, { email: '' })).toBe(false);
  });
});

describe('Automation - Condition Chains (AND/OR)', () => {
  const evaluateConditionGroup = (
    conditions: { result: boolean }[],
    logic: 'AND' | 'OR'
  ): boolean => {
    if (logic === 'AND') return conditions.every(c => c.result);
    return conditions.some(c => c.result);
  };

  it('should AND all conditions', () => {
    expect(evaluateConditionGroup([{ result: true }, { result: true }], 'AND')).toBe(true);
    expect(evaluateConditionGroup([{ result: true }, { result: false }], 'AND')).toBe(false);
  });

  it('should OR any condition', () => {
    expect(evaluateConditionGroup([{ result: false }, { result: true }], 'OR')).toBe(true);
    expect(evaluateConditionGroup([{ result: false }, { result: false }], 'OR')).toBe(false);
  });
});

describe('Automation - Action Types', () => {
  const ACTION_TYPES = ['send_email', 'create_task', 'update_field', 'notify', 'assign_lead', 'move_stage'];

  it('should have 6 action types', () => {
    expect(ACTION_TYPES).toHaveLength(6);
  });

  it('should include all standard actions', () => {
    expect(ACTION_TYPES).toContain('send_email');
    expect(ACTION_TYPES).toContain('create_task');
    expect(ACTION_TYPES).toContain('notify');
  });
});

describe('Automation - Scheduling Logic', () => {
  const shouldRun = (schedule: { type: 'immediate' | 'delay' | 'scheduled'; delayMinutes?: number; scheduledTime?: string }): boolean => {
    if (schedule.type === 'immediate') return true;
    if (schedule.type === 'delay' && schedule.delayMinutes) {
      return schedule.delayMinutes <= 0;
    }
    if (schedule.type === 'scheduled' && schedule.scheduledTime) {
      return new Date(schedule.scheduledTime).getTime() <= Date.now();
    }
    return false;
  };

  it('should run immediately', () => {
    expect(shouldRun({ type: 'immediate' })).toBe(true);
  });

  it('should not run with future delay', () => {
    expect(shouldRun({ type: 'delay', delayMinutes: 30 })).toBe(false);
  });

  it('should run with zero delay', () => {
    expect(shouldRun({ type: 'delay', delayMinutes: 0 })).toBe(true);
  });

  it('should run past scheduled time', () => {
    expect(shouldRun({ type: 'scheduled', scheduledTime: '2020-01-01T00:00:00Z' })).toBe(true);
  });

  it('should not run future scheduled time', () => {
    expect(shouldRun({ type: 'scheduled', scheduledTime: '2030-01-01T00:00:00Z' })).toBe(false);
  });
});

describe('Automation - Execution History', () => {
  const getExecutionStats = (executions: { status: 'success' | 'error' | 'skipped' }[]): Record<string, number> => {
    return executions.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const calculateSuccessRate = (stats: Record<string, number>): number => {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round(((stats.success || 0) / total) * 100) : 0;
  };

  it('should count by status', () => {
    const stats = getExecutionStats([
      { status: 'success' }, { status: 'success' }, { status: 'error' }, { status: 'skipped' },
    ]);
    expect(stats.success).toBe(2);
    expect(stats.error).toBe(1);
    expect(stats.skipped).toBe(1);
  });

  it('should calculate success rate', () => {
    expect(calculateSuccessRate({ success: 8, error: 2 })).toBe(80);
    expect(calculateSuccessRate({})).toBe(0);
  });
});

describe('Automation - Rate Limiting', () => {
  const MAX_EXECUTIONS_PER_HOUR = 100;

  const isRateLimited = (executionsInLastHour: number): boolean => {
    return executionsInLastHour >= MAX_EXECUTIONS_PER_HOUR;
  };

  it('should allow under limit', () => {
    expect(isRateLimited(50)).toBe(false);
  });

  it('should block at limit', () => {
    expect(isRateLimited(100)).toBe(true);
  });

  it('should block over limit', () => {
    expect(isRateLimited(150)).toBe(true);
  });
});
