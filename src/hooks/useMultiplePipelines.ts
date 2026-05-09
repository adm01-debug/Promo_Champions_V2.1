import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

export interface PipelineConfig {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export interface PipelineStageConfig {
  id: string;
  pipeline_id: string;
  name: string;
  label: string;
  color: string;
  stage_order: number;
  probability: number;
  is_final: boolean;
}

export const usePipelines = () => {
  return useQuery<PipelineConfig[]>({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return (data || []) as unknown as PipelineConfig[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const usePipelineStages = (pipelineId: string | null) => {
  return useQuery<PipelineStageConfig[]>({
    queryKey: ['pipeline-stages', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('stage_order');
      if (error) throw error;
      return (data || []) as unknown as PipelineStageConfig[];
    },
    enabled: !!pipelineId,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export interface PipelineDeal {
  id: string;
  client_id: string | null;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  salesperson_id: string | null;
  source: string | null;
  pipeline_id: string | null;
  created_at: string;
  updated_at: string;
}

export const usePipelineDealsByPipeline = (pipelineId: string | null, stages: PipelineStageConfig[]) => {
  return useQuery<Record<string, PipelineDeal[]>>({
    queryKey: ['pipeline-deals-multi', pipelineId],
    queryFn: async () => {
      if (!pipelineId || stages.length === 0) return {};

      const stageNames = stages.map(s => s.name);
      
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      // For the default "Vendas" pipeline, include deals without pipeline_id
      if (pipelineId === '00000000-0000-0000-0000-000000000001') {
        query = query.or(`pipeline_id.eq.${pipelineId},pipeline_id.is.null`);
      } else {
        query = query.eq('pipeline_id', pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const grouped: Record<string, PipelineDeal[]> = {};
      stages.forEach(s => { grouped[s.name] = []; });

      (data || []).forEach((sale) => {
        const status = sale.status as string;
        if (grouped[status]) {
          grouped[status].push(sale as unknown as PipelineDeal);
        } else {
          // Default to first stage
          const firstStage = stages[0]?.name;
          if (firstStage && grouped[firstStage]) {
            grouped[firstStage].push(sale as unknown as PipelineDeal);
          }
        }
      });

      return grouped;
    },
    enabled: !!pipelineId && stages.length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useMoveDealMultiPipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, newStage, pipelineId }: { dealId: string; newStage: string; pipelineId: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update({ status: newStage, pipeline_id: pipelineId, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { newStage }) => {
      toast.success(`Deal movido para ${newStage}`);
    },
    onError: () => {
      toast.error('Erro ao mover deal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals-multi'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
