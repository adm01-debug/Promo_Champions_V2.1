import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';
import {
  OptimisticLockConflictError,
  isOptimisticLockConflict,
} from '@/lib/supabase/optimisticLock';

// Pipeline stage type for the kanban board
export type PipelineStageId =
  'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'closed';

export interface PipelineStageConfig {
  id: PipelineStageId;
  label: string;
  color: string;
  order: number;
  probability: number;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: 'lead',
    label: 'Ativação (SDR)',
    color: 'bg-blue-500',
    order: 1,
    probability: 10,
  },
  {
    id: 'qualified',
    label: 'Qualificado',
    color: 'bg-yellow-500',
    order: 2,
    probability: 25,
  },
  {
    id: 'proposal',
    label: 'Proposta',
    color: 'bg-orange-500',
    order: 3,
    probability: 50,
  },
  {
    id: 'negotiation',
    label: 'Negociação',
    color: 'bg-purple-500',
    order: 4,
    probability: 75,
  },
  {
    id: 'won',
    label: 'Venda Concluída',
    color: 'bg-green-500',
    order: 5,
    probability: 100,
  },
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
  sdr_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  /** Optimistic locking — presente após migration 20261001193200. */
  version?: number;
  closing_date?: string; // Etapa 3: Predictive utility
  health_score?: number; // Etapa 2: Heatmap
  interaction_history?: number[]; // Etapa 4: Sparklines
}

// Status reais de `sales` (CHECK sales_status_check) que não têm coluna
// própria no board padrão. Sem este mapa, `completed` (venda concluída pelo
// cadastro manual) e `cancelled` caíam na coluna "Ativação (SDR)".
// `pending`/`prospecting` são estágios abertos iniciais (OPEN_SALE_STATUSES,
// probabilidade 0.10/0.15 em stage_probabilities) → primeira coluna.
const SALE_STATUS_TO_STAGE: Record<string, PipelineStageId> = {
  completed: 'won',
  cancelled: 'lost',
  pending: 'lead',
  prospecting: 'lead',
};

const PIPELINE_STAGE_IDS = new Set<string>(PIPELINE_STAGES.map(s => s.id));

/** Coluna do board padrão para um status de `sales`. */
export const saleStatusToStage = (status: string | null | undefined): PipelineStageId => {
  if (status && PIPELINE_STAGE_IDS.has(status)) return status as PipelineStageId;
  return (status && SALE_STATUS_TO_STAGE[status]) || 'lead';
};

export const usePipelineDeals = (filters?: { salespersonId?: string }) => {
  return useQuery<Record<PipelineStageId, Deal[]>>({
    queryKey: ['pipeline-deals', filters],
    queryFn: async (): Promise<Record<PipelineStageId, Deal[]>> => {
      let query = supabase
        .from('sales')
        .select('*')
        .is('deleted_at', null)
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

      (data || []).forEach(sale => {
        dealsByStage[saleStatusToStage(sale.status)].push(sale as Deal);
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
    mutationFn: async ({
      dealId,
      newStage,
      expectedVersion,
    }: {
      dealId: string;
      newStage: PipelineStageId;
      /** Versão lida do deal (optimistic locking) — quando presente, exige casar. */
      expectedVersion?: number;
    }) => {
      // Transição via RPC da máquina de estados (valida status_origem -> destino);
      // p_expected_version aplica optimistic locking quando informado.
      const { error } = await supabase.rpc(
        'transition_sale_status' as never,
        {
          p_sale_id: dealId,
          p_new_status: newStage,
          p_expected_version: expectedVersion ?? null,
        } as never
      );
      if (error) {
        if (
          typeof error.message === 'string' &&
          error.message.includes('optimistic_lock_conflict')
        ) {
          throw new OptimisticLockConflictError();
        }
        throw error;
      }
      return { id: dealId, status: newStage };
    },
    // Optimistic update for smooth drag & drop
    onMutate: async ({ dealId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline-deals'] });
      const previousDeals = queryClient.getQueryData<Record<PipelineStageId, Deal[]>>([
        'pipeline-deals',
      ]);

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
    onError: (err, _vars, context) => {
      queryClient.setQueryData(['pipeline-deals'], context?.previousDeals);
      if (isOptimisticLockConflict(err)) {
        toast.warning('Registro alterado por outro usuário — dados atualizados');
      } else {
        toast.error('Erro ao mover deal');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
