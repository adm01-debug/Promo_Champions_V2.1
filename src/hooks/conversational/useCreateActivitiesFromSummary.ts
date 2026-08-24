import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCreateActivitiesFromSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.rpc("create_activities_from_action_items", {
        _recording_id: recording_id,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success(
        count > 0
          ? `${count} atividade(s) de follow-up criada(s) ✅`
          : "Nenhuma nova atividade (já existem para esta call)",
      );
    },
    onError: (e) =>
      toast.error(`Erro: ${e instanceof Error ? e.message : "desconhecido"}`),
  });
}
