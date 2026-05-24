import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientAffinity = (clientId?: string) => {
  return useQuery({
    queryKey: ['bi-tool-affinity', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data: clientProducts } = await supabase.rpc('get_client_top_products', { 
        _client_id: clientId!, 
        _limit: 5 
      });

      return {
        topCategories: ['Eletrônicos', 'Periféricos', 'Office'],
        suggestedProducts: (clientProducts || []).length 
          ? (clientProducts as any[]).map((p: any) => ({ name: p.product_name, confidence: 90 }))
          : [
              { name: 'Monitor 4K UltraWide', confidence: 94 },
              { name: 'Teclado Mecânico RGB', confidence: 88 },
            ]
      };
    }
  });
};
