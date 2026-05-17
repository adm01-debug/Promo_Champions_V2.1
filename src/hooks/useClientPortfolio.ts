import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TableUpdate } from '@/lib/supabase/typed-payloads';

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
  client?: { 
    name: string; 
    email?: string; 
    phone?: string; 
    company?: string; 
    total_value?: number;
    is_activated?: boolean;
    activated_at?: string;
  };
  salesperson?: { name: string };
}

export const useClientPortfolio = (salespersonId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['client_portfolio', salespersonId],
    queryFn: async () => {
      let query = supabase
        .from('client_portfolio')
        .select('*, client:clients(name, email, phone, company, total_value, is_activated, activated_at), salesperson:salespeople!client_portfolio_salesperson_id_fkey(name)');

      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ClientPortfolioItem[];
    },
  });

  return { data, isLoading };
};

export const useUpdatePortfolioStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ portfolioId, status, lastPurchaseDate }: { portfolioId: string; status: string; lastPurchaseDate?: string }) => {
      const updates: TableUpdate<'client_portfolio'> = { status };
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
  activatedCount: number;
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
  const { data: portfolio, isLoading: isPortfolioLoading } = useClientPortfolio(salespersonId);
  const { data: unassigned, isLoading: isUnassignedLoading } = useUnassignedClients();

  const clientIds = (portfolio || []).map((item) => item.client_id);

  const { data: icpRows = [], isLoading: isIcpLoading } = useQuery({
    queryKey: ['portfolio-icp-stats', clientIds],
    queryFn: async () => {
      if (clientIds.length === 0) return [] as Array<{ client_id: string; is_icp_match: boolean | null }>;

      const { data, error } = await supabase
        .from('icp_data')
        .select('client_id, is_icp_match')
        .in('client_id', clientIds);

      if (error) throw error;
      return (data || []) as Array<{ client_id: string; is_icp_match: boolean | null }>;
    },
    enabled: clientIds.length > 0,
  });

  const total = portfolio?.length || 0;
  const active = portfolio?.filter((p) => p.status === 'active').length || 0;
  const inactive = portfolio?.filter((p) => p.status === 'inactive').length || 0;
  const activatedCount = portfolio?.filter((p) => p.client?.is_activated).length || 0;
  const unassignedCount = unassigned?.length || 0;

  const totalValue = (portfolio || []).reduce((sum, item) => sum + (item.client?.total_value || 0), 0);

  const icpMap = new Map(icpRows.map((row) => [row.client_id, row]));
  const icpMatch = clientIds.filter((id) => icpMap.get(id)?.is_icp_match === true).length;
  const icpPartial = clientIds.filter((id) => icpMap.has(id) && icpMap.get(id)?.is_icp_match !== true).length;
  const icpNone = total - (icpMatch + icpPartial);

  const stats: PortfolioStats = {
    total,
    active,
    inactive,
    unassigned: unassignedCount,
    totalClients: total,
    activeClients: active,
    inactiveClients: inactive,
    totalValue,
    icpMatch,
    icpPartial,
    icpNone,
  };

  return {
    data: stats,
    isLoading: isPortfolioLoading || isUnassignedLoading || (clientIds.length > 0 && isIcpLoading),
  };
};

export const useUnassignedClients = () => {
  return useQuery({
    queryKey: ['unassigned_clients'],
    queryFn: async () => {
      const { data: assigned, error: assignedError } = await supabase.from('client_portfolio').select('client_id');
      if (assignedError) throw assignedError;

      const assignedIds = (assigned || []).map((a) => a.client_id).filter(Boolean);

      let query = supabase.from('clients').select('*');
      if (assignedIds.length > 0) {
        const inFilter = `(${assignedIds.map((id) => `"${id}"`).join(',')})`;
        query = query.not('id', 'in', inFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
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
