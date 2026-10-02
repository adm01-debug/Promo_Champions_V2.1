import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const eqMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import { goalsService } from './goalsService';

interface Chain {
  select: typeof selectMock;
  order: typeof orderMock;
  eq: typeof eqMock;
  then?: (fn: (v: unknown) => unknown) => Promise<unknown>;
}

function buildChain(response: { data: unknown; error: unknown }): Chain {
  const chain: Chain = { select: selectMock, order: orderMock, eq: eqMock };
  selectMock.mockReturnValue(chain);
  orderMock.mockReturnValue(
    Object.assign(chain, {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(response).then(resolve),
    })
  );
  eqMock.mockReturnValue(
    Object.assign(chain, {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(response).then(resolve),
    })
  );
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('goalsService.getGoals', () => {
  it('retorna todas as metas ordenadas por created_at desc', async () => {
    const rows = [{ id: 'g-1' }, { id: 'g-2' }];
    const chain = buildChain({ data: rows, error: null });
    fromMock.mockReturnValue(chain);

    const result = await goalsService.getGoals();

    expect(fromMock).toHaveBeenCalledWith('sales_goals');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(eqMock).not.toHaveBeenCalled();
    expect(result).toEqual(rows);
  });

  it('filtra por salesperson_id quando informado', async () => {
    const chain = buildChain({ data: [{ id: 'g-1' }], error: null });
    fromMock.mockReturnValue(chain);

    const result = await goalsService.getGoals('sp-9');

    expect(eqMock).toHaveBeenCalledWith('salesperson_id', 'sp-9');
    expect(result).toEqual([{ id: 'g-1' }]);
  });

  it('retorna array vazio quando data vem null e propaga erro', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: null }));
    expect(await goalsService.getGoals()).toEqual([]);

    fromMock.mockReturnValue(buildChain({ data: null, error: new Error('db down') }));
    await expect(goalsService.getGoals()).rejects.toThrow('db down');
  });
});
