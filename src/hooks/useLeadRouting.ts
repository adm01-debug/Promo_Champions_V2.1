// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type RoutingStrategy = 'round-robin' | 'load-based' | 'territory' | 'expertise';

export const useLeadRouting = (strategy: RoutingStrategy = 'round-robin') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data: salespeople } = await supabase
        .from('users')
        .select('id, full_name, territory, expertise, active_deals:deals(count)')
        .eq('role', 'salesperson')
        .eq('active', true);

      if (!salespeople || salespeople.length === 0) {
        throw new Error('No available salespeople');
      }

      let assignedTo: string;

      switch (strategy) {
        case 'round-robin':
          assignedTo = getRoundRobinSalesperson(salespeople);
          break;
        case 'load-based':
          assignedTo = getLoadBasedSalesperson(salespeople);
          break;
        default:
          assignedTo = salespeople[0].id;
      }

      const { error } = await supabase
        .from('clients')
        .update({ assigned_to: assignedTo })
        .eq('id', leadId);

      if (error) throw error;

      return { assignedTo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

function getRoundRobinSalesperson(salespeople: any[]): string {
  const lastAssigned = parseInt(localStorage.getItem('lastAssignedIndex') || '0');
  const nextIndex = (lastAssigned + 1) % salespeople.length;
  localStorage.setItem('lastAssignedIndex', nextIndex.toString());
  return salespeople[nextIndex].id;
}

function getLoadBasedSalesperson(salespeople: any[]): string {
  return salespeople.reduce((min, person) =>
    person.active_deals[0].count < min.active_deals[0].count ? person : min
  ).id;
}

export const useSalespersonPerformance = () => {
  return useQuery({
    queryKey: ['salesperson_performance'],
    queryFn: async () => {
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id, name, is_active')
        .eq('is_active', true);

      if (!salespeople) return [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const results = await Promise.all(
        salespeople.map(async (sp) => {
          const { data: sales } = await supabase
            .from('sales')
            .select('amount')
            .eq('salesperson_id', sp.id)
            .gte('created_at', startOfMonth);

          const { count } = await supabase
            .from('client_portfolio')
            .select('*', { count: 'exact', head: true })
            .eq('salesperson_id', sp.id)
            .eq('status', 'active');

          return {
            id: sp.id,
            name: sp.name,
            totalSales: (sales || []).reduce((sum, s) => sum + s.amount, 0),
            activeClientsCount: count || 0,
          };
        })
      );

      return results.sort((a, b) => b.totalSales - a.totalSales);
    },
  });
};

export const useAutoRouteToTopPerformer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id')
        .eq('is_active', true);
      if (!salespeople?.length) throw new Error('Nenhum vendedor disponível');
      const topId = salespeople[0].id;
      const { error } = await supabase.from('client_portfolio').insert({
        client_id: clientId,
        salesperson_id: topId,
        source: 'auto_top_performer',
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] });
    },
  });
};

export const useRoundRobinRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id')
        .eq('is_active', true);
      if (!salespeople?.length) throw new Error('Nenhum vendedor disponível');
      const lastIdx = parseInt(localStorage.getItem('lastAssignedIndex') || '0');
      const nextIdx = (lastIdx + 1) % salespeople.length;
      localStorage.setItem('lastAssignedIndex', nextIdx.toString());
      const { error } = await supabase.from('client_portfolio').insert({
        client_id: clientId,
        salesperson_id: salespeople[nextIdx].id,
        source: 'round_robin',
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] });
    },
  });
};

export const useRouteLeadManually = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, toSalespersonId, reason }: { clientId: string; toSalespersonId: string; reason?: string }) => {
      const { error } = await supabase.from('client_portfolio').insert({
        client_id: clientId,
        salesperson_id: toSalespersonId,
        source: 'manual',
        status: 'active',
      });
      if (error) throw error;
      await supabase.from('lead_routing_log').insert({
        client_id: clientId,
        to_salesperson_id: toSalespersonId,
        routing_reason: reason || 'Atribuição manual',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] });
    },
  });
};
