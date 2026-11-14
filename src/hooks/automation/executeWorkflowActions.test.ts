/**
 * Contrato front/edge das linhas gravadas pela edge execute-workflow
 * (supabase/functions/execute-workflow/actions.ts) contra o schema gerado.
 */
import { describe, expect, it } from 'vitest';
import { Constants } from '@/integrations/supabase/types';
import {
  WORKFLOW_ACTIVITY_OUTCOME,
  buildActivityRow,
  buildTaskRow,
} from '../../../supabase/functions/execute-workflow/actions';

const SALESPERSON_ID = '11111111-1111-1111-1111-111111111111';
const NOW = Date.parse('2026-11-13T12:00:00.000Z');

describe('execute-workflow — log_activity', () => {
  it('usa um outcome que existe no enum activity_outcome', () => {
    // "completed" (valor antigo) não existe no enum: o insert falhava sempre.
    expect(Constants.public.Enums.activity_outcome).not.toContain('completed');
    const row = buildActivityRow({}, SALESPERSON_ID, 'sale-1');
    expect(Constants.public.Enums.activity_outcome).toContain(row.outcome);
    expect(row.outcome).toBe(WORKFLOW_ACTIVITY_OUTCOME);
  });

  it('grava o salespeople.id recebido e um activity_type válido', () => {
    const row = buildActivityRow({ notes: 'x' }, SALESPERSON_ID, undefined);
    expect(row).toEqual({
      salesperson_id: SALESPERSON_ID,
      sale_id: null,
      activity_type: 'note',
      outcome: 'connected',
      notes: 'x',
    });
    expect(Constants.public.Enums.activity_type).toContain(row.activity_type);
  });
});

describe('execute-workflow — create_task', () => {
  it('grava o salespeople.id recebido e agenda pelo delay', () => {
    const row = buildTaskRow(
      { title: 'Ligar', delay_hours: 2 },
      SALESPERSON_ID,
      'sale-1',
      NOW
    );
    expect(row).toEqual({
      salesperson_id: SALESPERSON_ID,
      sale_id: 'sale-1',
      title: 'Ligar',
      description: '',
      event_type: 'task',
      scheduled_at: '2026-11-13T14:00:00.000Z',
    });
  });
});
