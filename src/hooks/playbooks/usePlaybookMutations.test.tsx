import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
const rpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ insert }),
    rpc,
  },
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const { useTogglePlaybookItem } = await import('./usePlaybookMutations');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useTogglePlaybookItem — marcar item do checklist', () => {
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    rpc.mockReset();
  });

  it('envia completed_by com o salespeople.id do vendedor logado (exigido pela RLS)', async () => {
    rpc.mockResolvedValue({ data: 'salesperson-1', error: null });
    const { result } = renderHook(() => useTogglePlaybookItem(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        itemId: 'item-1',
        saleId: 'sale-1',
        isCompleted: false,
      });
    });

    expect(rpc).toHaveBeenCalledWith('get_current_salesperson_id');
    expect(insert).toHaveBeenCalledWith({
      playbook_item_id: 'item-1',
      sale_id: 'sale-1',
      completed_by: 'salesperson-1',
    });
  });

  it('admin/gestor sem registro de vendedor grava completed_by NULL', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useTogglePlaybookItem(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        itemId: 'item-1',
        saleId: 'sale-1',
        isCompleted: false,
      });
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ completed_by: null }));
  });

  it('não insere se a consulta do vendedor falhar', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('rpc falhou') });
    const { result } = renderHook(() => useTogglePlaybookItem(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          itemId: 'item-1',
          saleId: 'sale-1',
          isCompleted: false,
        })
      ).rejects.toThrow('rpc falhou');
    });

    expect(insert).not.toHaveBeenCalled();
  });
});
