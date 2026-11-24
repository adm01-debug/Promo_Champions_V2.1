import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

let rows: Record<string, unknown>[] = [];
let queryError: { message: string } | null = null;

vi.mock('@/integrations/supabase/client', () => {
  const q = {
    select: () => q,
    order: () =>
      queryError
        ? Promise.resolve({ data: null, error: queryError })
        : Promise.resolve({ data: rows, error: null }),
  };
  return { supabase: { from: () => q } };
});

import { DuplicateBlockAudit } from './DuplicateBlockAudit';

function renderAudit() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DuplicateBlockAudit />
    </QueryClientProvider>
  );
}

const log = (id: string, entity: string, blockType: string) => ({
  id,
  created_at: '2026-11-01T12:00:00.000Z',
  entity_name: entity,
  block_type: blockType,
  status: 'Blocked',
  auditor: 'Sistema',
  confidence_score: 0.9,
});

describe('DuplicateBlockAudit — busca e erro da consulta (etapa 106)', () => {
  it('filtra a lista pelo termo digitado', async () => {
    rows = [log('1', 'Acme Ltda', 'Duplicidade'), log('2', 'Globex', 'Risco')];
    queryError = null;
    renderAudit();

    expect(await screen.findByText('Acme Ltda')).toBeTruthy();
    expect(screen.getByText('Globex')).toBeTruthy();

    await userEvent.type(
      screen.getByPlaceholderText('Buscar por entidade ou tipo...'),
      'globex'
    );

    expect(screen.queryByText('Acme Ltda')).toBeNull();
    expect(screen.getByText('Globex')).toBeTruthy();
  });

  it('mostra erro da consulta em vez de lista vazia', async () => {
    rows = [];
    queryError = { message: 'permission denied' };
    renderAudit();

    expect(
      await screen.findByText(/Erro ao carregar a auditoria de bloqueios/i)
    ).toBeTruthy();
    expect(screen.queryByText('Nenhum bloqueio registrado.')).toBeNull();
  });
});
