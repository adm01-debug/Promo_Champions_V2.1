import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = { contact_rules: unknown } | null;

const state: {
  stored: Row;
  readError: { message: string } | null;
  upsertError: { message: string } | null;
  upserts: Array<{ row: Record<string, unknown>; opts: unknown }>;
  updates: number;
} = { stored: null, readError: null, upsertError: null, upserts: [], updates: 0 };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'auth-1' } } }),
    },
    from: (table: string) => {
      if (table === 'salespeople') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { id: 'sp-1' }, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: state.stored, error: state.readError }),
          }),
        }),
        update: () => {
          state.updates += 1;
          return { eq: () => Promise.resolve({ error: null }) };
        },
        upsert: (row: Record<string, unknown>, opts: unknown) => {
          state.upserts.push({ row, opts });
          return Promise.resolve({ error: state.upsertError });
        },
      };
    },
  },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

import { ContactRulesDialog } from './ContactRulesDialog';

function renderDialog() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  render(
    <QueryClientProvider client={queryClient}>
      <ContactRulesDialog />
    </QueryClientProvider>
  );
  return { invalidate };
}

async function openAndSave() {
  fireEvent.click(screen.getByRole('button', { name: /regras de contato/i }));
  const save = await screen.findByRole('button', { name: /salvar regras/i });
  fireEvent.click(save);
}

describe('ContactRulesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(state, {
      stored: null,
      readError: null,
      upsertError: null,
      upserts: [],
      updates: 0,
    });
  });

  it('cria a linha via upsert quando o vendedor ainda não tem preferências', async () => {
    const { invalidate } = renderDialog();
    await openAndSave();

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Regras de contato salvas!')
    );
    expect(state.updates).toBe(0);
    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0]?.opts).toEqual({ onConflict: 'salesperson_id' });
    expect(state.upserts[0]?.row).toEqual({
      salesperson_id: 'sp-1',
      contact_rules: {
        quiet_hours: { start: '20:00', end: '08:00' },
        max_calls_per_day: 3,
        prioritize_human: true,
      },
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['contact-frequency-rules'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['salesperson-preferences'] });
  });

  it('preserva chaves gravadas por outra tela ao salvar', async () => {
    state.stored = {
      contact_rules: {
        quiet_hours: { start: '21:00', end: '07:00' },
        max_calls_per_day: 1,
        prioritize_human: false,
        max_messages_per_day: 5,
        min_interval_minutes: 120,
      },
    };
    renderDialog();
    await openAndSave();

    await waitFor(() => expect(state.upserts).toHaveLength(1));
    expect(state.upserts[0]?.row.contact_rules).toEqual({
      quiet_hours: { start: '21:00', end: '07:00' },
      max_calls_per_day: 1,
      prioritize_human: false,
      max_messages_per_day: 5,
      min_interval_minutes: 120,
    });
  });

  it('mostra erro e não confirma quando o banco recusa a gravação', async () => {
    state.upsertError = { message: 'violates row-level security' };
    const { invalidate } = renderDialog();
    await openAndSave();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Erro: violates row-level security')
    );
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('avisa quando não consegue carregar as regras salvas', async () => {
    state.readError = { message: 'timeout' };
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /regras de contato/i }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Erro ao carregar regras de contato: timeout'
      )
    );
  });
});
