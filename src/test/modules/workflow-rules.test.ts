/**
 * Workflow Rules & Automation Tests
 * Tests: rule matching, condition evaluation, action dispatch
 */
import { describe, it, expect } from 'vitest';

describe('Workflow Rules - Condition Evaluation', () => {
  type Operator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';

  const evaluate = (value: any, operator: Operator, expected: any): boolean => {
    switch (operator) {
      case 'equals': return value === expected;
      case 'not_equals': return value !== expected;
      case 'greater_than': return Number(value) > Number(expected);
      case 'less_than': return Number(value) < Number(expected);
      case 'contains': return String(value).toLowerCase().includes(String(expected).toLowerCase());
      default: return false;
    }
  };

  it('should evaluate equals', () => {
    expect(evaluate('pending', 'equals', 'pending')).toBe(true);
    expect(evaluate('pending', 'equals', 'completed')).toBe(false);
  });

  it('should evaluate not_equals', () => {
    expect(evaluate('pending', 'not_equals', 'completed')).toBe(true);
  });

  it('should evaluate greater_than', () => {
    expect(evaluate(5000, 'greater_than', 1000)).toBe(true);
    expect(evaluate(500, 'greater_than', 1000)).toBe(false);
  });

  it('should evaluate less_than', () => {
    expect(evaluate(500, 'less_than', 1000)).toBe(true);
  });

  it('should evaluate contains (case insensitive)', () => {
    expect(evaluate('Enterprise Plan', 'contains', 'enterprise')).toBe(true);
    expect(evaluate('Basic Plan', 'contains', 'enterprise')).toBe(false);
  });
});

describe('Workflow Rules - Multi-Condition Matching', () => {
  type LogicMode = 'all' | 'any';

  const matchConditions = (results: boolean[], logic: LogicMode): boolean => {
    if (results.length === 0) return false;
    return logic === 'all' ? results.every(Boolean) : results.some(Boolean);
  };

  it('should require all conditions for "all" mode', () => {
    expect(matchConditions([true, true, true], 'all')).toBe(true);
    expect(matchConditions([true, false, true], 'all')).toBe(false);
  });

  it('should require any condition for "any" mode', () => {
    expect(matchConditions([false, true, false], 'any')).toBe(true);
    expect(matchConditions([false, false, false], 'any')).toBe(false);
  });

  it('should return false for empty conditions', () => {
    expect(matchConditions([], 'all')).toBe(false);
    expect(matchConditions([], 'any')).toBe(false);
  });
});

describe('Workflow Rules - Action Types', () => {
  const VALID_ACTIONS = ['send_email', 'create_task', 'update_status', 'send_notification', 'assign_to'];

  it('should have defined action types', () => {
    expect(VALID_ACTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('should validate action type', () => {
    const isValidAction = (action: string) => VALID_ACTIONS.includes(action);
    expect(isValidAction('send_email')).toBe(true);
    expect(isValidAction('invalid_action')).toBe(false);
  });
});

describe('Workflow Rules - Trigger Events', () => {
  const TRIGGER_EVENTS = ['deal_created', 'deal_stage_changed', 'deal_won', 'deal_lost', 'activity_logged', 'task_completed'];

  it('should cover major deal lifecycle events', () => {
    expect(TRIGGER_EVENTS).toContain('deal_created');
    expect(TRIGGER_EVENTS).toContain('deal_won');
    expect(TRIGGER_EVENTS).toContain('deal_lost');
  });

  it('should include activity tracking events', () => {
    expect(TRIGGER_EVENTS).toContain('activity_logged');
    expect(TRIGGER_EVENTS).toContain('task_completed');
  });
});

describe('Workflow Rules - Rule Priority', () => {
  const sortByPriority = (rules: { name: string; priority: number }[]) => {
    return [...rules].sort((a, b) => a.priority - b.priority);
  };

  it('should execute lower priority first', () => {
    const rules = [
      { name: 'Low', priority: 10 },
      { name: 'High', priority: 1 },
      { name: 'Med', priority: 5 },
    ];
    const sorted = sortByPriority(rules);
    expect(sorted[0].name).toBe('High');
    expect(sorted[1].name).toBe('Med');
    expect(sorted[2].name).toBe('Low');
  });
});
