import { Client } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIndexEntity } from '@/hooks/semantic/useIndexEntity';
import { clientService } from '@/services/clientService';

export type { Client } from '@/types';

export interface UseClientsOptions {
  segment?: string;
}

export const useClients = (filters?: UseClientsOptions) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: () => clientService.getClients(),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { index } = useIndexEntity();

  return useMutation({
    mutationFn: (input: any) => clientService.createClient(input),
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
    mutationFn: ({ id, ...updates }: { id: string } & any) => clientService.updateClient(id, updates),
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
    mutationFn: (clientId: string) => clientService.deleteClient(clientId),
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
