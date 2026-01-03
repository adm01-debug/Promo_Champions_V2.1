import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getTable = (tableName: string) => {
  return (supabase as any).from(tableName);
};

export function useBuscaFulltext<T>(
  tabela: string,
  searchTerm: string,
  colunas: string[] = ['*']
) {
  return useQuery({
    queryKey: ['fulltext', tabela, searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      
      const { data, error } = await getTable(tabela)
        .select(colunas.join(','))
        .or(
          colunas
            .filter(col => col !== '*')
            .map(col => `${col}.ilike.%${searchTerm}%`)
            .join(',')
        );
      
      if (error) throw error;
      return data as T[];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5000,
    gcTime: 60000,
  });
}
