import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state: {
  upsertError: { message: string } | null;
  upserts: Array<{ row: Record<string, unknown>; opts: unknown }>;
  updates: number;
  inserts: number;
} = { upsertError: null, upserts: [], updates: 0, inserts: 0 };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => {
        state.updates += 1;
        return { eq: () => Promise.resolve({ error: null }) };
      },
      insert: () => {
        state.inserts += 1;
        return Promise.resolve({ error: null });
      },
      upsert: (row: Record<string, unknown>, opts: unknown) => {
        state.upserts.push({ row, opts });
        return Promise.resolve({ error: state.upsertError });
      },
    }),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: { id: 'sp-1' } }),
}));

vi.mock('@/hooks/useElevenLabsVoice', () => ({ VOICE_OPTIONS: [] }));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

import { useSalespersonPreferences } from './useSalespersonPreferences';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useSalespersonPreferences(), { wrapper });
  return { ...hook, invalidate };
}

describe('useSalespersonPreferences.updatePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(state, { upsertError: null, upserts: [], updates: 0, inserts: 0 });
  });

  it('grava via upsert por salesperson_id, sem update/insert separados', async () => {
    const { result, invalidate } = setup();
    act(() => result.current.updatePreferences({ ai_assistant_name: 'Ana' }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Preferências atualizadas!')
    );
    expect(state.upserts).toEqual([
      {
        row: { salesperson_id: 'sp-1', ai_assistant_name: 'Ana' },
        opts: { onConflict: 'salesperson_id' },
      },
    ]);
    expect(state.updates).toBe(0);
    expect(state.inserts).toBe(0);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['salesperson-preferences'] });
  });

  it('mostra erro e não confirma quando o banco recusa', async () => {
    state.upsertError = { message: 'violates row-level security' };
    const { result } = setup();
    act(() => result.current.updatePreferences({ response_mode: 'audio' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Erro ao atualizar preferências')
    );
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
