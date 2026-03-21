/**
 * Onboarding & Tour Tests
 * Tests: step progression, completion tracking, skip logic, tooltips
 */
import { describe, it, expect } from 'vitest';

describe('Onboarding - Step Progression', () => {
  type Step = { id: string; title: string; completed: boolean; required: boolean };

  const getNextStep = (steps: Step[]): Step | null => {
    return steps.find(s => !s.completed) || null;
  };

  const getProgress = (steps: Step[]): { completed: number; total: number; pct: number } => {
    const completed = steps.filter(s => s.completed).length;
    return { completed, total: steps.length, pct: Math.round((completed / steps.length) * 100) };
  };

  const canSkip = (step: Step, skippedCount: number, maxSkips: number = 2): boolean => {
    if (step.required) return false;
    return skippedCount < maxSkips;
  };

  const steps: Step[] = [
    { id: 'profile', title: 'Completar perfil', completed: true, required: true },
    { id: 'first_sale', title: 'Registrar venda', completed: false, required: true },
    { id: 'invite_team', title: 'Convidar equipe', completed: false, required: false },
    { id: 'set_goal', title: 'Definir meta', completed: false, required: true },
  ];

  it('should find next incomplete step', () => {
    expect(getNextStep(steps)?.id).toBe('first_sale');
  });

  it('should return null when all done', () => {
    const allDone = steps.map(s => ({ ...s, completed: true }));
    expect(getNextStep(allDone)).toBeNull();
  });

  it('should calculate progress', () => {
    const progress = getProgress(steps);
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(4);
    expect(progress.pct).toBe(25);
  });

  it('should allow skipping optional steps', () => {
    expect(canSkip(steps[2], 0)).toBe(true); // invite_team is optional
  });

  it('should prevent skipping required steps', () => {
    expect(canSkip(steps[1], 0)).toBe(false); // first_sale is required
  });

  it('should limit total skips', () => {
    expect(canSkip(steps[2], 2)).toBe(false);
  });
});

describe('Onboarding - Checklist Persistence', () => {
  const serializeProgress = (completedIds: string[]): string => {
    return JSON.stringify({ completedIds, lastUpdated: new Date().toISOString() });
  };

  const deserializeProgress = (json: string): { completedIds: string[]; lastUpdated: string } | null => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.completedIds)) return data;
      return null;
    } catch { return null; }
  };

  it('should serialize and deserialize', () => {
    const json = serializeProgress(['step1', 'step2']);
    const result = deserializeProgress(json);
    expect(result?.completedIds).toEqual(['step1', 'step2']);
  });

  it('should handle invalid JSON', () => {
    expect(deserializeProgress('not json')).toBeNull();
  });

  it('should handle malformed data', () => {
    expect(deserializeProgress('{"foo":"bar"}')).toBeNull();
  });
});

describe('Tour - Tooltip Positioning', () => {
  type Position = 'top' | 'bottom' | 'left' | 'right';

  const calculatePosition = (targetRect: { top: number; left: number; width: number; height: number }, viewportHeight: number): Position => {
    const spaceAbove = targetRect.top;
    const spaceBelow = viewportHeight - (targetRect.top + targetRect.height);
    if (spaceBelow >= 200) return 'bottom';
    if (spaceAbove >= 200) return 'top';
    if (targetRect.left >= 300) return 'left';
    return 'right';
  };

  it('should prefer bottom', () => {
    expect(calculatePosition({ top: 100, left: 200, width: 100, height: 40 }, 800)).toBe('bottom');
  });

  it('should use top when near bottom', () => {
    expect(calculatePosition({ top: 700, left: 200, width: 100, height: 40 }, 800)).toBe('top');
  });

  it('should fallback to left/right', () => {
    expect(calculatePosition({ top: 400, left: 50, width: 100, height: 40 }, 500)).toBe('right');
  });
});

describe('Tour - Completion Rewards', () => {
  const getCompletionReward = (stepsCompleted: number, totalSteps: number): { xp: number; badge?: string } => {
    const pct = (stepsCompleted / totalSteps) * 100;
    if (pct >= 100) return { xp: 500, badge: 'onboarding_master' };
    if (pct >= 75) return { xp: 200 };
    if (pct >= 50) return { xp: 100 };
    return { xp: 0 };
  };

  it('should reward full completion', () => {
    const reward = getCompletionReward(5, 5);
    expect(reward.xp).toBe(500);
    expect(reward.badge).toBe('onboarding_master');
  });

  it('should give partial rewards', () => {
    expect(getCompletionReward(4, 5).xp).toBe(200);
    expect(getCompletionReward(3, 5).xp).toBe(100);
  });

  it('should give nothing for low completion', () => {
    expect(getCompletionReward(1, 5).xp).toBe(0);
  });
});
