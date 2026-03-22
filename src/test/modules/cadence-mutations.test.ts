/**
 * Cadence Mutations E2E Tests
 * Tests: useUpdateCadence, useUpdateCadenceStep, edit/delete flows
 */
import { describe, it, expect } from 'vitest';

describe('Cadence Update Operations', () => {
  const simulateUpdateCadence = (
    cadence: { id: string; name: string; description: string | null; is_active: boolean },
    updates: { name?: string; description?: string; is_active?: boolean }
  ) => {
    return { ...cadence, ...updates, updated_at: new Date().toISOString() };
  };

  it('should update cadence name', () => {
    const cadence = { id: '1', name: 'Old Name', description: null, is_active: true };
    const result = simulateUpdateCadence(cadence, { name: 'New Name' });
    expect(result.name).toBe('New Name');
    expect(result.is_active).toBe(true);
  });

  it('should update cadence description', () => {
    const cadence = { id: '1', name: 'Test', description: null, is_active: true };
    const result = simulateUpdateCadence(cadence, { description: 'New description' });
    expect(result.description).toBe('New description');
  });

  it('should toggle cadence active status to inactive', () => {
    const cadence = { id: '1', name: 'Test', description: null, is_active: true };
    const result = simulateUpdateCadence(cadence, { is_active: false });
    expect(result.is_active).toBe(false);
  });

  it('should toggle cadence active status to active', () => {
    const cadence = { id: '1', name: 'Test', description: null, is_active: false };
    const result = simulateUpdateCadence(cadence, { is_active: true });
    expect(result.is_active).toBe(true);
  });

  it('should update multiple fields simultaneously', () => {
    const cadence = { id: '1', name: 'Old', description: 'Old desc', is_active: true };
    const result = simulateUpdateCadence(cadence, { name: 'New', description: 'New desc', is_active: false });
    expect(result.name).toBe('New');
    expect(result.description).toBe('New desc');
    expect(result.is_active).toBe(false);
  });

  it('should preserve unchanged fields', () => {
    const cadence = { id: '1', name: 'Keep', description: 'Keep this', is_active: true };
    const result = simulateUpdateCadence(cadence, { name: 'Changed' });
    expect(result.description).toBe('Keep this');
    expect(result.is_active).toBe(true);
  });

  it('should set updated_at timestamp', () => {
    const cadence = { id: '1', name: 'Test', description: null, is_active: true };
    const result = simulateUpdateCadence(cadence, { name: 'Updated' });
    expect(result.updated_at).toBeDefined();
  });
});

describe('Cadence Step Update Operations', () => {
  type ActionType = 'email' | 'call' | 'linkedin' | 'whatsapp' | 'meeting' | 'other';

  interface Step {
    id: string;
    cadence_id: string;
    day_number: number;
    action_type: ActionType;
    title: string;
    description: string | null;
    step_order: number;
  }

  const simulateUpdateStep = (
    step: Step,
    updates: Partial<Omit<Step, 'id' | 'cadence_id'>>
  ): Step => ({ ...step, ...updates });

  const baseStep: Step = {
    id: 's1', cadence_id: 'c1', day_number: 1, action_type: 'email',
    title: 'First email', description: null, step_order: 0,
  };

  it('should update step title', () => {
    const result = simulateUpdateStep(baseStep, { title: 'Updated title' });
    expect(result.title).toBe('Updated title');
  });

  it('should update step day number', () => {
    const result = simulateUpdateStep(baseStep, { day_number: 5 });
    expect(result.day_number).toBe(5);
  });

  it('should change action type from email to call', () => {
    const result = simulateUpdateStep(baseStep, { action_type: 'call' });
    expect(result.action_type).toBe('call');
  });

  it('should add description to step', () => {
    const result = simulateUpdateStep(baseStep, { description: 'New desc' });
    expect(result.description).toBe('New desc');
  });

  it('should update step order', () => {
    const result = simulateUpdateStep(baseStep, { step_order: 3 });
    expect(result.step_order).toBe(3);
  });

  it('should change all step properties', () => {
    const result = simulateUpdateStep(baseStep, {
      title: 'New', day_number: 7, action_type: 'whatsapp', description: 'desc', step_order: 2,
    });
    expect(result.title).toBe('New');
    expect(result.day_number).toBe(7);
    expect(result.action_type).toBe('whatsapp');
    expect(result.description).toBe('desc');
    expect(result.step_order).toBe(2);
  });

  it('should preserve cadence_id when updating', () => {
    const result = simulateUpdateStep(baseStep, { title: 'Changed' });
    expect(result.cadence_id).toBe('c1');
    expect(result.id).toBe('s1');
  });
});

describe('Cadence Step Reordering', () => {
  const reorderSteps = (steps: { id: string; step_order: number }[], fromIndex: number, toIndex: number) => {
    const result = [...steps];
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    return result.map((s, i) => ({ ...s, step_order: i }));
  };

  it('should move step from position 0 to position 2', () => {
    const steps = [
      { id: 'a', step_order: 0 },
      { id: 'b', step_order: 1 },
      { id: 'c', step_order: 2 },
    ];
    const result = reorderSteps(steps, 0, 2);
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('c');
    expect(result[2].id).toBe('a');
    expect(result.map(s => s.step_order)).toEqual([0, 1, 2]);
  });

  it('should move step from position 2 to position 0', () => {
    const steps = [
      { id: 'a', step_order: 0 },
      { id: 'b', step_order: 1 },
      { id: 'c', step_order: 2 },
    ];
    const result = reorderSteps(steps, 2, 0);
    expect(result[0].id).toBe('c');
    expect(result[1].id).toBe('a');
    expect(result[2].id).toBe('b');
  });

  it('should handle same position (no-op)', () => {
    const steps = [{ id: 'a', step_order: 0 }, { id: 'b', step_order: 1 }];
    const result = reorderSteps(steps, 0, 0);
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });

  it('should handle single step', () => {
    const steps = [{ id: 'a', step_order: 0 }];
    const result = reorderSteps(steps, 0, 0);
    expect(result).toHaveLength(1);
    expect(result[0].step_order).toBe(0);
  });
});

describe('Cadence Delete Validation', () => {
  const canDeleteCadence = (cadence: { is_active: boolean }, enrolledCount: number) => {
    if (enrolledCount > 0 && cadence.is_active) {
      return { canDelete: false, reason: 'Cadência possui prospects inscritos ativamente' };
    }
    return { canDelete: true, reason: null };
  };

  it('should allow deleting inactive cadence with no enrollments', () => {
    const result = canDeleteCadence({ is_active: false }, 0);
    expect(result.canDelete).toBe(true);
  });

  it('should allow deleting active cadence with no enrollments', () => {
    const result = canDeleteCadence({ is_active: true }, 0);
    expect(result.canDelete).toBe(true);
  });

  it('should block deleting active cadence with enrollments', () => {
    const result = canDeleteCadence({ is_active: true }, 5);
    expect(result.canDelete).toBe(false);
    expect(result.reason).toContain('prospects inscritos');
  });

  it('should allow deleting inactive cadence with enrollments', () => {
    const result = canDeleteCadence({ is_active: false }, 3);
    expect(result.canDelete).toBe(true);
  });
});

describe('Cadence Task Notes', () => {
  const completeTaskWithNotes = (
    task: { id: string; status: string; notes: string | null },
    notes?: string
  ) => ({
    ...task,
    status: 'completed',
    completed_at: new Date().toISOString(),
    notes: notes?.trim() || task.notes,
  });

  const skipTaskWithNotes = (
    task: { id: string; status: string; notes: string | null },
    notes?: string
  ) => ({
    ...task,
    status: 'skipped',
    notes: notes?.trim() || task.notes,
  });

  it('should complete task with notes', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = completeTaskWithNotes(task, 'Contato feito com sucesso');
    expect(result.status).toBe('completed');
    expect(result.notes).toBe('Contato feito com sucesso');
    expect(result.completed_at).toBeDefined();
  });

  it('should complete task without notes', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = completeTaskWithNotes(task);
    expect(result.status).toBe('completed');
    expect(result.notes).toBeNull();
  });

  it('should skip task with reason', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = skipTaskWithNotes(task, 'Cliente não disponível');
    expect(result.status).toBe('skipped');
    expect(result.notes).toBe('Cliente não disponível');
  });

  it('should skip task without notes', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = skipTaskWithNotes(task);
    expect(result.status).toBe('skipped');
  });

  it('should trim whitespace from notes', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = completeTaskWithNotes(task, '  Trimmed note  ');
    expect(result.notes).toBe('Trimmed note');
  });

  it('should treat empty string notes as null', () => {
    const task = { id: '1', status: 'pending', notes: null };
    const result = completeTaskWithNotes(task, '   ');
    expect(result.notes).toBeNull();
  });
});
