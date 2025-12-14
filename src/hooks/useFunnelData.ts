import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FunnelStage {
  stage: string;
  value: number;
}

export const useFunnelData = () => {
  return useQuery({
    queryKey: ["funnel-data"],
    queryFn: async (): Promise<FunnelStage[]> => {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("status");

      if (error) throw error;

      // Mapear status do banco para estágios do funil
      const statusToStage: Record<string, string> = {
        pending: "Leads",
        qualified: "Qualificados",
        proposal: "Propostas",
        negotiation: "Propostas",
        completed: "Fechados",
        lost: "Perdidos",
      };

      // Contar por estágio
      const stageCounts: Record<string, number> = {
        Leads: 0,
        Qualificados: 0,
        Propostas: 0,
        Fechados: 0,
      };

      sales?.forEach((sale) => {
        const stage = statusToStage[sale.status] || "Leads";
        if (stage in stageCounts) {
          stageCounts[stage]++;
        }
      });

      // Converter para array no formato esperado
      return [
        { stage: "Leads", value: stageCounts.Leads + stageCounts.Qualificados + stageCounts.Propostas + stageCounts.Fechados },
        { stage: "Qualificados", value: stageCounts.Qualificados + stageCounts.Propostas + stageCounts.Fechados },
        { stage: "Propostas", value: stageCounts.Propostas + stageCounts.Fechados },
        { stage: "Fechados", value: stageCounts.Fechados },
      ];
    },
    staleTime: 5 * 60 * 1000,
  });
};
