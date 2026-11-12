import { beforeEach, describe, expect, it, vi } from 'vitest';

type Call = {
  table: string;
  select: string;
  options: unknown;
  filters: Array<[string, string, unknown]>;
};

const calls: Call[] = [];
let counts: Record<string, { total: number; completed: number }> = {};
let failWith: { message: string } | null = null;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      const call: Call = { table, select: '', options: undefined, filters: [] };
      calls.push(call);
      const query = {
        select: (columns: string, options: unknown) => {
          call.select = columns;
          call.options = options;
          return query;
        },
        eq: (column: string, value: unknown) => {
          call.filters.push(['eq', column, value]);
          return query;
        },
        gte: (column: string, value: unknown) => {
          call.filters.push(['gte', column, value]);
          return query;
        },
        lte: (column: string, value: unknown) => {
          call.filters.push(['lte', column, value]);
          return query;
        },
        then: (resolve: (value: unknown) => unknown) => {
          if (failWith) {
            return Promise.resolve({ count: null, error: failWith }).then(resolve);
          }
          const channel = call.filters.find(
            f => f[1] === 'cadence_steps.action_type'
          )?.[2];
          const onlyCompleted = call.filters.some(
            f => f[1] === 'status' && f[2] === 'completed'
          );
          const c = counts[String(channel)] ?? { total: 0, completed: 0 };
          return Promise.resolve({
            count: onlyCompleted ? c.completed : c.total,
            error: null,
          }).then(resolve);
        },
      };
      return query;
    },
  },
}));

const { fetchCadenceChannelStats, CADENCE_CHANNEL_TYPES } =
  await import('./useCadenceChannelStats');

describe('fetchCadenceChannelStats', () => {
  beforeEach(() => {
    calls.length = 0;
    counts = {};
    failWith = null;
  });

  it('conta no banco (HEAD + count exato) filtrando o período, sem trazer linhas', async () => {
    counts = { email: { total: 1500, completed: 300 } };
    await fetchCadenceChannelStats(30, new Date(2026, 10, 12));

    expect(calls).toHaveLength(CADENCE_CHANNEL_TYPES.length * 2);
    for (const call of calls) {
      expect(call.table).toBe('cadence_tasks');
      expect(call.options).toEqual({ count: 'exact', head: true });
      expect(call.select).toContain('cadence_steps!inner(action_type)');
      expect(call.filters).toContainEqual(['gte', 'scheduled_date', '2026-10-13']);
      expect(call.filters).toContainEqual(['lte', 'scheduled_date', '2026-11-12']);
    }
  });

  it('calcula taxa geral e por canal a partir das contagens reais (acima de 1000 linhas)', async () => {
    counts = {
      email: { total: 1500, completed: 300 },
      whatsapp: { total: 200, completed: 150 },
    };
    const stats = await fetchCadenceChannelStats(30, new Date(2026, 10, 12));

    expect(stats.totalTasks).toBe(1700);
    expect(stats.completedTasks).toBe(450);
    expect(stats.completionRate).toBeCloseTo((450 / 1700) * 100);
    expect(stats.channels.map(c => c.type)).toEqual(['whatsapp', 'email']);
    expect(stats.topChannel).toMatchObject({ type: 'whatsapp', rate: 75 });
  });

  it('retorna vazio honesto quando não há tarefas no período', async () => {
    const stats = await fetchCadenceChannelStats(30, new Date(2026, 10, 12));
    expect(stats).toMatchObject({
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      channels: [],
      topChannel: null,
    });
  });

  it('propaga erro do banco em vez de mostrar zero', async () => {
    failWith = { message: 'permission denied' };
    await expect(fetchCadenceChannelStats(30)).rejects.toEqual(failWith);
  });
});
