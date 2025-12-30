import { Client } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Re-export Client type for convenience
export type { Client } from '@/types';

interface UseClientsOptions {
  segment?: string;
}

export const useClients = (filters?: UseClientsOptions) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase.from('clients').select('*');

      if (filters?.segment) {
        query = query.eq('segment', filters.segment);
      }

      return fetchWithErrorHandling<Client[]>(query);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
    }) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
