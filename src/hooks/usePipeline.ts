import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

// Pipeline stage type for the kanban board
export type PipelineStageId = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'closed';

export interface PipelineStageConfig {
  id: PipelineStageId;
  label: string;
  color: string;
  order: number;
  probability: number;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'lead', label: 'Lead', color: 'bg-blue-500', order: 1, probability: 10 },
  { id: 'qualified', label: 'Qualificado', color: 'bg-yellow-500', order: 2, probability: 25 },
  { id: 'proposal', label: 'Proposta', color: 'bg-orange-500', order: 3, probability: 50 },
  { id: 'negotiation', label: 'Negociação', color: 'bg-purple-500', order: 4, probability: 75 },
  { id: 'won', label: 'Ganho', color: 'bg-green-500', order: 5, probability: 100 },
  { id: 'lost', label: 'Perdido', color: 'bg-red-500', order: 6, probability: 0 },
  { id: 'closed', label: 'Arquivado', color: 'bg-gray-500', order: 7, probability: 0 },
];

// Deal type for pipeline board
export interface Deal {
  id: string;
  client_id: string | null;
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

export const usePipelineDeals = (filters?: { salespersonId?: string }) => {
  return useQuery<Record<PipelineStageId, Deal[]>>({
    queryKey: ['pipeline-deals', filters],
    queryFn: async (): Promise<Record<PipelineStageId, Deal[]>> => {
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group deals by status
      const dealsByStage: Record<PipelineStageId, Deal[]> = {
        lead: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: [],
        closed: [],
      };
      
      (data || []).forEach((sale) => {
        const status = sale.status as PipelineStageId;
        if (dealsByStage[status]) {
          dealsByStage[status].push(sale as Deal);
        } else {
          // Default to 'lead' if status doesn't match
          dealsByStage.lead.push(sale as Deal);
        }
      });
      
      return dealsByStage;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useMoveDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: PipelineStageId }) => {
      const { data, error } = await supabase
        .from('sales')
        .update({ status: newStage, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    // Optimistic update for smooth drag & drop
    onMutate: async ({ dealId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline-deals'] });
      const previousDeals = queryClient.getQueryData<Record<PipelineStageId, Deal[]>>(['pipeline-deals']);
      
      if (previousDeals) {
        const newDeals = { ...previousDeals };
        let movedDeal: Deal | undefined;
        
        // Find and remove deal from its current stage
        for (const stageId of Object.keys(newDeals) as PipelineStageId[]) {
          const dealIndex = newDeals[stageId].findIndex(d => d.id === dealId);
          if (dealIndex !== -1) {
            [movedDeal] = newDeals[stageId].splice(dealIndex, 1);
            break;
          }
        }
        
        // Add deal to new stage
        if (movedDeal) {
          movedDeal.status = newStage;
          newDeals[newStage] = [movedDeal, ...newDeals[newStage]];
        }
        
        queryClient.setQueryData(['pipeline-deals'], newDeals);
      }
      
      return { previousDeals };
    },
    onSuccess: (_data, { newStage }) => {
      const stageLabel = PIPELINE_STAGES.find(s => s.id === newStage)?.label || newStage;
      toast.success(`Deal movido para ${stageLabel}`);
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['pipeline-deals'], context?.previousDeals);
      toast.error('Erro ao mover deal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
