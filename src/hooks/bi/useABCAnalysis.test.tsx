import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let salesRows: Array<{
  amount: number | null;
  product_name: string | null;
  client_name: string | null;
  client_id?: string | null;
  status: string;
}> = [];

let clientRows: Array<{ id: string; name: string }> = [];

// O mock despacha por tabela: antes devolvia as vendas para qualquer `from()`,
// então a consulta a `clients` recebia vendas e o agrupamento por client_id
// nunca era exercitado.
vi.mock('@/integrations/supabase/client', () => {
  const makeQuery = (rows: () => unknown[]) => {
    const query = {
      select: () => query,
      in: () => query,
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: rows(), error: null }).then(resolve),
    };
    return query;
  };
  return {
    supabase: {
      from: (table: string) =>
        table === 'clients' ? makeQuery(() => clientRows) : makeQuery(() => salesRows),
    },
  };
});

const { useABCAnalysis, CONCENTRATION_WARNING_THRESHOLD_PCT } =
  await import('./useABCAnalysis');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useABCAnalysis', () => {
  beforeEach(() => {
    salesRows = [];
    clientRows = [];
  });

  it('calcula a concentração dos maiores clientes a partir das vendas reais', async () => {
    salesRows = [
      { amount: 500, product_name: 'Caneca', client_name: 'Cliente 1', status: 'won' },
      { amount: 300, product_name: 'Caneta', client_name: 'Cliente 2', status: 'won' },
      { amount: 100, product_name: 'Caneta', client_name: 'Cliente 3', status: 'won' },
      { amount: 100, product_name: 'Boné', client_name: 'Cliente 4', status: 'won' },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalRevenue).toBe(1000);
    expect(result.current.data?.neuralInsights).toEqual([
      {
        title: 'Concentração de Receita',
        description: 'Seus 3 principais clientes geram 90.0% da receita.',
        type: 'warning',
      },
    ]);
  });

  it('não devolve insights, movimentações nem automações fictícias', async () => {
    salesRows = [
      { amount: 200, product_name: 'Caneca', client_name: 'Cliente 1', status: 'won' },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = Object.keys(result.current.data ?? {});
    expect(keys).not.toContain('matrixShifts');
    expect(keys).not.toContain('automations');
    expect(result.current.data?.neuralInsights.map(i => i.description)).toEqual([
      'Seu principal cliente gera 100.0% da receita.',
    ]);
  });

  it('concentração até o limiar documentado é informativa, não alerta', async () => {
    salesRows = Array.from({ length: 10 }, (_, i) => ({
      amount: 100,
      product_name: 'Caneca',
      client_name: `Cliente ${i + 1}`,
      status: 'won',
    }));

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(CONCENTRATION_WARNING_THRESHOLD_PCT).toBe(50);
    expect(result.current.data?.neuralInsights).toEqual([
      {
        title: 'Concentração de Receita',
        description: 'Seus 3 principais clientes geram 30.0% da receita.',
        type: 'info',
      },
    ]);
  });

  it('exatamente no limiar de 50% ainda é info', async () => {
    // 6 clientes iguais: top 3 = 300 de 600 → 50,0% (não excede o limiar).
    salesRows = Array.from({ length: 6 }, (_, i) => ({
      amount: 100,
      product_name: 'Caneca',
      client_name: `Cliente ${i + 1}`,
      status: 'won',
    }));

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.neuralInsights[0]).toMatchObject({
      description: 'Seus 3 principais clientes geram 50.0% da receita.',
      type: 'info',
    });
  });

  it('clientes distintos com o mesmo nome não são fundidos', async () => {
    // O bug corrigido: client_name repetido colapsava clientes diferentes num
    // só grupo e inflava a concentração.
    clientRows = [
      { id: 'c1', name: 'Cliente Demo' },
      { id: 'c2', name: 'Cliente Demo' },
    ];
    salesRows = [
      {
        amount: 600,
        product_name: 'Caneca',
        client_name: 'Cliente Demo',
        client_id: 'c1',
        status: 'won',
      },
      {
        amount: 400,
        product_name: 'Caneca',
        client_name: 'Cliente Demo',
        client_id: 'c2',
        status: 'won',
      },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clients).toHaveLength(2);
    expect(result.current.data?.clients.map(c => c.revenue)).toEqual([600, 400]);
  });

  it('mesmo cliente com nomes divergentes vira um grupo, rotulado pelo cadastro', async () => {
    clientRows = [{ id: 'c1', name: 'Nome do Cadastro' }];
    salesRows = [
      {
        amount: 300,
        product_name: 'Caneca',
        client_name: 'Apelido A',
        client_id: 'c1',
        status: 'won',
      },
      {
        amount: 200,
        product_name: 'Caneca',
        client_name: 'Apelido B',
        client_id: 'c1',
        status: 'won',
      },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clients).toHaveLength(1);
    expect(result.current.data?.clients[0]).toMatchObject({
      name: 'Nome do Cadastro',
      revenue: 500,
    });
  });

  it('venda sem client_id continua agrupada pelo nome', async () => {
    clientRows = [{ id: 'c1', name: 'Com Cadastro' }];
    salesRows = [
      {
        amount: 400,
        product_name: 'Caneca',
        client_name: 'Com Cadastro',
        client_id: 'c1',
        status: 'won',
      },
      {
        amount: 100,
        product_name: 'Caneca',
        client_name: 'Sem Cadastro',
        client_id: null,
        status: 'won',
      },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clients.map(c => c.name)).toEqual([
      'Com Cadastro',
      'Sem Cadastro',
    ]);
    expect(result.current.data?.totalRevenue).toBe(500);
  });

  it('sem vendas, não gera nenhum insight', async () => {
    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clients).toEqual([]);
    expect(result.current.data?.neuralInsights).toEqual([]);
  });
});
