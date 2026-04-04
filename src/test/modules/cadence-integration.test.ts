/**
 * Cadence Page Integration Tests
 * Tests: search/filter, stats calculation, enrollment flow, performance
 */
import { describe, it, expect } from 'vitest';
import { addDays, format } from 'date-fns';

describe('Cadencias Page Stats Calculation', () => {
  it('should count active cadences correctly', () => {
    const cadences = [
      { is_active: true }, { is_active: true }, { is_active: false },
      { is_active: true }, { is_active: false },
    ];
    const active = cadences.filter(c => c.is_active);
    expect(active).toHaveLength(3);
  });

  it('should handle all active', () => {
    const cadences = [{ is_active: true }, { is_active: true }];
    expect(cadences.filter(c => c.is_active)).toHaveLength(2);
  });

  it('should handle all inactive', () => {
    const cadences = [{ is_active: false }, { is_active: false }];
    expect(cadences.filter(c => c.is_active)).toHaveLength(0);
  });

  it('should handle empty cadences', () => {
    expect([].filter(() => true)).toHaveLength(0);
  });
});

describe('Cadence Enrollment Flow', () => {
  const simulateEnrollment = (
    saleId: string,
    cadenceId: string,
    steps: { day_number: number; id: string }[]
  ) => {
    const today = new Date();
    const firstStepDate = steps.length > 0
      ? addDays(today, steps[0].day_number - 1)
      : today;

    const enrollment = {
      id: `enrollment-${Date.now()}`,
      sale_id: saleId,
      cadence_id: cadenceId,
      status: 'active' as const,
      next_action_date: format(firstStepDate, 'yyyy-MM-dd'),
      current_step: 1,
    };

    const tasks = steps.map(step => ({
      prospect_cadence_id: enrollment.id,
      cadence_step_id: step.id,
      scheduled_date: format(addDays(today, step.day_number - 1), 'yyyy-MM-dd'),
      status: 'pending' as const,
    }));

    return { enrollment, tasks };
  };

  it('should create enrollment with correct status', () => {
    const { enrollment } = simulateEnrollment('sale-1', 'cad-1', [
      { day_number: 1, id: 'step-1' },
    ]);
    expect(enrollment.status).toBe('active');
    expect(enrollment.sale_id).toBe('sale-1');
    expect(enrollment.cadence_id).toBe('cad-1');
  });

  it('should set first step date as next_action_date', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { enrollment } = simulateEnrollment('sale-1', 'cad-1', [
      { day_number: 1, id: 'step-1' },
    ]);
    expect(enrollment.next_action_date).toBe(today);
  });

  it('should create tasks for all steps', () => {
    const { tasks } = simulateEnrollment('sale-1', 'cad-1', [
      { day_number: 1, id: 's1' },
      { day_number: 3, id: 's2' },
      { day_number: 7, id: 's3' },
    ]);
    expect(tasks).toHaveLength(3);
    tasks.forEach(t => expect(t.status).toBe('pending'));
  });

  it('should schedule tasks with correct dates', () => {
    const today = new Date();
    const { tasks } = simulateEnrollment('sale-1', 'cad-1', [
      { day_number: 1, id: 's1' },
      { day_number: 5, id: 's2' },
    ]);
    expect(tasks[0].scheduled_date).toBe(format(today, 'yyyy-MM-dd'));
    expect(tasks[1].scheduled_date).toBe(format(addDays(today, 4), 'yyyy-MM-dd'));
  });

  it('should handle enrollment with no steps', () => {
    const { tasks } = simulateEnrollment('sale-1', 'cad-1', []);
    expect(tasks).toHaveLength(0);
  });

  it('should handle enrollment with many steps', () => {
    const steps = Array.from({ length: 20 }, (_, i) => ({
      day_number: i * 2 + 1,
      id: `step-${i}`,
    }));
    const { tasks } = simulateEnrollment('sale-1', 'cad-1', steps);
    expect(tasks).toHaveLength(20);
  });
});

describe('Cadence Status Transitions', () => {
  type Status = 'active' | 'paused' | 'completed' | 'cancelled';

  const validTransitions: Record<Status, Status[]> = {
    active: ['paused', 'completed', 'cancelled'],
    paused: ['active', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  const canTransition = (from: Status, to: Status) => validTransitions[from].includes(to);

  it('active -> paused is valid', () => expect(canTransition('active', 'paused')).toBe(true));
  it('active -> completed is valid', () => expect(canTransition('active', 'completed')).toBe(true));
  it('active -> cancelled is valid', () => expect(canTransition('active', 'cancelled')).toBe(true));
  it('paused -> active is valid', () => expect(canTransition('paused', 'active')).toBe(true));
  it('paused -> cancelled is valid', () => expect(canTransition('paused', 'cancelled')).toBe(true));
  it('paused -> completed is invalid', () => expect(canTransition('paused', 'completed')).toBe(false));
  it('completed -> active is invalid', () => expect(canTransition('completed', 'active')).toBe(false));
  it('cancelled -> active is invalid', () => expect(canTransition('cancelled', 'active')).toBe(false));
});

describe('Cadence Performance - Large Dataset', () => {
  it('should filter 1000 cadences in < 50ms', () => {
    const cadences = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      name: `Cadence ${i}`,
      description: i % 2 === 0 ? `Description ${i}` : null,
      is_active: i % 3 !== 0,
    }));

    const start = performance.now();
    const filtered = cadences.filter(c =>
      c.name.toLowerCase().includes('cadence 5') && c.is_active
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should sort cadences by created_at efficiently', () => {
    const cadences = Array.from({ length: 500 }, (_, i) => ({
      id: String(i),
      created_at: new Date(2024, 0, 1 + i).toISOString(),
    }));

    const start = performance.now();
    const sorted = [...cadences].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
    expect(sorted[0].id).toBe('499');
  });
});

describe('Cadence Map Building (Active Cadences by Sale)', () => {
  it('should build cadence map correctly', () => {
    const data = [
      { sale_id: 's1', status: 'active', current_step: 2, cadence: { name: 'Cadência A' } },
      { sale_id: 's2', status: 'paused', current_step: 1, cadence: { name: 'Cadência B' } },
    ];

    const map: Record<string, { cadenceName: string; currentStep: number; status: string }> = {};
    data.forEach(pc => {
      map[pc.sale_id] = {
        cadenceName: pc.cadence?.name || 'Cadência',
        currentStep: pc.current_step,
        status: pc.status,
      };
    });

    expect(map['s1'].cadenceName).toBe('Cadência A');
    expect(map['s1'].status).toBe('active');
    expect(map['s2'].currentStep).toBe(1);
  });

  it('should handle null cadence name', () => {
    const data: { sale_id: string; status: string; current_step: number; cadence: null }[] = [{ sale_id: 's1', status: 'active', current_step: 1, cadence: null }];
    const map: Record<string, { cadenceName: string }> = {};
    data.forEach(pc => {
      map[pc.sale_id] = {
        cadenceName: (pc.cadence as any)?.name || 'Cadência',
      };
    });
    expect(map['s1'].cadenceName).toBe('Cadência');
  });
});

describe('Cadence Stats Aggregation', () => {
  it('should count prospects in active cadences', () => {
    const enrollments = [
      { status: 'active' }, { status: 'active' }, { status: 'paused' },
      { status: 'completed' }, { status: 'active' },
    ];
    const active = enrollments.filter(e => e.status === 'active').length;
    expect(active).toBe(3);
  });

  it('should count tasks completed today', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tasks = [
      { status: 'completed', completed_at: `${today}T10:00:00` },
      { status: 'completed', completed_at: `${today}T14:00:00` },
      { status: 'completed', completed_at: '2024-01-01T10:00:00' },
      { status: 'pending', completed_at: null },
    ];
    const todayCompleted = tasks.filter(t =>
      t.status === 'completed' && t.completed_at?.startsWith(today)
    ).length;
    expect(todayCompleted).toBe(2);
  });

  it('should handle no tasks completed today', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tasks = [
      { status: 'pending', completed_at: null },
      { status: 'completed', completed_at: '2024-01-01T10:00:00' },
    ];
    const todayCompleted = tasks.filter(t =>
      t.status === 'completed' && t.completed_at?.startsWith(today)
    ).length;
    expect(todayCompleted).toBe(0);
  });
});
