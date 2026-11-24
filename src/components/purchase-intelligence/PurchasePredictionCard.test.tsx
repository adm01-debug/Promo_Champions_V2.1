import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PurchaseIntelligence } from '@/hooks/purchase-intelligence/usePurchaseIntelligence';

const refetch = vi.fn();
let hookResult: {
  data: PurchaseIntelligence | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

vi.mock('@/hooks/purchase-intelligence/usePurchaseIntelligence', () => ({
  usePurchaseIntelligence: () => hookResult,
}));

import { PurchasePredictionCard } from './PurchasePredictionCard';

const baseData = (
  overrides: Partial<PurchaseIntelligence> = {}
): PurchaseIntelligence => ({
  client_id: 'client-1',
  client_name: 'Acme Ltda',
  total_purchases: 12,
  total_revenue: 48000,
  avg_ticket: 4000,
  avg_cycle_days: 30,
  last_purchase_date: '2026-10-01',
  days_since_last_purchase: 45,
  share_with_me_pct: 60,
  share_with_others_pct: 40,
  top_competitor_internal: null,
  predicted_next_purchase_date: '2026-12-01',
  ai_prediction: {
    predicted_next_purchase_date: '2026-12-01',
    predicted_amount: 4200,
    confidence: 0.72,
    churn_risk_score: 35,
    risk_reasons: ['Ciclo de compra alongado'],
    recommended_action: 'Ligar oferecendo reposicao',
    best_contact_window: 'morning',
    pattern_insight: 'Cliente compra a cada 30 dias',
  },
  computed_at: '2026-11-20T10:00:00Z',
  ...overrides,
});

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/inteligencia-compras']}>
      <Routes>
        <Route
          path="/inteligencia-compras"
          element={<PurchasePredictionCard clientId="client-1" />}
        />
        <Route path="/agenda" element={<div>tela de agenda</div>} />
        <Route path="/orcamentos" element={<div>tela de orcamentos</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PurchasePredictionCard — ações da recomendação (etapa 104)', () => {
  beforeEach(() => {
    refetch.mockClear();
    hookResult = { data: baseData(), isLoading: false, isFetching: false, refetch };
  });

  it('leva para a agenda ao clicar em Agendar', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /Agendar/i }));
    expect(screen.getByText('tela de agenda')).toBeTruthy();
  });

  it('leva para os orçamentos ao clicar em Proposta', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /Proposta/i }));
    expect(screen.getByText('tela de orcamentos')).toBeTruthy();
  });

  it('recarrega a análise quando a IA falha', async () => {
    hookResult = {
      data: baseData({ ai_prediction: null, ai_error: 'rate_limited' }),
      isLoading: false,
      isFetching: false,
      refetch,
    };
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /Tentar Recarregar/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
