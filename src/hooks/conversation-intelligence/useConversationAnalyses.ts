import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ConversationAnalysis } from "@/components/conversation-intelligence/conversationHelpers";

export function useConversationAnalyses(saleId?: string, limit = 50) {
  return useQuery({
    queryKey: ["conversation-analyses", saleId ?? "all", limit],
    queryFn: async (): Promise<ConversationAnalysis[]> => {
      let q = supabase
        .from("conversation_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (saleId) q = q.eq("sale_id", saleId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ConversationAnalysis[];
    },
    staleTime: 60 * 1000,
  });
}
