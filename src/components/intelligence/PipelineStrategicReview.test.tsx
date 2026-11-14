import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PipelineStrategicReview } from './PipelineStrategicReview';

describe('PipelineStrategicReview', () => {
  it('mostra estado vazio sem inspeção nem win rate (sem números inventados)', () => {
    render(
      <PipelineStrategicReview
        winRateBreakdown={[]}
        inspection={{ total_inspected: 0, flag_counts: {}, deals: [] }}
      />
    );

    expect(screen.getByText(/Sem dados suficientes ainda/)).toBeInTheDocument();
    expect(screen.queryByText('Semana 19 - Maio 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('R$ 1.2M')).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('calcula indicadores a partir da inspeção e do win rate reais', () => {
    const onNavigateTab = vi.fn();
    render(
      <PipelineStrategicReview
        winRateBreakdown={[
          {
            segment: 'A',
            total_deals: 4,
            won_deals: 1,
            lost_deals: 3,
            win_rate: 25,
            avg_deal_size: 0,
            total_revenue: 0,
          },
        ]}
        inspection={{
          total_inspected: 2,
          flag_counts: { stale_stage: 1 },
          deals: [
            {
              id: 'i1',
              sale_id: 's1',
              stage: 'proposal',
              days_in_stage: 10,
              last_activity_at: null,
              days_since_activity: null,
              risk_flags: [{ flag: 'stale_stage', severity: 'high' }],
              inspected_at: '2026-11-01T00:00:00Z',
            },
            {
              id: 'i2',
              sale_id: 's2',
              stage: 'proposal',
              days_in_stage: 5,
              last_activity_at: null,
              days_since_activity: null,
              risk_flags: [],
              inspected_at: '2026-11-01T00:00:00Z',
            },
          ],
        }}
        onNavigateTab={onNavigateTab}
      />
    );

    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('7.5 dias')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Estágio parado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver inspeção do pipeline/ }));
    expect(onNavigateTab).toHaveBeenCalledWith('inspection');
  });
});
