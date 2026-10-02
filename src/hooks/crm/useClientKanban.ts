/**
 * Board Kanban da carteira de clientes: entradas de client_portfolio
 * agrupadas por status + mudança de status via RPC.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KanbanClient {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  total_value: number;
}

export interface PortfolioEntry {
  id: string;
  client_id: string;
  status: string;
  clients: KanbanClient;
}

export function useClientKanban() {
  return useQuery({
    queryKey: ['client-kanban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_portfolio')
        .select(
          'id, client_id, status, clients(id, name, company, email, phone, total_value)'
        )
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data as PortfolioEntry[]) || [];
    },
  });
}

export function useUpdateKanbanStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      portfolioId,
      newStatus,
    }: {
      portfolioId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase.rpc(
        'update_client_portfolio_status' as never,
        {
          p_portfolio_id: portfolioId,
          p_status: newStatus,
          p_last_purchase_date: null,
        } as never
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
    },
  });
}
