import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BriefingHistoryEntry {
  id: string;
  briefing_date: string;
  content: string;
  model: string | null;
  created_at: string;
}

/**
 * Timeline dos briefings anteriores do vendedor logado.
 *
 * Cenários cobertos:
 * - Vendedor novo sem briefings → array vazio (não é erro).
 * - RLS bloqueia briefings de outros vendedores no server.
 * - Limite defensivo de 30 registros para não pesar o Hub.
 * - staleTime alto pois histórico muda no máximo 1x por dia.
 */
export function useBriefingHistory(salespersonId: string | null) {
  return useQuery({
    queryKey: ["assistant-briefing-history", salespersonId],
    enabled: Boolean(salespersonId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<BriefingHistoryEntry[]> => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from("personal_assistant_briefings")
        .select("id, briefing_date, content, model, created_at")
        .eq("salesperson_id", salespersonId)
        .order("briefing_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as BriefingHistoryEntry[];
    },
  });
}
