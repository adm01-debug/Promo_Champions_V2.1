import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateChunks: string[][] = [];
const updatePatches: Array<Record<string, unknown>> = [];
const invoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    let data: Array<{ id: string }> = [];
    const query = {
      update: (patch: Record<string, unknown>) => {
        updatePatches.push(patch);
        return query;
      },
      in: (column: string, values: string[]) => {
        if (column === 'id') {
          updateChunks.push([...values]);
          data = values.map(id => ({ id }));
        }
        return query;
      },
      select: () => query,
      then: (resolve: (value: { data: Array<{ id: string }>; error: null }) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return query;
  };

  return {
    supabase: {
      from: () => builder(),
      functions: { invoke },
    },
  };
});

const { useDiscardDrafts, useManualRetryDrafts } = await import('./useFailedDrafts');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('mutações de rascunhos com falha', () => {
  beforeEach(() => {
    updateChunks.length = 0;
    updatePatches.length = 0;
    invoke.mockReset();
    invoke.mockResolvedValue({
      data: { scanned: 201, retried: 201, gaveUp: 0, failed: 0 },
      error: null,
    });
  });

  it('particiona o reenvio manual e mantém o mesmo horário para todos os chunks', async () => {
    const ids = Array.from({ length: 201 }, (_, index) => `draft-${index}`);
    const { result } = renderHook(() => useManualRetryDrafts(), { wrapper });

    let response: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
    await act(async () => {
      response = await result.current.mutateAsync(ids);
    });

    expect(updateChunks.map(chunk => chunk.length)).toEqual([100, 100, 1]);
    expect(updatePatches.every(patch => patch.error === 'manual_retry_requested')).toBe(
      true
    );
    expect(new Set(updatePatches.map(patch => patch.next_retry_at)).size).toBe(1);
    expect(response).toMatchObject({ requested: 201, retried: 201, failed: 0 });
    expect(invoke).toHaveBeenCalledWith('email-bulk-retry', { body: {} });
  });

  it('particiona o descarte manual de rascunhos', async () => {
    const ids = Array.from({ length: 201 }, (_, index) => `draft-${index}`);
    const { result } = renderHook(() => useDiscardDrafts(), { wrapper });

    let discarded = 0;
    await act(async () => {
      discarded = await result.current.mutateAsync(ids);
    });

    expect(updateChunks.map(chunk => chunk.length)).toEqual([100, 100, 1]);
    expect(updatePatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ approved: false, next_retry_at: null }),
      ])
    );
    expect(discarded).toBe(201);
  });
});
