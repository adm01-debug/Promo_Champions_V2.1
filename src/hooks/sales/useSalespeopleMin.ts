import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalespersonMin {
  id: string;
  name: string;
}

export function useSalespeopleMin() {
  return useQuery<SalespersonMin[]>({
    queryKey: ['salespeople-min'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespeople_public')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data || []).filter((s): s is SalespersonMin => !!s.id && !!s.name);
    },
    staleTime: 10 * 60 * 1000,
  });
}
