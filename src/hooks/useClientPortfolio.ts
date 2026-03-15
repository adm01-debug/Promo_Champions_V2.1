import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientPortfolioItem {
  id: string;
  client_id: string;
  salesperson_id: string;
  status: string;
  assigned_at: string;
  last_purchase_date: string | null;
  source: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; email?: string; phone?: string; company?: string };
  salesperson?: { name: string };
}

export const useClientPortfolio = (salespersonId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['client_portfolio', salespersonId],
    queryFn: async () => {
      let query = supabase
        .from('client_portfolio')
        .select('*, client:clients(name, email, phone, company), salesperson:salespeople!client_portfolio_salesperson_id_fkey(name)');
      
      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }
      
      const { data } = await query;
      return (data || []) as unknown as ClientPortfolioItem[];
    },
  });

  return { data, isLoading };
};

export const useUpdatePortfolioStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ portfolioId, status, lastPurchaseDate }: { portfolioId: string; status: string; lastPurchaseDate?: string }) => {
      const updates: Record<string, string> = { status };
      if (lastPurchaseDate) updates.last_purchase_date = lastPurchaseDate;
      const { error } = await supabase.from('client_portfolio').update(updates).eq('id', portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      toast.success('Status atualizado!');
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};

export const useRemoveFromPortfolio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase.from('client_portfolio').delete().eq('id', portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      toast.success('Cliente removido do portfólio!');
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};

export interface PortfolioStats {
  total: number;
  active: number;
  inactive: number;
  unassigned: number;
  // Aliases for component compatibility
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalValue: number;
  icpMatch: number;
  icpPartial: number;
  icpNone: number;
}

export const usePortfolioStats = (salespersonId?: string) => {
  const { data: portfolio } = useClientPortfolio(salespersonId);
  const { data: unassigned } = useUnassignedClients();

  const total = portfolio?.length || 0;
  const active = portfolio?.filter(p => p.status === 'active').length || 0;
  const inactive = portfolio?.filter(p => p.status === 'inactive').length || 0;
  const unassignedCount = unassigned?.length || 0;

  const stats: PortfolioStats = {
    total,
    active,
    inactive,
    unassigned: unassignedCount,
    totalClients: total,
    activeClients: active,
    inactiveClients: inactive,
    totalValue: 0,
    icpMatch: 0,
    icpPartial: 0,
    icpNone: 0,
  };

  return { data: stats, isLoading: false };
};

export const useUnassignedClients = () => {
  return useQuery({
    queryKey: ['unassigned_clients'],
    queryFn: async () => {
      const { data: assigned } = await supabase.from('client_portfolio').select('client_id');
      const assignedIds = (assigned || []).map(a => a.client_id);
      
      let query = supabase.from('clients').select('*');
      if (assignedIds.length > 0) {
        query = query.not('id', 'in', `(${assignedIds.join(',')})`);
      }
      const { data } = await query;
      return data || [];
    },
  });
};

export const useAssignClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, salespersonId, source }: { clientId: string; salespersonId: string; source?: string }) => {
      const { error } = await supabase.from('client_portfolio').insert({
        client_id: clientId,
        salesperson_id: salespersonId,
        source: source || 'manual',
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] });
      toast.success('Cliente atribuído com sucesso!');
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};
