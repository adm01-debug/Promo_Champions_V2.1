import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signOutSpy } = vi.hoisted(() => ({ signOutSpy: vi.fn() }));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const query: Record<string, unknown> = {};
    for (const method of [
      'select',
      'eq',
      'neq',
      'gt',
      'order',
      'insert',
      'update',
      'delete',
      'single',
      'maybeSingle',
    ]) {
      query[method] = () => query;
    }
    query.then = (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve);
    return query;
  };

  return {
    supabase: {
      from: () => builder(),
      rpc: () =>
        Promise.resolve({ data: [{ valid: true, needs_refresh: false }], error: null }),
      auth: { signOut: signOutSpy },
    },
  };
});

const { useSessionManagement } = await import('./useSessionManagement');

describe('useSessionManagement — revogação de sessões GoTrue', () => {
  beforeEach(() => {
    signOutSpy.mockReset().mockResolvedValue({ error: null });
    localStorage.setItem('session_id', 'current-session-id');
  });

  it('encerrar outras sessões revoga os refresh tokens delas (scope others)', async () => {
    const { result } = renderHook(() => useSessionManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const ok = await result.current.terminateOtherSessions();

    expect(ok).toBe(true);
    expect(signOutSpy).toHaveBeenCalledWith({ scope: 'others' });
  });

  it('encerrar a sessão atual faz logout apenas dela (scope local)', async () => {
    const { result } = renderHook(() => useSessionManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const ok = await result.current.terminateSession('current-session-id');

    expect(ok).toBe(true);
    expect(signOutSpy).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('encerrar uma sessão remota não derruba a sessão atual', async () => {
    const { result } = renderHook(() => useSessionManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const ok = await result.current.terminateSession('other-session-id');

    expect(ok).toBe(true);
    expect(signOutSpy).not.toHaveBeenCalled();
  });

  it('encerrar todas as sessões revoga inclusive a atual (scope global)', async () => {
    const { result } = renderHook(() => useSessionManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const ok = await result.current.terminateAllSessions();

    expect(ok).toBe(true);
    expect(signOutSpy).toHaveBeenCalledWith({ scope: 'global' });
    expect(localStorage.getItem('session_id')).toBeNull();
  });
});
