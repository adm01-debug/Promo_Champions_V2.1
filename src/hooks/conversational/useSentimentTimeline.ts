import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SentimentSegment } from "@/components/conversational/sentimentHelpers";

export function useSentimentTimeline(recordingId?: string | null) {
  return useQuery({
    queryKey: ["sentiment-timeline", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_sentiment_timeline")
        .select("*")
        .eq("recording_id", recordingId!)
        .order("start_sec", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as SentimentSegment[];
    },
  });
}

export function useAnalyzeSentiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke(
        "analyze-sentiment-timeline",
        { body: { recording_id } },
      );
      if (error) throw error;
      if ((data as { error?: string })?.error)
        throw new Error((data as { error: string }).error);
      return data as { recording_id: string; segments_count: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sentiment-timeline", data.recording_id] });
      toast.success(`Sentimento analisado (${data.segments_count} janelas) 📈`);
    },
    onError: (e) =>
      toast.error(
        `Falha na análise de sentimento: ${e instanceof Error ? e.message : "erro"}`,
      ),
  });
}
