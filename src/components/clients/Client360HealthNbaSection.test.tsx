import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client360HealthNbaSection } from './Client360HealthNbaSection';
import type { Client360Data } from '@/hooks/crm/useClient360';

const mutate = vi.fn();

vi.mock('@/hooks/tasks/useTaskMutations', () => ({
  useCreateTask: () => ({ mutate, isPending: false }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const baseData = {
  orders: [
    {
      id: 's1',
      created_at: '2026-10-01T00:00:00Z',
      client_id: 'c1',
      salesperson_id: 'sp-dono',
    },
  ],
  purchaseFrequency: 30,
  churnRisk: 70,
  predictedNextPurchaseDays: 5,
  nba: { title: 'Resgate Crítico', description: 'Reativar cliente.', script: 'Oi!' },
} as Partial<Client360Data> as Client360Data;

describe('Client360HealthNbaSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não exibe confiança fixa inventada', () => {
    render(<Client360HealthNbaSection data={baseData} clientName="ACME" />);
    expect(screen.queryByText(/Confiança/i)).not.toBeInTheDocument();
  });

  it('não rotula a regra estática como IA', () => {
    render(<Client360HealthNbaSection data={baseData} clientName="ACME" />);
    expect(screen.queryByText(/\bIA\b/)).not.toBeInTheDocument();
    expect(screen.getByText('Próxima Ação Sugerida')).toBeInTheDocument();
  });

  it('Agendar follow-up cria tarefa real para o cliente', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: 'sp-atual', error: null } as never);

    render(<Client360HealthNbaSection data={baseData} clientName="ACME" />);
    fireEvent.click(screen.getByRole('button', { name: /Agendar follow-up/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(supabase.rpc).toHaveBeenCalledWith('get_current_salesperson_id');
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Resgate Crítico — ACME',
        description: 'Reativar cliente.',
        task_type: 'follow_up',
        priority: 'high',
        client_id: 'c1',
        salesperson_id: 'sp-atual',
      })
    );
  });

  it('não cria tarefa e avisa quando o vendedor não pode ser identificado', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'falhou' },
    } as never);

    render(<Client360HealthNbaSection data={baseData} clientName="ACME" />);
    fireEvent.click(screen.getByRole('button', { name: /Agendar follow-up/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(mutate).not.toHaveBeenCalled();
  });
});
