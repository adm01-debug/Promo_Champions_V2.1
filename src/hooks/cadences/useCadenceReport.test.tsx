import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CadenceMetrics } from './useCadenceMetrics';

type Filters = Record<string, unknown>;

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  calls: [] as Array<{
    table: string;
    select: string;
    options: unknown;
    filters: Filters;
  }>,
  counts: {} as Record<string, { total: number; completed: number }>,
  error: null as null | { message: string },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mocks.from },
}));

const { aggregateCadenceReport, useCadenceChannelExecution } =
  await import('./useCadenceReport');

function makeBuilder(table: string) {
  const call = {
    table,
    select: '',
    options: undefined as unknown,
    filters: {} as Filters,
  };
  mocks.calls.push(call);
  const builder = {
    select(cols: string, options: unknown) {
      call.select = cols;
      call.options = options;
      return builder;
    },
    eq(col: string, val: unknown) {
      call.filters[`eq:${col}`] = val;
      return builder;
    },
    gte(col: string, val: unknown) {
      call.filters[`gte:${col}`] = val;
      return builder;
    },
    lte(col: string, val: unknown) {
      call.filters[`lte:${col}`] = val;
      return builder;
    },
    then(resolve: (v: { count: number | null; error: unknown }) => unknown) {
      if (mocks.error)
        return Promise.resolve({ count: null, error: mocks.error }).then(resolve);
      const channel = call.filters['eq:cadence_step.action_type'] as string;
      const c = mocks.counts[channel] ?? { total: 0, completed: 0 };
      const count = call.filters['eq:status'] === 'completed' ? c.completed : c.total;
      return Promise.resolve({ count, error: null }).then(resolve);
    },
  };
  return builder;
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

function row(partial: Partial<CadenceMetrics>): CadenceMetrics {
  return {
    cadence_id: 'c',
    cadence_name: 'C',
    total_enrolled: 0,
    active_count: 0,
    paused_count: 0,
    completed_count: 0,
    cancelled_count: 0,
    auto_paused_count: 0,
    total_tasks: 0,
    tasks_completed: 0,
    tasks_skipped: 0,
    completion_rate: 0,
    reply_rate: 0,
    conversion_rate: 0,
    ...partial,
  };
}

describe('aggregateCadenceReport', () => {
  it('sem linhas devolve zeros (sem número inventado)', () => {
    expect(aggregateCadenceReport([])).toEqual({
      enrolled: 0,
      active: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      replied: 0,
      converted: 0,
      completionRate: 0,
      replyRate: 0,
      conversionRate: 0,
    });
  });

  it('pondera resposta/conversão pelo número de inscritos de cada cadência', () => {
    const totals = aggregateCadenceReport([
      row({
        total_enrolled: 10,
        active_count: 4,
        total_tasks: 20,
        tasks_completed: 15,
        reply_rate: 30,
        conversion_rate: 10,
      }),
      row({
        total_enrolled: 30,
        active_count: 6,
        total_tasks: 60,
        tasks_completed: 30,
        reply_rate: 10,
        conversion_rate: 6.7,
      }),
    ]);
    expect(totals.enrolled).toBe(40);
    expect(totals.active).toBe(10);
    expect(totals.tasksCompleted).toBe(45);
    expect(totals.tasksTotal).toBe(80);
    expect(totals.completionRate).toBe(56.3);
    expect(totals.replied).toBe(6); // 3 + 3
    expect(totals.replyRate).toBe(15);
    expect(totals.converted).toBe(3); // 1 + 2
    expect(totals.conversionRate).toBe(7.5);
  });
});

describe('useCadenceChannelExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.calls.length = 0;
    mocks.counts = {};
    mocks.error = null;
    mocks.from.mockImplementation((table: string) => makeBuilder(table));
  });

  it('conta tarefas reais por canal no período, só os canais com tarefa, ordenado por taxa', async () => {
    mocks.counts = {
      email: { total: 10, completed: 2 },
      whatsapp: { total: 4, completed: 3 },
    };

    const { result } = renderHook(() => useCadenceChannelExecution(7), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { channel: 'whatsapp', total: 4, completed: 3, rate: 75 },
      { channel: 'email', total: 10, completed: 2, rate: 20 },
    ]);

    expect(mocks.calls.every(c => c.table === 'cadence_tasks')).toBe(true);
    const [first] = mocks.calls;
    expect(first?.options).toEqual({ count: 'exact', head: true });
    expect(first?.select).toContain('cadence_steps!inner(action_type)');
    const filters = first?.filters ?? {};
    expect(filters['gte:scheduled_date']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(filters['lte:scheduled_date']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('sem tarefas no período devolve lista vazia', async () => {
    const { result } = renderHook(() => useCadenceChannelExecution(30), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('propaga erro do banco em vez de mostrar zero', async () => {
    mocks.error = { message: 'permission denied' };
    const { result } = renderHook(() => useCadenceChannelExecution(7), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
