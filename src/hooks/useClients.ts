import { Client } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIndexEntity } from '@/hooks/semantic/useIndexEntity';

// Re-export Client type for convenience
export type { Client } from '@/types';

export interface UseClientsOptions {
  segment?: string;
}

export const useClients = (filters?: UseClientsOptions) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: async (): Promise<Client[]> => {
      const query = supabase.from('clients').select('*');
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
  const { index } = useIndexEntity();

  return useMutation({
    mutationFn: async (input: { name: string; email?: string; phone?: string; company?: string; lead_source?: string; lat?: number; lng?: number; total_value?: number; user_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...input, user_id: input.user_id || user?.id };
      const { data, error } = await supabase.from('clients').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      if (data?.id) index('client', data.id);
      toast.success('Cliente criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar cliente'),
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { index } = useIndexEntity();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; email?: string | null; phone?: string | null; company?: string | null; total_value?: number; lead_source?: string | null; lat?: number | null; lng?: number | null }) => {
      const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previous = queryClient.getQueryData(['clients']);
      queryClient.setQueryData(['clients'], (old: Client[] | undefined) =>
        old?.map(c => c.id === newData.id ? { ...c, ...newData } : c)
      );
      return { previous };
    },
    onSuccess: (data, vars) => {
      const id = data?.id ?? vars.id;
      if (id) index('client', id);
      toast.success('Cliente atualizado!');
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['clients'], ctx?.previous);
      toast.error('Erro ao atualizar cliente');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
    },
    onMutate: async (clientId) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previous = queryClient.getQueryData(['clients']);
      queryClient.setQueryData(['clients'], (old: Client[] | undefined) => old?.filter(c => c.id !== clientId));
      return { previous };
    },
    onSuccess: () => toast.success('Cliente excluído'),
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['clients'], ctx?.previous);
      toast.error('Erro ao excluir cliente');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};
