import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Sale {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  salesperson_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateSaleStatusParams {
  saleId: string;
  newStatus: string;
  previousStatus: string;
}

export function useOptimisticPipelineUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ saleId, newStatus }: UpdateSaleStatusParams) => {
      const { data, error } = await supabase
        .from('sales')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', saleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ saleId, newStatus, previousStatus }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['pipeline'] });
      await queryClient.cancelQueries({ queryKey: ['sales'] });

      // Snapshot do estado anterior
      const previousPipeline = queryClient.getQueryData<Sale[]>(['pipeline']);
      const previousSales = queryClient.getQueryData<Sale[]>(['sales']);

      // Atualização otimista
      const updateSales = (sales: Sale[] | undefined) => {
        if (!sales) return sales;
        return sales.map(sale =>
          sale.id === saleId ? { ...sale, status: newStatus } : sale
        );
      };

      queryClient.setQueryData<Sale[]>(['pipeline'], updateSales);
      queryClient.setQueryData<Sale[]>(['sales'], updateSales);

      // Retornar contexto para rollback
      return { previousPipeline, previousSales, saleId, previousStatus };
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousPipeline) {
        queryClient.setQueryData(['pipeline'], context.previousPipeline);
      }
      if (context?.previousSales) {
        queryClient.setQueryData(['sales'], context.previousSales);
      }
      toast.error('Erro ao atualizar status do deal');
      console.error('Pipeline update error:', error);
    },
    onSuccess: (data, variables) => {
      toast.success(`Deal movido para ${variables.newStatus}`);
    },
    onSettled: () => {
      // Revalidar para garantir consistência
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-velocity'] });
    },
  });
}

// Helper para mover deals entre colunas do pipeline
export function usePipelineDragDrop() {
  const mutation = useOptimisticPipelineUpdate();

  const moveDeal = (
    saleId: string,
    fromStatus: string,
    toStatus: string
  ) => {
    if (fromStatus === toStatus) return;

    mutation.mutate({
      saleId,
      newStatus: toStatus,
      previousStatus: fromStatus,
    });
  };

  return {
    moveDeal,
    isMoving: mutation.isPending,
    error: mutation.error,
  };
}
