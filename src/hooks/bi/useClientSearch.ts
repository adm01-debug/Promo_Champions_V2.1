import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientSearch = (query: string) => {
  return useQuery({
    queryKey: ['bi-client-search', query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, ramo_atividade')
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });
};
