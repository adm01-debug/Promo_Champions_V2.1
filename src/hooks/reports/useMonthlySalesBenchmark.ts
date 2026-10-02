/**
 * Benchmark mensal de vendas (agregado por vendedor/mês) via RPC
 * get_monthly_sales_benchmark. Usado pela página de benchmark histórico.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMonthlySalesBenchmark(monthsBack = 24) {
  return useQuery({
    queryKey: ['historical-benchmark-agg', monthsBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_sales_benchmark', {
        months_back: monthsBack,
      });
      if (error) throw error;
      return data || [];
    },
  });
}
