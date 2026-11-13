import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
let mutationResult: {
  data: { id: string }[] | null;
  error: { message: string; code?: string } | null;
} = { data: [{ id: 'material-1' }], error: null };

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock('@/hooks/useNotifications', () => ({
  useSendNotification: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const query = {
      select: () => query,
      order: () => query,
      update: (...args: unknown[]) => {
        update(...args);
        return {
          eq: (...more: unknown[]) => {
            eq(...more);
            return { select: () => Promise.resolve(mutationResult) };
          },
        };
      },
      eq: (...args: unknown[]) => {
        eq(...args);
        return query;
      },
      then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
        resolve({ data: [], error: null }),
    };
    return query;
  };

  return {
    supabase: {
      from: (table: string) => {
        from(table);
        return builder();
      },
    },
  };
});

const { useEnablementAssets, useUpdateAsset, useArchiveAsset, useRestoreAsset } =
  await import('./useSalesEnablement');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

const changes = {
  id: 'material-1',
  title: 'Apresentação institucional',
  description: '',
  category: 'proposal',
  asset_type: 'presentation',
  file_url: '',
  funnel_stage: '',
};

describe('useSalesEnablement — editar, arquivar e reativar materiais', () => {
  beforeEach(() => {
    from.mockClear();
    update.mockClear();
    eq.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();
    mutationResult = { data: [{ id: 'material-1' }], error: null };
    client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  it('lista só materiais ativos por padrão e só arquivados quando pedido', async () => {
    const ativos = renderHook(() => useEnablementAssets('all'), { wrapper });
    await waitFor(() => expect(ativos.result.current.isSuccess).toBe(true));
    expect(from).toHaveBeenCalledWith('sales_enablement_assets');
    expect(eq).toHaveBeenCalledWith('is_active', true);

    eq.mockClear();
    const arquivados = renderHook(() => useEnablementAssets('all', true), { wrapper });
    await waitFor(() => expect(arquivados.result.current.isSuccess).toBe(true));
    expect(eq).toHaveBeenCalledWith('is_active', false);
    expect(eq).not.toHaveBeenCalledWith('is_active', true);
  });

  it('edita pelo id e grava campos vazios como null', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateAsset(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(changes);
    });

    expect(from).toHaveBeenCalledWith('sales_enablement_assets');
    expect(update).toHaveBeenCalledWith({
      title: 'Apresentação institucional',
      description: null,
      category: 'proposal',
      asset_type: 'presentation',
      file_url: null,
      funnel_stage: null,
    });
    expect(eq).toHaveBeenCalledWith('id', 'material-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['enablement-assets'] });
    expect(toastSuccess).toHaveBeenCalledWith('Material atualizado');
  });

  it('falha ao editar quando a RLS bloqueia (0 linhas)', async () => {
    mutationResult = { data: [], error: null };
    const { result } = renderHook(() => useUpdateAsset(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(changes)).rejects.toThrow(
        'Sem permissão para editar este material'
      );
    });
    expect(toastError).toHaveBeenCalledWith('Sem permissão para editar este material');
  });

  it('arquiva marcando is_active=false, sem apagar, e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useArchiveAsset(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('material-1');
    });

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith('id', 'material-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['enablement-assets'] });
    expect(toastSuccess).toHaveBeenCalledWith('Material arquivado');
  });

  it('falha ao arquivar quando a RLS bloqueia (0 linhas)', async () => {
    mutationResult = { data: [], error: null };
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useArchiveAsset(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('material-1')).rejects.toThrow(
        'Sem permissão para arquivar este material'
      );
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propaga erro do banco ao arquivar', async () => {
    mutationResult = { data: null, error: { message: 'falha de rede', code: '08006' } };
    const { result } = renderHook(() => useArchiveAsset(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('material-1')).rejects.toMatchObject({
        message: 'falha de rede',
      });
    });
  });

  it('reativa marcando is_active=true e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useRestoreAsset(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('material-1');
    });

    expect(update).toHaveBeenCalledWith({ is_active: true });
    expect(eq).toHaveBeenCalledWith('id', 'material-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['enablement-assets'] });
    expect(toastSuccess).toHaveBeenCalledWith('Material reativado');
  });

  it('falha ao reativar quando a RLS bloqueia (0 linhas)', async () => {
    mutationResult = { data: [], error: null };
    const { result } = renderHook(() => useRestoreAsset(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('material-1')).rejects.toThrow(
        'Sem permissão para reativar este material'
      );
    });
  });
});
