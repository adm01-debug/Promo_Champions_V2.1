import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Deal } from '@/hooks/usePipeline';

vi.mock('@/hooks/scoring/useLeadScoreExplanation', () => ({
  useLeadScoreExplanation: () => ({ data: undefined }),
}));
vi.mock('@/hooks/usePlaybooks', () => ({
  usePlaybooksByStage: () => ({ data: [] }),
  useDealPlaybookProgress: () => ({ data: [] }),
}));
vi.mock('./QuickActionsMenu', () => ({ QuickActionsMenu: () => null }));
vi.mock('./DealPlaybookModal', () => ({ DealPlaybookModal: () => null }));

const { DealCard } = await import('./DealCard');

const deal: Deal = {
  id: 'deal-1',
  client_id: null,
  client_name: 'Cliente Real',
  product_name: 'Caneca personalizada',
  amount: 1500,
  status: 'proposal',
  category: 'subscription',
  salesperson_id: null,
  sdr_id: null,
  source: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <DealCard deal={deal} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe('DealCard', () => {
  it('renderiza o deal sem presença inventada de outros usuários', () => {
    const { container } = renderCard();

    expect(screen.getByText('Cliente Real')).toBeInTheDocument();
    expect(screen.queryByText(/Felix/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Anna/)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/seed=(Felix|Anna)/);
    // Fallbacks dos avatares fictícios (a imagem não carrega no jsdom).
    expect(screen.queryByText('FX')).not.toBeInTheDocument();
    expect(screen.queryByText('AN')).not.toBeInTheDocument();
  });

  it('não oferece o botão simulado de enriquecimento', () => {
    renderCard();

    expect(
      screen.queryByText(/Enriquecer com Dados de Ecossistema/)
    ).not.toBeInTheDocument();
    expect(document.querySelector('.lucide-database')).toBeNull();
  });
});
