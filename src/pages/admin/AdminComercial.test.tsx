import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let auditRows: Record<string, unknown>[] = [];

vi.mock('@/integrations/supabase/client', () => {
  const make = (table: string) => {
    const q: Record<string, unknown> = {};
    const chain = () => q;
    Object.assign(q, {
      select: chain,
      eq: chain,
      in: chain,
      is: chain,
      order: chain,
      limit: chain,
      insert: chain,
      update: chain,
      delete: chain,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({
          data: table === 'audit_logs' ? auditRows : [],
          error: null,
        }).then(resolve),
    });
    return q;
  };
  return {
    supabase: {
      from: (table: string) => make(table),
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: { id: 'user-1', email: 'admin@teste.com' } } }),
      },
    },
  };
});

const exportToCSV = vi.fn();
vi.mock('@/utils/csvExport', () => ({
  exportToCSV: (...args: unknown[]) => exportToCSV(...args),
  formatDateForExport: (value: string) => value,
}));

import AdminComercial from './AdminComercial';

const log = (id: string, action: string, entityType: string) => ({
  id,
  created_at: '2026-11-01T12:00:00.000Z',
  action,
  entity_type: entityType,
  entity_id: `entity-${id}`,
  actor_email: 'admin@teste.com',
  changes: { campo: 'valor' },
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminComercial />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function openHistoryTab() {
  renderPage();
  await userEvent.click(await screen.findByRole('tab', { name: /Histórico/i }));
}

describe('AdminComercial — histórico de auditoria (etapa 102)', () => {
  beforeEach(() => {
    exportToCSV.mockClear();
    auditRows = [
      log('1', 'approved_goal', 'goal'),
      log('2', 'create_approval_commission', 'commission'),
    ];
  });

  it('filtra o histórico pelo termo digitado', async () => {
    await openHistoryTab();

    expect(await screen.findByText(/APROVADO: goal/i)).toBeTruthy();
    expect(screen.getByText(/SOLICITADO: commission/i)).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /Filtrar/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/Evento, entidade, registro ou ator/i),
      'approved'
    );

    expect(screen.queryByText(/SOLICITADO: commission/i)).toBeNull();
    expect(screen.getByText(/APROVADO: goal/i)).toBeTruthy();
    expect(screen.getByText(/1 de 2 registros/i)).toBeTruthy();
  });

  it('exporta apenas as linhas que passam pelo filtro', async () => {
    await openHistoryTab();

    await userEvent.click(await screen.findByRole('button', { name: /Filtrar/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/Evento, entidade, registro ou ator/i),
      'commission'
    );
    await userEvent.click(screen.getByRole('button', { name: /Exportar/i }));

    await waitFor(() => expect(exportToCSV).toHaveBeenCalledTimes(1));
    const [rows, filename] = exportToCSV.mock.calls[0] as [
      Record<string, string>[],
      string,
    ];
    expect(filename).toContain('auditoria_comercial_');
    expect(rows).toHaveLength(1);
    expect(rows[0].Evento).toBe('create_approval_commission');
    expect(rows[0].Entidade).toBe('commission');
  });

  it('avisa quando o filtro não encontra nenhum registro', async () => {
    await openHistoryTab();

    await userEvent.click(await screen.findByRole('button', { name: /Filtrar/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/Evento, entidade, registro ou ator/i),
      'inexistente'
    );

    expect(
      await screen.findByText(/Nenhum registro corresponde ao filtro/i)
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Exportar/i })).toHaveProperty(
      'disabled',
      true
    );
  });
});
