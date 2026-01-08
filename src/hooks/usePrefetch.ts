import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for intelligent data prefetching
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchDeal = (dealId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['deal', dealId],
      queryFn: async () => {
        const { data } = await supabase
          .from('deals')
          .select('*, client:clients(*), activities(*)')
          .eq('id', dealId)
          .single();
        return data;
      },
    });
  };

  const prefetchClient = (clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['client', clientId],
      queryFn: async () => {
        const { data } = await supabase
          .from('clients')
          .select('*, deals(*), activities(*)')
          .eq('id', clientId)
          .single();
        return data;
      },
    });
  };

  const prefetchPipeline = () => {
    queryClient.prefetchQuery({
      queryKey: ['pipeline'],
      queryFn: async () => {
        const { data } = await supabase
          .from('deals')
          .select('*, client:clients(name, company)')
          .order('created_at', { ascending: false });
        return data;
      },
    });
  };

  const prefetchDashboard = () => {
    // Prefetch all dashboard data
    queryClient.prefetchQuery({
      queryKey: ['dashboard-stats'],
      queryFn: async () => {
        const { data } = await supabase.rpc('get_dashboard_stats');
        return data;
      },
    });

    queryClient.prefetchQuery({
      queryKey: ['recent-activities'],
      queryFn: async () => {
        const { data } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        return data;
      },
    });
  };

  const prefetchForRoute = (route: string) => {
    // Prefetch based on route
    switch (route) {
      case '/':
      case '/dashboard':
        prefetchDashboard();
        break;
      case '/pipeline':
        prefetchPipeline();
        break;
      default:
        break;
    }
  };

  return {
    prefetchDeal,
    prefetchClient,
    prefetchPipeline,
    prefetchDashboard,
    prefetchForRoute,
  };
};

/**
 * Prefetch on hover
 */
export const usePrefetchOnHover = () => {
  const { prefetchDeal, prefetchClient } = usePrefetch();

  const handleDealHover = (dealId: string) => {
    prefetchDeal(dealId);
  };

  const handleClientHover = (clientId: string) => {
    prefetchClient(clientId);
  };

  return {
    onDealHover: handleDealHover,
    onClientHover: handleClientHover,
  };
};
