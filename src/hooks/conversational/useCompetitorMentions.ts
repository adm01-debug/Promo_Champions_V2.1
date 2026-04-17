import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompetitorMention {
  id: string;
  recording_id: string;
  competitor_id: string | null;
  competitor_name: string;
  timestamp_sec: number | null;
  context_snippet: string | null;
  battle_card_id: string | null;
  created_at: string;
}

export function useCompetitorMentions(recordingId?: string) {
  return useQuery({
    queryKey: ["competitor-mentions", recordingId],
    queryFn: async () => {
      if (!recordingId) return [];
      const { data, error } = await supabase
        .from("competitor_mentions")
        .select("*")
        .eq("recording_id", recordingId)
        .order("timestamp_sec", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data as CompetitorMention[]) ?? [];
    },
    enabled: !!recordingId,
  });
}

export function useDetectCompetitors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke(
        "detect-competitor-mentions",
        { body: { recording_id } },
      );
      if (error) throw error;
      return data as { mentions_count: number; competitors: { name: string; count: number }[] };
    },
    onSuccess: (data, recording_id) => {
      qc.invalidateQueries({ queryKey: ["competitor-mentions", recording_id] });
      toast.success(`${data.mentions_count} menções detectadas`);
    },
    onError: (e) =>
      toast.error(`Falha na detecção: ${e instanceof Error ? e.message : "erro"}`),
  });
}
