import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PricingIntelligenceResponse } from '@/hooks/usePricingIntelligence';

const exportToCSV = vi.fn();
vi.mock('@/utils/csvExport', () => ({
  exportToCSV: (...args: unknown[]) => exportToCSV(...args),
}));

import { PricingHealthBanner } from './PricingHealthBanner';

const details: PricingIntelligenceResponse = {
  days: 90,
  threshold: 20,
  health: 'critical',
  kpis: {
    total_revenue: 500000,
    deals_count: 120,
    avg_ticket: 4166.67,
    avg_discount_pct: 0.234,
    revenue_lost: 98000,
    alerted_deals: 37,
    alert_ratio: 0.308,
  },
  distribution: [{ label: '20-30%', count: 25, revenue: 150000 }],
  top_discounters: [
    {
      salesperson_id: 'sp-1',
      salesperson_name: 'Ana Souza',
      deals_count: 18,
      total_revenue: 90000,
      avg_ticket: 5000,
      avg_discount_pct: 0.31,
      revenue_lost: 32000,
    },
  ],
  product_recommendations: [
    {
      product_name: 'Plano Pro',
      deals_count: 40,
      avg_price: 3200,
      median_price: 3000,
      win_rate: 0.42,
      recommended_price: 3450,
      uplift_pct: 0.078,
    },
  ],
};

function rowsFromMock() {
  return exportToCSV.mock.calls[0]?.[0] as Record<string, string | number>[];
}

describe('PricingHealthBanner — exportação da auditoria (etapa 103)', () => {
  beforeEach(() => {
    exportToCSV.mockClear();
  });

  it('exporta resumo, faixas, vendedores e produtos em CSV', async () => {
    render(<PricingHealthBanner health="critical" dealsCount={120} details={details} />);

    await userEvent.click(screen.getByRole('button', { name: /EXPORTAR AUDITORIA/i }));

    await waitFor(() => expect(exportToCSV).toHaveBeenCalledTimes(1));
    const filename = exportToCSV.mock.calls[0]?.[1] as string;
    expect(filename).toMatch(/^auditoria_pricing_\d{4}-\d{2}-\d{2}$/);

    const rows = rowsFromMock();
    expect(rows).toHaveLength(5);

    const status = rows[0];
    expect(status?.Bloco).toBe('Resumo');
    expect(String(status?.Detalhe)).toContain('Crítico');
    expect(status?.Deals).toBe(120);
    expect(status?.['Receita Perdida (R$)']).toBe(98000);

    expect(rows.find(row => row.Bloco === 'Faixa de desconto')?.Item).toBe('20-30%');
    const seller = rows.find(row => row.Bloco === 'Vendedor');
    expect(seller?.Item).toBe('Ana Souza');
    expect(seller?.['Desconto Medio (%)']).toBe(31);

    const product = rows.find(row => row.Bloco === 'Produto');
    expect(product?.Item).toBe('Plano Pro');
    expect(product?.['Preco Recomendado (R$)']).toBe(3450);
    expect(product?.['Uplift (%)']).toBe(7.8);
  });

  it('exporta apenas o resumo quando o hub não passa os detalhes', async () => {
    render(<PricingHealthBanner health="healthy" dealsCount={8} />);

    await userEvent.click(screen.getByRole('button', { name: /EXPORTAR AUDITORIA/i }));

    await waitFor(() => expect(exportToCSV).toHaveBeenCalledTimes(1));
    const rows = rowsFromMock();
    expect(rows).toHaveLength(2);
    expect(rows[0]?.Deals).toBe(8);
    expect(rows[1]?.Detalhe).toBe('');
  });
});
