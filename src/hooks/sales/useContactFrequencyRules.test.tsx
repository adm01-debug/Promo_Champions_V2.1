import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state: {
  stored: unknown;
  selectError: { message: string } | null;
  upsertError: { message: string } | null;
  upserts: Array<{ row: Record<string, unknown>; opts: unknown }>;
  eqs: Array<[string, unknown]>;
} = { stored: null, selectError: null, upsertError: null, upserts: [], eqs: [] };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table !== 'salesperson_preferences')
        throw new Error(`tabela inesperada ${table}`);
      const q = {
        select: () => q,
        eq: (col: string, val: unknown) => {
          state.eqs.push([col, val]);
          return q;
        },
        maybeSingle: () =>
          Promise.resolve({
            data: state.stored === null ? null : { contact_rules: state.stored },
            error: state.selectError,
          }),
        upsert: (row: Record<string, unknown>, opts: unknown) => {
          state.upserts.push({ row, opts });
          return Promise.resolve({ error: state.upsertError });
        },
      };
      return q;
    },
  },
}));

const authState: { salesperson: { id: string } | null } = { salesperson: { id: 'sp-1' } };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));

const {
  useContactFrequencyRules,
  parseContactRules,
  serializeContactRules,
  DEFAULT_CONTACT_FREQUENCY,
} = await import('./useContactFrequencyRules');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

const custom = {
  quiet_hours_start: '21:00',
  quiet_hours_end: '07:30',
  max_calls_per_day: 1,
  max_messages_per_day: 5,
  min_interval_minutes: 120,
  prioritize_human: false,
};

describe('parseContactRules / serializeContactRules', () => {
  it('retorna null quando não há regras salvas', () => {
    expect(parseContactRules(null)).toBeNull();
    expect(parseContactRules([] as never)).toBeNull();
  });

  it('lê o formato gravado por ContactRulesDialog e completa o que falta com o padrão', () => {
    expect(
      parseContactRules({
        quiet_hours: { start: '22:00', end: '06:00' },
        max_calls_per_day: 4,
        prioritize_human: false,
      })
    ).toEqual({
      ...DEFAULT_CONTACT_FREQUENCY,
      quiet_hours_start: '22:00',
      quiet_hours_end: '06:00',
      max_calls_per_day: 4,
      prioritize_human: false,
    });
  });

  it('ignora valores inválidos no jsonb', () => {
    expect(
      parseContactRules({
        quiet_hours: { start: '25:99', end: 7 },
        max_calls_per_day: -1,
        max_messages_per_day: 'x',
      })
    ).toEqual(DEFAULT_CONTACT_FREQUENCY);
  });

  it('mescla sem apagar chaves de outras telas', () => {
    expect(
      serializeContactRules(custom, {
        quiet_hours: { start: '20:00', end: '08:00', tz: 'America/Sao_Paulo' },
        outra_chave: 'mantida',
      })
    ).toEqual({
      outra_chave: 'mantida',
      quiet_hours: { start: '21:00', end: '07:30', tz: 'America/Sao_Paulo' },
      max_calls_per_day: 1,
      max_messages_per_day: 5,
      min_interval_minutes: 120,
      prioritize_human: false,
    });
  });
});

describe('useContactFrequencyRules', () => {
  beforeEach(() => {
    state.stored = null;
    state.selectError = null;
    state.upsertError = null;
    state.upserts = [];
    state.eqs = [];
    authState.salesperson = { id: 'sp-1' };
  });

  it('carrega as regras salvas do vendedor logado', async () => {
    state.stored = {
      quiet_hours: { start: '21:00', end: '07:30' },
      max_calls_per_day: 1,
    };
    const { result } = renderHook(() => useContactFrequencyRules(), { wrapper });
    await waitFor(() => expect(result.current.savedRules).not.toBeNull());
    expect(result.current.savedRules?.quiet_hours_start).toBe('21:00');
    expect(state.eqs).toContainEqual(['salesperson_id', 'sp-1']);
  });

  it('expõe savedRules null quando nada foi salvo', async () => {
    const { result } = renderHook(() => useContactFrequencyRules(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.savedRules).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it('salva via upsert em salesperson_preferences preservando chaves existentes', async () => {
    state.stored = { outra_chave: 1 };
    const { result } = renderHook(() => useContactFrequencyRules(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveRules(custom);
    });

    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0]?.opts).toEqual({ onConflict: 'salesperson_id' });
    expect(state.upserts[0]?.row).toEqual({
      salesperson_id: 'sp-1',
      contact_rules: serializeContactRules(custom, { outra_chave: 1 }),
    });
    await waitFor(() => expect(result.current.savedRules).toEqual(custom));
  });

  it('propaga erro do banco ao salvar', async () => {
    state.upsertError = { message: 'violates row-level security' };
    const { result } = renderHook(() => useContactFrequencyRules(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.saveRules(custom)).rejects.toMatchObject({
      message: 'violates row-level security',
    });
  });

  it('não consulta nem salva sem perfil de vendedor', async () => {
    authState.salesperson = null;
    const { result } = renderHook(() => useContactFrequencyRules(), { wrapper });
    expect(result.current.hasSalesperson).toBe(false);
    await expect(result.current.saveRules(custom)).rejects.toThrow(
      'Perfil de vendedor não encontrado'
    );
    expect(state.eqs).toHaveLength(0);
    expect(state.upserts).toHaveLength(0);
  });
});
