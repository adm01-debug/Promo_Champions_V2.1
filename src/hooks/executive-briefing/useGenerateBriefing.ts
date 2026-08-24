import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ExecutiveBriefing } from "@/components/executive-briefing/briefingHelpers";

export function useGenerateBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts?: { force?: boolean }): Promise<ExecutiveBriefing> => {
      const { data, error } = await supabase.functions.invoke("generate-executive-briefing", {
        body: { force: opts?.force ?? false, auto: false },
      });
      if (error) throw error;
      return data as ExecutiveBriefing;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executive-briefing"] });
      toast.success("Briefing executivo atualizado");
    },
    onError: (e: Error) => toast.error(e.message ?? "Falha ao gerar briefing"),
  });
}
