import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { HeatmapCell } from '@/hooks/purchase-intelligence/usePurchaseIntelligence';

const exportToCSV = vi.fn();
let rows: HeatmapCell[] = [];

vi.mock('@/utils/csvExport', () => ({
  exportToCSV: (...args: unknown[]) => exportToCSV(...args),
}));

vi.mock('@/hooks/purchase-intelligence/usePurchaseIntelligence', () => ({
  usePurchaseHeatmap: () => ({ data: rows, isLoading: false }),
}));

import { PurchaseHeatmapGrid } from './PurchaseHeatmapGrid';

const cell = (overrides: Partial<HeatmapCell>): HeatmapCell => ({
  client_id: 'client-1',
  client_name: 'Acme Ltda',
  month_start: '2026-09-01',
  salesperson_id: 'sp-1',
  salesperson_name: 'Ana',
  is_current_user: true,
  deal_count: 2,
  revenue: 12000,
  won_count: 1,
  ...overrides,
});

describe('PurchaseHeatmapGrid — exportação do mapa de compras (etapa 104)', () => {
  it('exporta em CSV as células visíveis, somando receita por cliente e mês', async () => {
    rows = [
      cell({}),
      cell({
        salesperson_id: 'sp-2',
        salesperson_name: 'Bruno',
        is_current_user: false,
        revenue: 3000,
      }),
      cell({
        client_id: 'client-2',
        client_name: 'Globex',
        month_start: '2026-10-01',
        revenue: 5000,
      }),
    ];
    exportToCSV.mockClear();
    render(<PurchaseHeatmapGrid />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Exportar mapa de compras em CSV' })
    );

    expect(exportToCSV).toHaveBeenCalledTimes(1);
    const [data, filename] = exportToCSV.mock.calls[0] as [
      Record<string, unknown>[],
      string,
    ];
    expect(filename).toContain('mapa_de_compras_');
    expect(data).toHaveLength(2);

    const acme = data.find(row => row.Cliente === 'Acme Ltda');
    expect(acme?.Mes).toBe('2026-09-01');
    expect(acme?.['Receita Total (R$)']).toBe(15000);
    expect(acme?.['Minha Receita (R$)']).toBe(12000);
    expect(acme?.Deals).toBe(4);

    const globex = data.find(row => row.Cliente === 'Globex');
    expect(globex?.['Receita Total (R$)']).toBe(5000);
  });

  it('mostra estado vazio, sem exportação, quando não há compras no período', async () => {
    rows = [];
    exportToCSV.mockClear();
    render(<PurchaseHeatmapGrid />);

    expect(screen.getByText(/registros de compras/i)).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Exportar mapa de compras em CSV' })
    ).toBeNull();
    expect(exportToCSV).not.toHaveBeenCalled();
  });
});
