import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

let rows: Record<string, unknown>[] = [];
let queryError: { message: string } | null = null;
const exportToCSV = vi.fn();

// Radix Select depende de APIs de ponteiro que o jsdom nao implementa.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
}

vi.mock('@/utils/csvExport', () => ({
  exportToCSV: (...args: unknown[]) => exportToCSV(...args),
}));

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

const reviewLog = (id: string, entity: string, blockType: string) => ({
  id,
  created_at: '2026-11-02T09:00:00.000Z',
  entity_name: entity,
  block_type: blockType,
  status: 'Pending Review',
  auditor: 'Sistema',
  confidence_score: 0.5,
});

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

  it('filtra por status e exporta apenas as linhas filtradas', async () => {
    rows = [log('1', 'Acme Ltda', 'Duplicidade'), reviewLog('2', 'Globex', 'Risco')];
    queryError = null;
    exportToCSV.mockClear();
    renderAudit();

    expect(await screen.findByText('Acme Ltda')).toBeTruthy();
    expect(screen.getByText('Globex')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Bloqueado' }));

    expect(screen.queryByText('Globex')).toBeNull();
    expect(screen.getByText('Acme Ltda')).toBeTruthy();
    expect(screen.getByText('1 de 2 registros')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /Exportar/i }));

    expect(exportToCSV).toHaveBeenCalledTimes(1);
    const [data, filename] = exportToCSV.mock.calls[0] as [
      Record<string, unknown>[],
      string,
    ];
    expect(filename).toContain('auditoria_bloqueios_');
    expect(data).toHaveLength(1);
    expect(data[0]?.Entidade).toBe('Acme Ltda');
  });

  it('desabilita a exportação quando nenhum registro corresponde ao filtro', async () => {
    rows = [log('1', 'Acme Ltda', 'Duplicidade')];
    queryError = null;
    renderAudit();

    expect(await screen.findByText('Acme Ltda')).toBeTruthy();

    await userEvent.type(
      screen.getByPlaceholderText('Buscar por entidade ou tipo...'),
      'inexistente'
    );

    expect(
      screen.getByText('Nenhum bloqueio encontrado para a busca ou filtro.')
    ).toBeTruthy();
    const exportButton = screen.getByRole('button', {
      name: /Exportar/i,
    }) as HTMLButtonElement;
    expect(exportButton.disabled).toBe(true);
  });
});
