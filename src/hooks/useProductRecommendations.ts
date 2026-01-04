import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductRecommendations = (clientId: string) => {
  return useQuery({
    queryKey: ['productRecommendations', clientId],
    queryFn: async () => {
      // Get client's past purchases
      const { data: pastDeals, error: dealsError } = await supabase
        .from('deals')
        .select('products(*)')
        .eq('client_id', clientId)
        .eq('status', 'won');
      
      if (dealsError) throw dealsError;
      
      const purchasedProductIds = pastDeals
        .flatMap(d => d.products || [])
        .map(p => p.id);
      
      // Get client industry
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('industry')
        .eq('id', clientId)
        .single();
      
      if (clientError) throw clientError;
      
      // Recommend complementary products
      const { data: recommendations, error: recsError } = await supabase
        .from('products')
        .select('*')
        .not('id', 'in', `(${purchasedProductIds.join(',')})`)
        .contains('tags', [client.industry])
        .limit(5);
      
      if (recsError) throw recsError;
      
      return recommendations;
    },
  });
};
