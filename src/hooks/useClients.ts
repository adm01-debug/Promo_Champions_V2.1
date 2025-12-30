import { Client } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Re-export Client type for convenience
export type { Client } from '@/types';

export interface UseClientsOptions {
  segment?: string;
}

export const useClients = (filters?: UseClientsOptions) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase.from('clients').select('*');

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Client[];
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
    mutationFn: async ({ id, name, email, phone, company, total_value }: {
      id: string;
      name?: string;
      email?: string | null;
      phone?: string | null;
      company?: string | null;
      total_value?: number;
    }) => {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (company !== undefined) updates.company = company;
      if (total_value !== undefined) updates.total_value = total_value;

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

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
