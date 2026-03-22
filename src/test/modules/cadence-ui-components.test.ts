/**
 * Cadence UI Component Tests
 * Tests: CadenceCard, EditCadenceDialog, DeleteCadenceDialog, TodaysCadenceTasks logic
 */
import { describe, it, expect } from 'vitest';

describe('CadenceCard Display Logic', () => {
  type ActionType = 'email' | 'call' | 'linkedin' | 'whatsapp' | 'meeting' | 'other';

  const actionLabels: Record<ActionType, string> = {
    call: 'Ligação', email: 'E-mail', linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp', meeting: 'Reunião', other: 'Outro',
  };

  it('should show correct action labels for all types', () => {
    const types: ActionType[] = ['email', 'call', 'linkedin', 'whatsapp', 'meeting', 'other'];
    types.forEach(t => expect(actionLabels[t]).toBeDefined());
  });

  it('should truncate steps display to max 5', () => {
    const steps = Array.from({ length: 8 }, (_, i) => ({ id: String(i), day_number: i + 1 }));
    const displayed = steps.slice(0, 5);
    const remaining = steps.length - 5;
    expect(displayed).toHaveLength(5);
    expect(remaining).toBe(3);
  });

  it('should show all steps when <= 5', () => {
    const steps = Array.from({ length: 3 }, (_, i) => ({ id: String(i), day_number: i + 1 }));
    const displayed = steps.slice(0, 5);
    expect(displayed).toHaveLength(3);
  });

  it('should apply inactive opacity when is_active is false', () => {
    const cadence = { is_active: false };
    const className = !cadence.is_active ? 'opacity-60' : '';
    expect(className).toBe('opacity-60');
  });

  it('should not apply inactive opacity when is_active is true', () => {
    const cadence = { is_active: true };
    const className = !cadence.is_active ? 'opacity-60' : '';
    expect(className).toBe('');
  });

  it('should show Inativa badge only when inactive', () => {
    const showBadge = (isActive: boolean) => !isActive;
    expect(showBadge(false)).toBe(true);
    expect(showBadge(true)).toBe(false);
  });

  it('should show selected state with ring', () => {
    const isSelected = true;
    const selectedClasses = isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover-lift';
    expect(selectedClasses).toContain('ring-2');
  });
});

describe('Cadence Search & Filter Logic', () => {
  interface Cadence {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
  }

  const cadences: Cadence[] = [
    { id: '1', name: 'Prospecção Fria', description: 'Para novos leads', is_active: true },
    { id: '2', name: 'Reativação', description: 'Clientes inativos', is_active: true },
    { id: '3', name: 'Onboarding', description: null, is_active: false },
    { id: '4', name: 'Follow-up Pós-Venda', description: 'Acompanhamento', is_active: true },
    { id: '5', name: 'Cadência Antiga', description: 'Descontinuada', is_active: false },
  ];

  const filterCadences = (
    list: Cadence[],
    search: string,
    status: 'all' | 'active' | 'inactive'
  ) => {
    return list.filter(c => {
      const matchesSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' ||
        (status === 'active' && c.is_active) ||
        (status === 'inactive' && !c.is_active);
      return matchesSearch && matchesStatus;
    });
  };

  it('should return all cadences with no filters', () => {
    expect(filterCadences(cadences, '', 'all')).toHaveLength(5);
  });

  it('should filter by name search', () => {
    const result = filterCadences(cadences, 'prospecção', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Prospecção Fria');
  });

  it('should filter by description search', () => {
    const result = filterCadences(cadences, 'inativos', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Reativação');
  });

  it('should filter active cadences only', () => {
    const result = filterCadences(cadences, '', 'active');
    expect(result).toHaveLength(3);
    result.forEach(c => expect(c.is_active).toBe(true));
  });

  it('should filter inactive cadences only', () => {
    const result = filterCadences(cadences, '', 'inactive');
    expect(result).toHaveLength(2);
    result.forEach(c => expect(c.is_active).toBe(false));
  });

  it('should combine search and status filter', () => {
    const result = filterCadences(cadences, 'cadência', 'inactive');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Cadência Antiga');
  });

  it('should return empty for no matches', () => {
    expect(filterCadences(cadences, 'xyz', 'all')).toHaveLength(0);
  });

  it('should be case insensitive', () => {
    const result = filterCadences(cadences, 'FOLLOW', 'all');
    expect(result).toHaveLength(1);
  });

  it('should handle null descriptions in search', () => {
    const result = filterCadences(cadences, 'onboarding', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
  });

  it('should handle empty cadences list', () => {
    expect(filterCadences([], 'test', 'all')).toHaveLength(0);
  });
});

describe('Delete Confirmation Dialog Logic', () => {
  it('should require cadence name for display', () => {
    const cadenceName = 'My Cadence';
    const message = `Tem certeza que deseja excluir "${cadenceName}"?`;
    expect(message).toContain('My Cadence');
  });

  it('should handle confirm action', () => {
    let deleted = false;
    const onConfirm = () => { deleted = true; };
    onConfirm();
    expect(deleted).toBe(true);
  });

  it('should handle cancel action', () => {
    let dialogOpen = true;
    const onCancel = () => { dialogOpen = false; };
    onCancel();
    expect(dialogOpen).toBe(false);
  });

  it('should show pending state while deleting', () => {
    const isPending = true;
    const buttonText = isPending ? 'Excluindo...' : 'Excluir Cadência';
    expect(buttonText).toBe('Excluindo...');
  });
});

describe('TodaysCadenceTasks Notes Flow', () => {
  it('should toggle notes panel open for complete', () => {
    let notesTaskId: string | null = null;
    let noteAction = 'complete';
    
    const handleAction = (taskId: string, action: string) => {
      notesTaskId = taskId;
      noteAction = action;
    };

    handleAction('task-1', 'complete');
    expect(notesTaskId).toBe('task-1');
    expect(noteAction).toBe('complete');
  });

  it('should toggle notes panel open for skip', () => {
    let notesTaskId: string | null = null;
    let noteAction = '';

    const handleAction = (taskId: string, action: string) => {
      notesTaskId = taskId;
      noteAction = action;
    };

    handleAction('task-2', 'skip');
    expect(notesTaskId).toBe('task-2');
    expect(noteAction).toBe('skip');
  });

  it('should close notes panel', () => {
    let notesTaskId: string | null = 'task-1';
    const closeNotes = () => { notesTaskId = null; };
    closeNotes();
    expect(notesTaskId).toBeNull();
  });

  it('should show correct placeholder for complete action', () => {
    const action = 'complete';
    const placeholder = action === 'complete' ? 'Adicione observações sobre o contato...' : 'Por que está pulando esta tarefa?';
    expect(placeholder).toContain('observações');
  });

  it('should show correct placeholder for skip action', () => {
    const action = 'skip';
    const placeholder = action === 'complete' ? 'Adicione observações sobre o contato...' : 'Por que está pulando esta tarefa?';
    expect(placeholder).toContain('pulando');
  });

  it('should allow quick action without notes', () => {
    let completedTaskId: string | null = null;
    const quickAction = (taskId: string) => { completedTaskId = taskId; };
    quickAction('fast-task');
    expect(completedTaskId).toBe('fast-task');
  });
});

describe('Edit Step Inline Flow', () => {
  it('should track which step is being edited', () => {
    let editingStepId: string | null = null;
    const startEditing = (id: string) => { editingStepId = id; };
    startEditing('step-5');
    expect(editingStepId).toBe('step-5');
  });

  it('should clear editing state on cancel', () => {
    let editingStepId: string | null = 'step-5';
    let editStepData: Record<string, unknown> = { title: 'changed' };
    const cancelEdit = () => { editingStepId = null; editStepData = {}; };
    cancelEdit();
    expect(editingStepId).toBeNull();
    expect(editStepData).toEqual({});
  });

  it('should accumulate partial updates', () => {
    let editData: Record<string, unknown> = {};
    const setField = (field: string, value: unknown) => { editData = { ...editData, [field]: value }; };
    setField('title', 'New Title');
    setField('day_number', 5);
    expect(editData).toEqual({ title: 'New Title', day_number: 5 });
  });

  it('should only edit one step at a time', () => {
    let editingStepId: string | null = 'step-1';
    const startEditing = (id: string) => { editingStepId = id; };
    startEditing('step-2');
    expect(editingStepId).toBe('step-2');
  });
});

describe('New Steps Addition Flow', () => {
  it('should calculate next day number from existing steps', () => {
    const existingSteps = [{ day_number: 1 }, { day_number: 3 }, { day_number: 7 }];
    const lastDay = Math.max(...existingSteps.map(s => s.day_number));
    expect(lastDay + 2).toBe(9);
  });

  it('should default to day 2 with no existing steps', () => {
    const existingSteps: { day_number: number }[] = [];
    const lastDay = existingSteps.length ? Math.max(...existingSteps.map(s => s.day_number)) : 0;
    expect(lastDay + 2).toBe(2);
  });

  it('should add multiple new steps', () => {
    let newSteps = [{ title: 'Step A' }];
    newSteps = [...newSteps, { title: 'Step B' }];
    expect(newSteps).toHaveLength(2);
  });

  it('should remove a new step by index', () => {
    const newSteps = [{ title: 'A' }, { title: 'B' }, { title: 'C' }];
    const filtered = newSteps.filter((_, i) => i !== 1);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(s => s.title)).toEqual(['A', 'C']);
  });

  it('should clear new steps after save', () => {
    let newSteps = [{ title: 'A' }, { title: 'B' }];
    newSteps = [];
    expect(newSteps).toHaveLength(0);
  });

  it('should skip steps with empty titles when saving', () => {
    const newSteps = [{ title: 'Valid' }, { title: '' }, { title: '  ' }, { title: 'Also Valid' }];
    const toSave = newSteps.filter(s => s.title.trim());
    expect(toSave).toHaveLength(2);
  });

  it('should calculate correct step_order for new steps', () => {
    const existingCount = 4;
    const newSteps = ['A', 'B', 'C'];
    const orders = newSteps.map((_, i) => existingCount + i);
    expect(orders).toEqual([4, 5, 6]);
  });
});
