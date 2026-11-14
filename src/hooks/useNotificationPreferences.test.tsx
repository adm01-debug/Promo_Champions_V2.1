import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const inserts: Array<Record<string, unknown>> = [];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table !== 'notification_preferences')
        throw new Error(`tabela inesperada ${table}`);
      const q = {
        insert: (row: Record<string, unknown>) => {
          inserts.push(row);
          return q;
        },
        select: () => q,
        single: () => Promise.resolve({ data: { id: 'np-1' }, error: null }),
      };
      return q;
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const authState: { user: { id: string } | null } = { user: { id: 'user-1' } };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));

const { useCreateNotificationPreference } = await import('./useNotificationPreferences');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

const pref = {
  email: 'vendedor@x.com',
  frequency: 'daily',
  is_active: true,
  notify_stagnant_deals: true,
  notify_inactive_clients: true,
  notify_at_risk_goals: true,
  stagnant_threshold_days: 14,
  inactive_threshold_days: 60,
  consecutive_days_threshold: 3,
  preferred_time: '08:00',
};

describe('useCreateNotificationPreference', () => {
  beforeEach(() => {
    inserts.length = 0;
    authState.user = { id: 'user-1' };
  });

  it('envia user_id do usuário logado (RLS exige user_id = auth.uid())', async () => {
    const { result } = renderHook(() => useCreateNotificationPreference(), { wrapper });
    await act(() => result.current.mutateAsync(pref));
    expect(inserts).toEqual([{ ...pref, user_id: 'user-1' }]);
  });

  it('não chama o banco sem usuário autenticado', async () => {
    authState.user = null;
    const { result } = renderHook(() => useCreateNotificationPreference(), { wrapper });
    await expect(act(() => result.current.mutateAsync(pref))).rejects.toThrow(
      'Usuário não autenticado'
    );
    expect(inserts).toEqual([]);
  });
});
