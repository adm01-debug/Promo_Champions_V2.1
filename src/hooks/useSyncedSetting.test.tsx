import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type ServerRow = { value: unknown; updated_at: string } | null;

const state = vi.hoisted(() => ({
  serverRow: null as ServerRow,
  upserts: [] as Array<{
    user_id: string;
    key: string;
    value: unknown;
    updated_at: string;
  }>,
  deletes: 0,
  user: { id: 'user-1' } as { id: string } | null,
}));

const buildFrom = () => ({
  select: () => ({
    eq: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: state.serverRow, error: null }),
      }),
    }),
  }),
  upsert: async (
    rows: Array<{ user_id: string; key: string; value: unknown; updated_at: string }>
  ) => {
    state.upserts.push(rows[0]!);
    return { error: null };
  },
  delete: () => ({
    eq: () => ({
      eq: async () => {
        state.deletes += 1;
        return { error: null };
      },
    }),
  }),
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => buildFrom(),
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

const { useSyncedSetting } = await import('./useSyncedSetting');

const OPTS = {
  key: 'test-settings',
  storageKey: 'test-settings-storage',
  schemaVersion: 1,
  defaults: { threshold: 5 },
  sanitize: (raw: unknown) => ({
    threshold: Number((raw as { threshold?: number } | null)?.threshold ?? 5),
  }),
  debounceMs: 0,
};

const OLD_TS = '2026-01-01T00:00:00.000Z';

function seedLocal(threshold: number, updatedAt: string | null) {
  window.localStorage.setItem(
    OPTS.storageKey,
    JSON.stringify({ version: 1, settings: { threshold }, updatedAt })
  );
}

function flush(ms = 5) {
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
}

function focusTab() {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useSyncedSetting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    state.serverRow = null;
    state.upserts.length = 0;
    state.deletes = 0;
    state.user = { id: 'user-1' };
  });

  it('A-88: reenvio para o servidor usa o valor corrente, nao o da primeira renderizacao', async () => {
    seedLocal(5, OLD_TS);
    state.serverRow = { value: { threshold: 5 }, updated_at: OLD_TS };

    const { result } = renderHook(() => useSyncedSetting<{ threshold: number }>(OPTS));
    await flush();

    act(() => {
      result.current.update({ threshold: 9 });
    });
    await flush();

    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0]!.value).toEqual({ threshold: 9 });

    // O servidor ficou para tras (o upsert anterior nao persistiu la): o
    // reconcile do foco volta a mandar o valor local, que agora e 9.
    state.serverRow = { value: { threshold: 5 }, updated_at: OLD_TS };
    await act(async () => {
      focusTab();
      await new Promise(resolve => setTimeout(resolve, 5));
    });
    await flush();

    expect(state.upserts).toHaveLength(2);
    expect(state.upserts[1]!.value).toEqual({ threshold: 9 });
  });

  it('carimbos iguais entre local e servidor nao disparam upsert', async () => {
    seedLocal(5, OLD_TS);
    state.serverRow = { value: { threshold: 5 }, updated_at: OLD_TS };

    const { result } = renderHook(() => useSyncedSetting<{ threshold: number }>(OPTS));
    await flush();

    expect(state.upserts).toHaveLength(0);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('valor do servidor mais novo vence e atualiza o cache local', async () => {
    seedLocal(5, OLD_TS);
    state.serverRow = {
      value: { threshold: 42 },
      updated_at: '2026-06-01T00:00:00.000Z',
    };

    const { result } = renderHook(() => useSyncedSetting<{ threshold: number }>(OPTS));
    await flush();

    expect(result.current.value).toEqual({ threshold: 42 });
    const stored = JSON.parse(window.localStorage.getItem(OPTS.storageKey) ?? '{}');
    expect(stored.settings).toEqual({ threshold: 42 });
    expect(stored.updatedAt).toBe('2026-06-01T00:00:00.000Z');
    expect(state.upserts).toHaveLength(0);
  });

  it('sem usuario autenticado fica offline e nao escreve no servidor', async () => {
    state.user = null;

    const { result } = renderHook(() => useSyncedSetting<{ threshold: number }>(OPTS));
    await flush();

    expect(result.current.syncStatus).toBe('offline');
    act(() => {
      result.current.update({ threshold: 7 });
    });
    await flush();
    expect(state.upserts).toHaveLength(0);
  });

  it('reset limpa o cache local e apaga a preferencia no servidor', async () => {
    seedLocal(9, OLD_TS);
    state.serverRow = { value: { threshold: 9 }, updated_at: OLD_TS };

    const { result } = renderHook(() => useSyncedSetting<{ threshold: number }>(OPTS));
    await flush();

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.value).toEqual({ threshold: 5 });
    expect(window.localStorage.getItem(OPTS.storageKey)).toBeNull();
    expect(state.deletes).toBe(1);
  });
});
