import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";

export interface StageBaseline {
  id: string;
  stage: string;
  owner_id: string | null;
  avg_days: number;
  median_days: number;
  p75_days: number;
  sample_size: number;
  calculated_at: string;
}

export const useStageBaselines = (ownerId?: string | null) => {
  return useQuery({
    queryKey: ["stage-baselines", ownerId ?? "global"],
    queryFn: async () => {
      let q = supabase.from("stage_velocity_baselines").select("*").order("avg_days", { ascending: false });
      q = ownerId ? q.eq("owner_id", ownerId) : q.is("owner_id", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as StageBaseline[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useRefreshStageBaselines = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("refresh-stage-baselines", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Baselines de velocidade atualizadas");
      qc.invalidateQueries({ queryKey: ["stage-baselines"] });
    },
    onError: () => toast.error("Erro ao atualizar baselines"),
  });
};
