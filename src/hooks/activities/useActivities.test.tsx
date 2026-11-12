import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const select = vi.fn();
  const is = vi.fn(() => ({ select }));
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  const getUser = vi.fn();
  const index = vi.fn();
  return { select, is, eq, update, from, getUser, index };
});

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
    auth: { getUser: mocks.getUser },
  },
}));

vi.mock('@/hooks/semantic/useIndexEntity', () => ({
  useIndexEntity: () => ({ index: mocks.index }),
}));

vi.mock('sonner', () => ({ toast }));

const { useUpdateActivity, useDeleteActivity } = await import('./useActivities');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, invalidateSpy };
}

const updateInput = {
  id: 'act-1',
  activity_type: 'email' as const,
  outcome: 'scheduled' as const,
  contact_name: 'Maria',
  notes: null,
  duration_minutes: 15,
};

describe('useUpdateActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('atualiza só atividades não excluídas e invalida lista, stats e ranking', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'act-1' }], error: null });
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useUpdateActivity(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(updateInput);
    });

    expect(mocks.from).toHaveBeenCalledWith('activities');
    expect(mocks.update).toHaveBeenCalledWith({
      activity_type: 'email',
      outcome: 'scheduled',
      contact_name: 'Maria',
      notes: null,
      duration_minutes: 15,
    });
    expect(mocks.eq).toHaveBeenCalledWith('id', 'act-1');
    expect(mocks.is).toHaveBeenCalledWith('deleted_at', null);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activity-stats'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['sdr-leaderboard'] });
    expect(mocks.index).toHaveBeenCalledWith('activity', 'act-1');
    expect(toast.success).toHaveBeenCalledWith('Atividade atualizada!');
  });

  it('mostra erro quando a RLS bloqueia a alteração (0 linhas afetadas)', async () => {
    mocks.select.mockResolvedValue({ data: [], error: null });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateActivity(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(updateInput)).rejects.toThrow(
        'sem permissão'
      );
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao atualizar atividade')
    );
  });
});

describe('useDeleteActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('faz soft-delete preenchendo deleted_at e deleted_by', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'act-1' }], error: null });
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useDeleteActivity(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('act-1');
    });

    expect(mocks.update).toHaveBeenCalledWith({
      deleted_at: expect.any(String),
      deleted_by: 'user-1',
    });
    expect(mocks.eq).toHaveBeenCalledWith('id', 'act-1');
    expect(mocks.is).toHaveBeenCalledWith('deleted_at', null);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activity-stats'] });
    expect(toast.success).toHaveBeenCalledWith('Atividade excluída');
  });

  it('mostra toast de erro quando o banco recusa', async () => {
    mocks.select.mockResolvedValue({ data: null, error: new Error('falhou') });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteActivity(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('act-1')).rejects.toThrow('falhou');
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao excluir atividade: falhou');
  });
});
