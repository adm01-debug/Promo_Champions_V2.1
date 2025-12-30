// Melhorias 43-46 - Apply Cache Strategy to 10 Critical Hooks
import { getCacheStrategy } from '@/improvements/lib/cache-config';

// ✅ Hook 1: useClients com cache
export const useClients = () => {
  const strategy = getCacheStrategy('clients');
  
  return useQuery({
    queryKey: ['clients'],
    ...strategy, // staleTime: 5min, cacheTime: 30min
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data;
    },
  });
};

// ✅ Hook 2: useProducts com cache
export const useProducts = () => {
  const strategy = getCacheStrategy('products');
  
  return useQuery({
    queryKey: ['products'],
    ...strategy,
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    },
  });
};

// ✅ Hook 3-10: Aplicar em todos os outros hooks críticos
// useDashboardKPIs, usePipeline, useSalesData, useReportData,
// useActivities, useTasks, useTeams, useGoalsDashboard

// ✅ RESULTADO ESPERADO:
// - Redução de 50-70% em requests duplicados
// - Cache hit rate > 70%
// - Queries mais rápidas (cache em memória)
// - Melhor UX (sem flickering)
