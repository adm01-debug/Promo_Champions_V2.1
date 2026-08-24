import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client antes de importar o service.
const orderMock = vi.fn();
const limitMock = vi.fn();
const orMock = vi.fn();
const selectMock = vi.fn();
const insertMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import { salesService } from './salesService';

interface Chain {
  select: typeof selectMock;
  order: typeof orderMock;
  limit: typeof limitMock;
  or: typeof orMock;
  insert: typeof insertMock;
  then?: (fn: (v: unknown) => unknown) => Promise<unknown>;
}

function buildChain(response: { data: unknown; error: unknown }): Chain {
  const chain: Chain = {
    select: selectMock,
    order: orderMock,
    limit: limitMock,
    or: orMock,
    insert: insertMock,
  };
  selectMock.mockReturnValue(chain);
  orderMock.mockReturnValue(chain);
  // limit é o terminal awaitable no getSales sem searchTerm
  limitMock.mockReturnValue(
    Object.assign(chain, {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(response).then(resolve),
    }),
  );
  // or é o terminal awaitable quando há searchTerm
  orMock.mockReturnValue(
    Object.assign(chain, {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(response).then(resolve),
    }),
  );
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('salesService.getSales', () => {
  it('mapeia rows do Supabase para o formato do domínio', async () => {
    const row = {
      id: 'abcdef1234-uuid',
      amount: 1500,
      status: 'completed',
      created_at: '2026-01-15T12:00:00Z',
      client: { name: 'ACME' },
      product: { name: 'Produto X', sku: 'SKU-1' },
      client_id: 'c-1',
      product_id: 'p-1',
      salesperson_id: 'sp-1',
    };
    buildChain({ data: [row], error: null });
    fromMock.mockImplementation(() => ({
      select: selectMock,
    }));
    // Reencadeia: from().select().order().limit()
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({
      limit: limitMock,
    });
    limitMock.mockResolvedValue({ data: [row], error: null });

    const result = await salesService.getSales();

    expect(fromMock).toHaveBeenCalledWith('sales');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ABCDEF12',
      fullId: 'abcdef1234-uuid',
      cliente: 'ACME',
      produto: 'Produto X',
      valor: 1500,
      status: 'completed',
      statusLabel: 'Concluída',
      client_id: 'c-1',
      sku: 'SKU-1',
    });
    expect(result[0].data).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('faz fallback para client_name/product_name quando joins vêm nulos', async () => {
    const row = {
      id: 'ffffffff-uuid',
      amount: null,
      status: 'pending',
      created_at: '2026-02-01T09:00:00Z',
      client: null,
      product: null,
      client_name: 'Fallback Cli',
      product_name: 'Fallback Prod',
      sku: 'SKU-DIRECT',
    };
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    limitMock.mockResolvedValue({ data: [row], error: null });
    fromMock.mockImplementation(() => ({ select: selectMock }));

    const result = await salesService.getSales();
    expect(result[0].cliente).toBe('Fallback Cli');
    expect(result[0].produto).toBe('Fallback Prod');
    expect(result[0].valor).toBe(0);
    // Status desconhecido no mapping? pending está mapeado como "Pendente"
    expect(result[0].statusLabel).toBe('Pendente');
    expect(result[0].sku).toBe('SKU-DIRECT');
  });

  it('sanitiza o searchTerm (remove vírgulas/parênteses) e chama .or()', async () => {
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    limitMock.mockReturnValue({ or: orMock });
    orMock.mockResolvedValue({ data: [], error: null });
    fromMock.mockImplementation(() => ({ select: selectMock }));

    await salesService.getSales('acme,(evil)*');

    expect(orMock).toHaveBeenCalledTimes(1);
    const filter = orMock.mock.calls[0][0] as string;
    // O user input sanitizado ("acme  evil") não deve conter caracteres perigosos
    // (a vírgula entre client_name/product_name é sintaxe PostgREST, esperada).
    expect(filter).toContain('%acme  evil%');
    expect(filter).not.toMatch(/[()*]/);
    expect(filter.match(/,/g)).toHaveLength(1); // apenas o separador PostgREST
  });

  it('não chama .or() quando o searchTerm sanitizado fica vazio', async () => {
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    limitMock.mockResolvedValue({ data: [], error: null });
    fromMock.mockImplementation(() => ({ select: selectMock }));

    await salesService.getSales('   ,()*  ');
    expect(orMock).not.toHaveBeenCalled();
  });

  it('propaga erro do Supabase', async () => {
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    limitMock.mockResolvedValue({ data: null, error: new Error('boom') });
    fromMock.mockImplementation(() => ({ select: selectMock }));

    await expect(salesService.getSales()).rejects.toThrow('boom');
  });

  it('retorna array vazio quando data é null sem erro', async () => {
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    limitMock.mockResolvedValue({ data: null, error: null });
    fromMock.mockImplementation(() => ({ select: selectMock }));

    const r = await salesService.getSales();
    expect(r).toEqual([]);
  });
});

describe('salesService.createSale', () => {
  it('insere e retorna a row criada', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'new-1' }, error: null });
    const selectAfterInsert = vi.fn().mockReturnValue({ single: singleMock });
    insertMock.mockReturnValue({ select: selectAfterInsert });
    fromMock.mockImplementation(() => ({ insert: insertMock }));

    const payload = {
      client_id: 'c-1',
      product_id: 'p-1',
      amount: 100,
      status: 'pending',
    } as never;
    const result = await salesService.createSale(payload);
    expect(insertMock).toHaveBeenCalledWith([payload]);
    expect(result).toEqual({ id: 'new-1' });
  });

  it('propaga erro do insert', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: new Error('rls') });
    insertMock.mockReturnValue({ select: () => ({ single: singleMock }) });
    fromMock.mockImplementation(() => ({ insert: insertMock }));

    await expect(salesService.createSale({} as never)).rejects.toThrow('rls');
  });
});

describe('salesService.getSales — branch gaps', () => {
  beforeEach(() => {
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ limit: limitMock });
    fromMock.mockImplementation(() => ({ select: selectMock }));
  });

  it('retorna cliente vazio quando client e client_name são nulos', async () => {
    const row = {
      id: 'aaaaaaaa-uuid',
      amount: 0,
      status: 'pending',
      created_at: '2026-03-01T00:00:00Z',
      client: null,
      product: null,
      client_name: null,
      product_name: null,
    };
    limitMock.mockResolvedValue({ data: [row], error: null });
    const result = await salesService.getSales();
    expect(result[0].cliente).toBe('');
    expect(result[0].produto).toBe('');
  });

  it('usa sale.status como statusLabel quando status não está no mapa', async () => {
    const row = {
      id: 'bbbbbbbb-uuid',
      amount: 500,
      status: 'custom_unknown_status',
      created_at: '2026-03-01T00:00:00Z',
      client: { name: 'X' },
      product: { name: 'Y', sku: null },
    };
    limitMock.mockResolvedValue({ data: [row], error: null });
    const result = await salesService.getSales();
    expect(result[0].statusLabel).toBe('custom_unknown_status');
  });
});
