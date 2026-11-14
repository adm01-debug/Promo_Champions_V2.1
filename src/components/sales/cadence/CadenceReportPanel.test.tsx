import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useCadenceMetrics: vi.fn(),
  useCadenceChannelExecution: vi.fn(),
}));

vi.mock('@/hooks/cadences/useCadenceMetrics', () => ({
  useCadenceMetrics: mocks.useCadenceMetrics,
}));

vi.mock('@/hooks/cadences/useCadenceReport', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/hooks/cadences/useCadenceReport')>();
  return { ...actual, useCadenceChannelExecution: mocks.useCadenceChannelExecution };
});

const { CadenceReportPanel } = await import('./CadenceReportPanel');

const idle = { data: undefined, isLoading: false, isError: false };

describe('CadenceReportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCadenceMetrics.mockReturnValue({ ...idle, data: [] });
    mocks.useCadenceChannelExecution.mockReturnValue({ ...idle, data: [] });
  });

  it('busca o período semanal (7 dias) por padrão', () => {
    render(<CadenceReportPanel />);
    expect(mocks.useCadenceMetrics).toHaveBeenCalledWith(undefined, 7);
    expect(mocks.useCadenceChannelExecution).toHaveBeenCalledWith(7);
  });

  it('sem dados mostra estado vazio honesto e nenhum valor fixo antigo', () => {
    render(<CadenceReportPanel />);
    expect(
      screen.getByText('Nenhuma inscrição em cadência nos últimos 7 dias.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Nenhuma tarefa de cadência vencida nos últimos 7 dias.')
    ).toBeInTheDocument();
    for (const fixo of ['42.5%', '18.2%', '5.4%', '12.4%', '8.1%', '3.2%', 'Meta: 10']) {
      expect(screen.queryByText(fixo)).not.toBeInTheDocument();
    }
  });

  it('mostra métricas consolidadas e execução por canal vindas do banco', () => {
    mocks.useCadenceMetrics.mockReturnValue({
      ...idle,
      data: [
        {
          cadence_id: 'c1',
          cadence_name: 'Prospecção',
          total_enrolled: 20,
          active_count: 5,
          paused_count: 0,
          completed_count: 0,
          cancelled_count: 0,
          auto_paused_count: 0,
          total_tasks: 40,
          tasks_completed: 10,
          tasks_skipped: 0,
          completion_rate: 25,
          reply_rate: 15,
          conversion_rate: 5,
        },
      ],
    });
    mocks.useCadenceChannelExecution.mockReturnValue({
      ...idle,
      data: [{ channel: 'whatsapp', total: 8, completed: 6, rate: 75 }],
    });

    render(<CadenceReportPanel />);

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5 ativas')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('10/40 tarefas')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('3 responderam')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('1 vendas concluídas')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('erro de carregamento é exibido em vez de zeros', () => {
    mocks.useCadenceMetrics.mockReturnValue({ ...idle, isError: true });
    mocks.useCadenceChannelExecution.mockReturnValue({ ...idle, isError: true });
    render(<CadenceReportPanel />);
    expect(
      screen.getByText('Não foi possível carregar as métricas de cadência.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Não foi possível carregar a execução por canal.')
    ).toBeInTheDocument();
  });
});
