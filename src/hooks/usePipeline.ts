import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInvalidateCache } from "@/hooks/useInvalidateCache";

export const PIPELINE_STAGES = [
  { id: "lead", label: "Lead", color: "bg-slate-500" },
  { id: "qualified", label: "Qualificado", color: "bg-blue-500" },
  { id: "proposal", label: "Proposta", color: "bg-amber-500" },
  { id: "negotiation", label: "Negociação", color: "bg-purple-500" },
  { id: "completed", label: "Fechado", color: "bg-green-500" },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]["id"];

export interface Deal {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  salesperson_id: string | null;
  created_at: string;
  updated_at: string;
}

// Map database status to pipeline stage
const statusToStage: Record<string, PipelineStage> = {
  pending: "lead",
  in_progress: "qualified",
  qualified: "qualified",
  proposal: "proposal",
  negotiation: "negotiation",
  completed: "completed",
  lead: "lead",
};

// Map pipeline stage to database status
const stageToStatus: Record<PipelineStage, string> = {
  lead: "pending",
  qualified: "in_progress",
  proposal: "proposal",
  negotiation: "negotiation",
  completed: "completed",
};

type DealsByStage = Record<PipelineStage, Deal[]>;

export const usePipelineDeals = () => {
  return useQuery({
    queryKey: ["pipeline-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Group deals by stage
      const dealsByStage: DealsByStage = {
        lead: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        completed: [],
      };

      (data as Deal[]).forEach((deal) => {
        const stage = statusToStage[deal.status] || "lead";
        dealsByStage[stage].push(deal);
      });

      return dealsByStage;
    },
  });
};

export const useMoveDeal = () => {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: PipelineStage }) => {
      const newStatus = stageToStatus[newStage];
      
      const { data, error } = await supabase
        .from("sales")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ dealId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: ["pipeline-deals"] });
      const previousDeals = queryClient.getQueryData<DealsByStage>(["pipeline-deals"]);
      
      if (previousDeals) {
        const newDeals: DealsByStage = {
          lead: [...previousDeals.lead],
          qualified: [...previousDeals.qualified],
          proposal: [...previousDeals.proposal],
          negotiation: [...previousDeals.negotiation],
          completed: [...previousDeals.completed],
        };
        
        // Find and move the deal
        let movedDeal: Deal | undefined;
        for (const stage of Object.keys(newDeals) as PipelineStage[]) {
          const dealIndex = newDeals[stage].findIndex(d => d.id === dealId);
          if (dealIndex !== -1) {
            [movedDeal] = newDeals[stage].splice(dealIndex, 1);
            break;
          }
        }
        
        if (movedDeal) {
          movedDeal.status = stageToStatus[newStage];
          movedDeal.updated_at = new Date().toISOString();
          newDeals[newStage].unshift(movedDeal);
        }
        
        queryClient.setQueryData(["pipeline-deals"], newDeals);
      }
      
      return { previousDeals };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(["pipeline-deals"], context.previousDeals);
      }
      toast.error("Erro ao mover deal: " + error.message);
    },
    onSuccess: (_, { newStage }) => {
      const stageLabel = PIPELINE_STAGES.find(s => s.id === newStage)?.label;
      toast.success(`Deal movido para ${stageLabel}`);
    },
    onSettled: () => {
      invalidateDomain("pipeline");
      invalidateDomain("sales");
    },
  });
};
