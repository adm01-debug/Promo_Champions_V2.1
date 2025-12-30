import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pipeline, PipelineStage, Deal } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { CACHE_TIMES } from '@/constants';

// Re-export types for components
export type { Deal, PipelineStage } from '@/types';

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'lead', name: 'Lead', order: 1, probability: 10, pipeline_id: 'default', created_at: '' },
  { id: 'qualified', name: 'Qualificado', order: 2, probability: 25, pipeline_id: 'default', created_at: '' },
  { id: 'proposal', name: 'Proposta', order: 3, probability: 50, pipeline_id: 'default', created_at: '' },
  { id: 'negotiation', name: 'Negociação', order: 4, probability: 75, pipeline_id: 'default', created_at: '' },
  { id: 'closed', name: 'Fechado', order: 5, probability: 100, pipeline_id: 'default', created_at: '' },
];

export interface PipelineDeal {
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

export const usePipeline = () => {
  return useQuery<Pipeline[]>({
    queryKey: ['pipeline'],
    queryFn: async (): Promise<Pipeline[]> => {
      // Return default pipeline since no pipelines table exists
      return [{
        id: 'default',
        name: 'Pipeline Principal',
        description: 'Pipeline de vendas principal',
        stages: PIPELINE_STAGES,
        created_at: new Date().toISOString(),
      }];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const usePipelineDeals = (filters?: { salespersonId?: string }) => {
  return useQuery<PipelineDeal[]>({
    queryKey: ['pipeline-deals', filters],
    queryFn: async (): Promise<PipelineDeal[]> => {
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []) as PipelineDeal[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useMoveDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dealId, newStatus }: { dealId: string; newStatus: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
