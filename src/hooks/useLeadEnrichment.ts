import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLeadEnrichment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, companyName, contactEmail }: { leadId: string; companyName?: string; contactEmail?: string }) => {
      const { data, error } = await supabase.functions.invoke('enrich-lead', {
        body: { leadId, companyName, contactEmail }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lead enriquecido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["bi-sdr"] });
    },
    onError: (error) => {
      console.error("Enrichment error:", error);
      toast.error("Erro ao enriquecer lead. Tente novamente.");
    }
  });
};
