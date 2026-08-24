import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getExpertRecommendations } from '@/lib/bi/industryRecommendations';

export const useClientBI = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['bi-tool-client', clientId, ramoAtividade],
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');

      const [{ data: clientProductsRes }, { data: clientSeasonalityRes }] =
        await Promise.all([
          supabase.rpc('get_client_top_products', { _client_id: clientId, _limit: 5 }),
          supabase.rpc('get_client_seasonality', { _client_id: clientId, _months: 24 }),
        ]);

      type ClientProduct = { product_name: string };
      type ClientSeason = {
        total_revenue: number | string;
        avg_ticket: number | string;
        quotes_count: number | string;
        month?: number;
      };

      const clientProducts = (clientProductsRes ?? []) as ClientProduct[];
      const clientSeasonality = (clientSeasonalityRes ?? []) as ClientSeason[];

      return {
        hasData: clientSeasonality.length > 0,
        customer360: {
          ltv: clientSeasonality.reduce(
            (acc, curr) => acc + Number(curr.total_revenue),
            0
          ),
          avgTicket:
            clientSeasonality.length > 0
              ? clientSeasonality.reduce(
                  (acc, curr) => acc + Number(curr.avg_ticket),
                  0
                ) / clientSeasonality.length
              : 0,
          recency: 0,
          orderCount: clientSeasonality.reduce(
            (acc, curr) => acc + Number(curr.quotes_count),
            0
          ),
          lastOrders: [],
        },
        affinity: {
          topCategories: [],
          suggestedProducts: clientProducts.map((p) => ({
            name: p.product_name,
            confidence: 90,
          })),
        },
        expertCurated: getExpertRecommendations(ramoAtividade || ''),
      };
    },
  });
};