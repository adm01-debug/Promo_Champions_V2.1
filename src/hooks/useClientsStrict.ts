import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  website?: string;
  address?: string;
  status: 'lead' | 'qualified' | 'customer' | 'inactive';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useClients = (status?: Client['status']) => {
  return useQuery<Client[], Error>({
    queryKey: ['clients', status],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Client[];
    },
  });
};

export const useClient = (id: string) => {
  return useQuery<Client, Error>({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Client, Error, Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: async (client) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Client, Error, { id: string; updates: Partial<Client> }>({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.id] });
    },
  });
};
