// Melhoria 2.2 - usePipeline.ts REFATORADO
// Remove TODOS os 'any' e adiciona tipos adequados

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ✅ TIPOS ADEQUADOS (substituem 'any')
interface MutationError {
  message: string;
  code?: string;
  details?: unknown;
  hint?: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  client_id: string;
  assigned_to: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UpdateDealData {
  stage_id?: string;
  status?: string;
  value?: number;
  assigned_to?: string;
  [key: string]: unknown;
}

interface OptimisticContext {
  previousDeals?: Deal[];
}

export const usePipeline = () => {
  const queryClient = useQueryClient();

  // Fetch deals
  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['pipeline-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
  });

  // Update deal mutation
  const updateDeal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDealData }) => {
      const { data: updated, error } = await supabase
        .from('deals')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated as Deal;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline-deals'] });
      
      const previousDeals = queryClient.getQueryData<Deal[]>(['pipeline-deals']);
      
      queryClient.setQueryData<Deal[]>(['pipeline-deals'], (old) => {
        if (!old) return [];
        return old.map((deal) =>
          deal.id === id ? { ...deal, ...data } : deal
        );
      });
      
      return { previousDeals } as OptimisticContext;
    },
    // ✅ ANTES: onError: (error: any, _variables, context) => {
    // ✅ DEPOIS: Tipo adequado MutationError
    onError: (error: MutationError, _variables, context: OptimisticContext | undefined) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(['pipeline-deals'], context.previousDeals);
      }
      toast({
        title: 'Erro ao atualizar deal',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      toast({
        title: 'Deal atualizado',
        description: 'As alterações foram salvas com sucesso',
      });
    },
  });

  return {
    deals: deals || [],
    isLoading,
    error,
    updateDeal: updateDeal.mutate,
    isUpdating: updateDeal.isPending,
  };
};
