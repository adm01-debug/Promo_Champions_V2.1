import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type RoutingStrategy = 'round-robin' | 'load-based' | 'territory' | 'expertise';
type ServerRoutingStrategy = 'manual' | 'round_robin' | 'least_loaded' | 'top_performer';

interface PortfolioRoutingResult {
  assigned_to: string;
  portfolio_id: string;
  strategy_used: string;
}

function toServerStrategy(strategy: RoutingStrategy): ServerRoutingStrategy {
  switch (strategy) {
    case 'round-robin':
      return 'round_robin';
    case 'load-based':
      return 'least_loaded';
    default:
      throw new Error(
        `A estratégia "${strategy}" ainda não possui contrato de roteamento no servidor.`
      );
  }
}

async function routeClientPortfolio({
  clientId,
  strategy,
  salespersonId,
  reason,
}: {
  clientId: string;
  strategy: ServerRoutingStrategy;
  salespersonId?: string;
  reason?: string;
}): Promise<PortfolioRoutingResult> {
  const { data, error } = await supabase.rpc('route_unassigned_client_portfolio', {
    p_client_id: clientId,
    p_strategy: strategy,
    ...(salespersonId !== undefined && { p_salesperson_id: salespersonId }),
    ...(reason !== undefined && { p_reason: reason }),
  });

  if (error) throw error;

  const routing = data?.[0];
  if (!routing) {
    throw new Error('O servidor não retornou o resultado do roteamento.');
  }

  return routing;
}

function invalidateRoutingQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['clients'] });
  queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
  queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] });
  queryClient.invalidateQueries({ queryKey: ['routing_history'] });
  queryClient.invalidateQueries({ queryKey: ['salesperson_performance'] });
}

export const useLeadRouting = (strategy: RoutingStrategy = 'round-robin') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const routing = await routeClientPortfolio({
        clientId: leadId,
        strategy: toServerStrategy(strategy),
        reason: `Roteamento automático: ${strategy}`,
      });

      return { assignedTo: routing.assigned_to };
    },
    onSuccess: () => {
      invalidateRoutingQueries(queryClient);
    },
  });
};

export const useRoutingHistory = () => {
  return useQuery({
    queryKey: ['routing_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_routing_log')
        .select(
          '*, client:clients(name, company), from_salesperson:salespeople!lead_routing_log_from_salesperson_id_fkey(name), to_salesperson:salespeople!lead_routing_log_to_salesperson_id_fkey(name)'
        )
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
};

export const useSalespersonPerformance = () => {
  return useQuery({
    queryKey: ['salesperson_performance'],
    queryFn: async () => {
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id, name, is_active')
        .eq('is_active', true)
        .in('role', ['closer', 'hybrid']);

      if (!salespeople) return [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const results = await Promise.all(
        salespeople.map(async sp => {
          const { data: sales } = await supabase
            .from('sales')
            .select('amount')
            .eq('salesperson_id', sp.id)
            .in('status', ['won', 'completed'])
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

      return results.sort(
        (a, b) => b.totalSales - a.totalSales || a.id.localeCompare(b.id)
      );
    },
  });
};

export const useAutoRouteToTopPerformer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      return await routeClientPortfolio({
        clientId,
        strategy: 'top_performer',
        reason: 'Roteamento automático para melhor desempenho',
      });
    },
    onSuccess: () => {
      invalidateRoutingQueries(queryClient);
    },
  });
};

export const useRoundRobinRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      return await routeClientPortfolio({
        clientId,
        strategy: 'round_robin',
        reason: 'Roteamento automático round-robin',
      });
    },
    onSuccess: () => {
      invalidateRoutingQueries(queryClient);
    },
  });
};

export const useRouteLeadManually = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clientId,
      toSalespersonId,
      reason,
    }: {
      clientId: string;
      toSalespersonId: string;
      reason?: string;
    }) => {
      return await routeClientPortfolio({
        clientId,
        strategy: 'manual',
        salespersonId: toSalespersonId,
        reason: reason || 'Atribuição manual',
      });
    },
    onSuccess: () => {
      invalidateRoutingQueries(queryClient);
    },
  });
};
