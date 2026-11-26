import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';

type MomentRow = Record<string, unknown>;

const momentRows: MomentRow[] = [
  {
    id: 'moment-1',
    recording_id: 'recording-1',
    owner_id: 'owner-1',
    salesperson_id: 'salesperson-1',
    moment_type: 'objection',
    severity: 'critical',
    timestamp_sec: 125,
    quote: 'Está caro comparado ao concorrente',
    context: 'Cliente comparou preço no meio da demonstração',
    suggested_action: 'Retomar valor percebido antes de falar de desconto',
    status: 'new',
    created_at: '2026-11-20T10:00:00.000Z',
    updated_at: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'moment-2',
    recording_id: 'recording-1',
    owner_id: 'owner-1',
    salesperson_id: 'salesperson-1',
    moment_type: 'buying_signal',
    severity: 'medium',
    timestamp_sec: 340,
    quote: 'Quando podemos começar?',
    context: null,
    suggested_action: null,
    status: 'actioned',
    created_at: '2026-11-19T10:00:00.000Z',
    updated_at: '2026-11-19T12:00:00.000Z',
  },
];

const recordingRows = [
  { id: 'recording-1', title: 'Discovery Acme', recorded_at: '2026-11-19T09:00:00.000Z' },
];
const salespersonRows = [{ id: 'salesperson-1', name: 'Ana Souza' }];
const notificationRows = [{ moment_id: 'moment-1' }];

let failMoments = false;

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    const query = {
      select: () => query,
      order: () => query,
      limit: () => query,
      eq: (column: string, value: unknown) => {
        filters.push([column, value]);
        return query;
      },
      in: () => query,
      is: () => query,
      then: (resolve: (value: unknown) => unknown) => {
        const respond = (data: unknown, error: unknown = null) =>
          Promise.resolve({ data, error }).then(resolve);

        if (table === 'call_critical_moments') {
          if (failMoments) return respond(null, { message: 'permission denied' });
          const rows = momentRows.filter(row =>
            filters.every(([column, value]) => row[column] === value)
          );
          return respond(rows);
        }
        if (table === 'call_recordings') return respond(recordingRows);
        if (table === 'salespeople') return respond(salespersonRows);
        return respond(notificationRows);
      },
    };
    return query;
  };

  return { supabase: { from: (table: string) => builder(table) } };
});

const { useCriticalMoments, formatMomentTimestamp, severityMeta } =
  await import('./useCriticalMoments');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useCriticalMoments', () => {
  it('entrega o momento com gravação, vendedor e estado de leitura resolvidos', async () => {
    const { result } = renderHook(() => useCriticalMoments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.unreadCount).toBe(1);
    expect(result.current.data?.moments[0]).toMatchObject({
      id: 'moment-1',
      recordingTitle: 'Discovery Acme',
      recordedAt: '2026-11-19T09:00:00.000Z',
      salespersonName: 'Ana Souza',
      isUnread: true,
    });
    expect(result.current.data?.moments[1]).toMatchObject({
      id: 'moment-2',
      isUnread: false,
    });
  });

  it('aplica o filtro de status na consulta em vez de filtrar no cliente', async () => {
    const { result } = renderHook(() => useCriticalMoments({ status: 'actioned' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.moments).toHaveLength(1);
    expect(result.current.data?.moments[0].id).toBe('moment-2');
    expect(result.current.data?.unreadCount).toBe(0);
  });

  it('propaga erro de permissão em vez de devolver lista vazia', async () => {
    failMoments = true;
    const { result } = renderHook(() => useCriticalMoments(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ message: 'permission denied' });
    failMoments = false;
  });

  it('formata o instante do áudio e cai em "Média" para severidade desconhecida', () => {
    expect(formatMomentTimestamp(125)).toBe('02:05');
    expect(formatMomentTimestamp(0)).toBe('00:00');
    expect(severityMeta('unknown').label).toBe('Média');
    expect(severityMeta('critical').label).toBe('Crítica');
  });
});
