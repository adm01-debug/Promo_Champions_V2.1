import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();
const toast = vi.fn();
let deleteResult: { data: { id: string }[] | null; error: { message: string } | null };
let updateResult: { data: unknown; error: unknown } = {
  data: { id: 'sp-1' },
  error: null,
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      from(table);
      const query = {
        update: (payload: unknown) => {
          update(payload);
          return query;
        },
        delete: () => {
          del();
          return query;
        },
        eq: (col: string, val: unknown) => {
          eq(col, val);
          return query;
        },
        select: () => query,
        maybeSingle: () => Promise.resolve(updateResult),
        then: (resolve: (value: typeof deleteResult) => unknown) =>
          Promise.resolve(deleteResult).then(resolve),
      };
      return query;
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

const { useSupplierMutations } = await import('./useSupplierMutations');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

describe('useSupplierMutations — produtos do fornecedor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    deleteResult = { data: [{ id: 'sp-1' }], error: null };
  });

  it('atualiza preço, qtd. mínima e preferido e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useSupplierMutations(), { wrapper });

    result.current.updateSupplierProduct({
      id: 'sp-1',
      unit_price: 12.5,
      min_order_quantity: 100,
      is_preferred: true,
    });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ title: 'Produto do fornecedor atualizado' })
    );
    expect(from).toHaveBeenCalledWith('supplier_products');
    expect(update).toHaveBeenCalledWith({
      unit_price: 12.5,
      min_order_quantity: 100,
      is_preferred: true,
    });
    expect(eq).toHaveBeenCalledWith('id', 'sp-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['supplier-products'] });
  });

  it('exclui o vínculo e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useSupplierMutations(), { wrapper });

    result.current.deleteSupplierProduct('sp-1');

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ title: 'Produto removido do fornecedor' })
    );
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'sp-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['supplier-products'] });
  });

  it('mostra erro quando a exclusão não afeta nenhuma linha (RLS)', async () => {
    deleteResult = { data: [], error: null };
    const { result } = renderHook(() => useSupplierMutations(), { wrapper });

    result.current.deleteSupplierProduct('sp-1');

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro', variant: 'destructive' })
      )
    );
    expect(toast).not.toHaveBeenCalledWith({ title: 'Produto removido do fornecedor' });
  });
  it('mostra erro de permissão quando a edição não afeta nenhuma linha (RLS)', async () => {
    updateResult = { data: null, error: null };
    const { result } = renderHook(() => useSupplierMutations(), { wrapper });

    result.current.updateSupplierProduct({
      id: 'sp-1',
      unit_price: 10,
      min_order_quantity: null,
      is_preferred: false,
    });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro', variant: 'destructive' })
      )
    );
    expect(toast).not.toHaveBeenCalledWith({ title: 'Produto do fornecedor atualizado' });
    updateResult = { data: { id: 'sp-1' }, error: null };
  });
});
