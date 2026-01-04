import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  client_id: string;
  owner_id: string;
  probability: number;
  expected_close_date: string;
  created_at: string;
  updated_at: string;
}

export const usePipeline = () => {
  return useQuery<PipelineStage[], Error>({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data as PipelineStage[];
    },
  });
};

export const useDealsByStage = (stageId: string) => {
  return useQuery<Deal[], Error>({
    queryKey: ['deals', 'stage', stageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
  });
};

export const useMoveDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Deal, Error, { dealId: string; stageId: string }>({
    mutationFn: async ({ dealId, stageId }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
};
