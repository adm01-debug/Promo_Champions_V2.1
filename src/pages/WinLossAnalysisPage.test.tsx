import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WinLossAnalysisPage from './WinLossAnalysisPage';

const exportToCSV = vi.fn();

vi.mock('@/utils/csvExport', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/csvExport')>('@/utils/csvExport');
  return { ...actual, exportToCSV: (...args: unknown[]) => exportToCSV(...args) };
});

vi.mock('@/components/analytics/WinLossAnalysis', () => ({
  WinLossAnalysis: ({ details }: { details?: unknown[] }) => (
    <div data-testid="analysis">{details?.length ?? -1} detalhes</div>
  ),
}));

const details = [
  {
    id: '1',
    outcome: 'won',
    reason: 'Rapidez na resposta',
    notes: null,
    created_at: '2024-01-10T12:00:00Z',
    sales: { product_name: 'Plano A', amount: 1000, client_name: 'Cliente Alpha' },
    salespeople: { name: 'Ana' },
  },
  {
    id: '2',
    outcome: 'lost',
    reason: 'Falta de integracao',
    notes: null,
    created_at: '2024-01-11T12:00:00Z',
    sales: { product_name: 'Plano B', amount: 2000, client_name: 'Cliente Beta' },
    salespeople: { name: 'Bruno' },
  },
];

vi.mock('@/hooks/useWinLossAnalysis', () => ({
  useWinLossAnalysis: () => ({
    data: {
      totalWins: 1,
      totalLosses: 1,
      winRate: 50,
      topWinReasons: [],
      topLossReasons: [],
      monthlyTrend: [],
      details,
      bySalesperson: [
        { name: 'Ana', wins: 1, losses: 0, winRate: 100 },
        { name: 'Bruno', wins: 0, losses: 1, winRate: 0 },
      ],
      byProduct: [],
    },
    isLoading: false,
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/analytics/win-loss']}>
      <WinLossAnalysisPage />
    </MemoryRouter>
  );

describe('WinLossAnalysisPage', () => {
  beforeEach(() => {
    exportToCSV.mockClear();
  });

  it('exporta todos os negocios carregados quando nao ha filtro', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Exportar Dados/i }));

    expect(exportToCSV).toHaveBeenCalledTimes(1);
    const [rows, filename] = exportToCSV.mock.calls[0];
    expect(filename).toMatch(/^win_loss_\d{4}-\d{2}-\d{2}$/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      Vendedor: 'Ana',
      Cliente: 'Cliente Alpha',
      Desfecho: 'Ganho',
      'Valor (R$)': 1000,
    });
  });

  it('filtra por resultado, reflete na tela e exporta so o que sobrou', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByTestId('analysis')).toHaveTextContent('2 detalhes');

    await user.click(screen.getByRole('button', { name: /Filtros Avançados/i }));
    await user.click(screen.getByRole('button', { name: 'Perdas' }));

    expect(screen.getByTestId('analysis')).toHaveTextContent('1 detalhes');

    await user.click(screen.getByRole('button', { name: /Exportar Dados/i }));

    const [rows] = exportToCSV.mock.calls[0];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ Vendedor: 'Bruno', Desfecho: 'Perdido' });
  });

  it('filtra por vendedor e limpa os filtros', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Filtros Avançados/i }));
    await user.click(screen.getByRole('button', { name: 'Ana' }));
    expect(screen.getByTestId('analysis')).toHaveTextContent('1 detalhes');

    await user.click(screen.getByRole('button', { name: /Limpar/i }));
    expect(screen.getByTestId('analysis')).toHaveTextContent('2 detalhes');
  });
});
