import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ConversationAnalysis,
  ConvSource,
} from "@/components/conversation-intelligence/conversationHelpers";

interface Payload {
  sale_id?: string;
  client_id?: string;
  source: ConvSource;
  transcript: string;
}

export function useAnalyzeConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Payload): Promise<ConversationAnalysis> => {
      const { data, error } = await supabase.functions.invoke("analyze-conversation", {
        body: payload,
      });
      if (error) throw error;
      const result = data as { error?: string; analysis?: ConversationAnalysis };
      if (result.error) throw new Error(result.error);
      if (!result.analysis) throw new Error("Sem retorno da IA");
      return result.analysis;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversation-analyses"] });
      toast.success("Conversa analisada com IA! 🧠");
    },
    onError: (e) =>
      toast.error(`Falha na análise: ${e instanceof Error ? e.message : "erro"}`),
  });
}
