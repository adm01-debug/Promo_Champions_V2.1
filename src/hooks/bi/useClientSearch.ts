import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientSearch = (query: string) => {
  return useQuery({
    queryKey: ['bi-client-search', query],
    enabled: true, // Allow fetching even with empty query for initial list
    queryFn: async () => {
      let queryBuilder = supabase
        .from('clients')
        .select('id, name, ramo_atividade');
        
      if (query.length >= 2) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }
      
      const { data, error } = await queryBuilder.limit(10);
      
      if (error) throw error;
      return data;
    }
  });
};
