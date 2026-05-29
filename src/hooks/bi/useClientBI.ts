import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getExpertRecommendations } from "@/lib/bi/industryRecommendations";
import { MOCK_CLIENT_STATS, getMockIndustryTrends, getMockSeasonality } from "@/lib/bi/mockData";

export const useClientBI = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['bi-tool-client', clientId, ramoAtividade],
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");

      // Parallel fetch from RPCs
      const [
        { data: clientProductsRes },
        { data: clientSeasonalityRes }
      ] = await Promise.all([
        supabase.rpc('get_client_top_products', { _client_id: clientId, _limit: 5 }),
        supabase.rpc('get_client_seasonality', { _client_id: clientId, _months: 24 })
      ]);

      const clientProducts = (clientProductsRes || []) as any[];
      const clientSeasonality = (clientSeasonalityRes || []) as any[];
      const hasEnoughData = clientSeasonality.length >= 3;
      const finalSeasonality = hasEnoughData ? clientSeasonality : getMockSeasonality(clientId);

      return {
        isMocked: !hasEnoughData,
        customer360: {
          ltv: finalSeasonality.reduce((acc, curr) => acc + Number(curr.total_revenue), 0),
          avgTicket: finalSeasonality.length 
            ? finalSeasonality.reduce((acc, curr) => acc + Number(curr.avg_ticket), 0) / finalSeasonality.length
            : MOCK_CLIENT_STATS.avgTicket,
          recency: MOCK_CLIENT_STATS.recency,
          orderCount: finalSeasonality.reduce((acc, curr) => acc + Number(curr.quotes_count), 0),
          lastOrders: MOCK_CLIENT_STATS.lastOrders
        },
        affinity: {
          topCategories: ['Eletrônicos', 'Periféricos', 'Office'],
          suggestedProducts: clientProducts.length 
            ? clientProducts.map((p: any) => ({ name: p.product_name, confidence: 90 }))
            : [
                { name: 'Monitor 4K UltraWide', confidence: 94 },
                { name: 'Teclado Mecânico RGB', confidence: 88 },
              ]
        },
        expertCurated: getExpertRecommendations(ramoAtividade || '')
      };
    }
  });
};
