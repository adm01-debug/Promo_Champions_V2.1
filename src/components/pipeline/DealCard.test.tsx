import { render } from '@testing-library/react';
import { fireEvent, screen } from '@testing-library/dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Deal } from '@/hooks/usePipeline';
import type { DealStakeholderSummary } from '@/hooks/pipeline/useDealCardContext';

vi.mock('@/hooks/scoring/useLeadScoreExplanation', () => ({
  useLeadScoreExplanation: () => ({ data: undefined }),
}));
vi.mock('@/hooks/usePlaybooks', () => ({
  usePlaybooksByStage: () => ({ data: [] }),
  useDealPlaybookProgress: () => ({ data: [] }),
}));
vi.mock('./QuickActionsMenu', () => ({ QuickActionsMenu: () => null }));
vi.mock('./DealSummaryCard', () => ({ DealSummaryCard: () => null }));
vi.mock('./StagnantDealAlert', () => ({ StagnantDealAlert: () => null }));
vi.mock('./DealPlaybookModal', () => ({ DealPlaybookModal: () => null }));
vi.mock('./SLACountdown', () => ({ SLACountdown: () => null }));
vi.mock('./Sparkline', () => ({ Sparkline: () => null }));

const { DealCard } = await import('./DealCard');

const now = new Date().toISOString();
const deal: Deal = {
  id: 'deal-1',
  client_id: 'client-1',
  client_name: 'Cliente Real',
  product_name: 'Caneta Personalizada',
  amount: 1500,
  status: 'proposal',
  category: 'brindes',
  salesperson_id: 'sp-1',
  sdr_id: null,
  source: null,
  created_at: now,
  updated_at: now,
  health_score: 90,
};

function renderCard(props: {
  stakeholders?: DealStakeholderSummary[];
  clientPhone?: string | null;
}) {
  return render(
    <MemoryRouter initialEntries={['/pipeline']}>
      <TooltipProvider>
        <Routes>
          <Route
            path="/pipeline"
            element={
              <DndContext>
                <SortableContext items={[deal.id]}>
                  <DealCard deal={deal} {...props} />
                </SortableContext>
              </DndContext>
            }
          />
          <Route path="/tarefas" element={<p>Página de tarefas</p>} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DealCard — sem dado inventado', () => {
  it('não mostra comitê fictício, selo RevOps nem ações falsas', () => {
    renderCard({});

    expect(screen.queryByText(/Decisores/i)).toBeNull();
    expect(screen.queryByText(/Stakeholder/i)).toBeNull();
    expect(screen.queryByText(/RevOps OK/i)).toBeNull();
    expect(screen.queryByLabelText('Abrir WhatsApp do cliente')).toBeNull();
    expect(screen.queryByText(/Voice Command/i)).toBeNull();
    expect(screen.queryByText(/Enriquecer/i)).toBeNull();
  });

  it('mostra a contagem real de stakeholders do deal', () => {
    renderCard({
      stakeholders: [
        {
          id: 'st-1',
          name: 'Ana',
          role_title: 'Diretora de Compras',
          dmu_role: 'decision_maker',
          sentiment: 'positive',
        },
        {
          id: 'st-2',
          name: 'Bruno',
          role_title: null,
          dmu_role: 'influencer',
          sentiment: 'neutral',
        },
      ],
    });

    expect(screen.getByText(/2\s+Stakeholders/)).toBeDefined();
  });

  it('abre o WhatsApp com o telefone cadastrado do cliente', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderCard({ clientPhone: '+55 (11) 98888-7777' });

    fireEvent.click(screen.getByLabelText('Abrir WhatsApp do cliente'));

    expect(open).toHaveBeenCalledWith(
      'https://wa.me/5511988887777',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('o botão de tarefas navega para a rota real de tarefas', () => {
    renderCard({});

    fireEvent.click(screen.getByLabelText('Abrir minhas tarefas'));

    expect(screen.getByText('Página de tarefas')).toBeDefined();
  });
});

describe('DealCard — sem presença inventada de usuários', () => {
  it('renderiza o deal sem presença fictícia de outros usuários', () => {
    const { container } = renderCard({});

    expect(screen.getByText('Cliente Real')).toBeInTheDocument();
    expect(screen.queryByText(/Felix/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Anna/)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/seed=(Felix|Anna)/);
    expect(screen.queryByText('FX')).not.toBeInTheDocument();
    expect(screen.queryByText('AN')).not.toBeInTheDocument();
  });

  it('não oferece o botão simulado de enriquecimento', () => {
    renderCard({});

    expect(
      screen.queryByText(/Enriquecer com Dados de Ecossistema/)
    ).not.toBeInTheDocument();
    expect(document.querySelector('.lucide-database')).toBeNull();
  });
});
