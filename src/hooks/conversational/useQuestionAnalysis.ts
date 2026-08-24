import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { QuestionAnalysis, CallQuestion } from "@/components/conversational/questions/questionHelpers";

export function useQuestionAnalysis(recordingId: string | null | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["question-analysis", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_question_analysis")
        .select("*")
        .eq("recording_id", recordingId!)
        .maybeSingle();
      if (error) throw error;
      return data as QuestionAnalysis | null;
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`question-analysis-${recordingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_question_analysis", filter: `recording_id=eq.${recordingId}` },
        () => qc.invalidateQueries({ queryKey: ["question-analysis", recordingId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [recordingId, qc]);

  return query;
}

export function useCallQuestions(recordingId: string | null | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["call-questions", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_questions")
        .select("*")
        .eq("recording_id", recordingId!)
        .order("start_estimate", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CallQuestion[];
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`call-questions-${recordingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_questions", filter: `recording_id=eq.${recordingId}` },
        () => qc.invalidateQueries({ queryKey: ["call-questions", recordingId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [recordingId, qc]);

  return query;
}

export function useQuestionAnalysisFeed(limit = 50) {
  return useQuery({
    queryKey: ["question-analysis-feed", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_question_analysis")
        .select("*, call_recordings(id,title,recorded_at,salesperson_id)")
        .order("calculated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Array<
        QuestionAnalysis & { call_recordings: { id: string; title: string; recorded_at: string; salesperson_id: string } | null }
      >;
    },
  });
}

export function useAnalyzeQuestionQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-question-quality", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_d, recording_id) => {
      qc.invalidateQueries({ queryKey: ["question-analysis", recording_id] });
      qc.invalidateQueries({ queryKey: ["call-questions", recording_id] });
      qc.invalidateQueries({ queryKey: ["question-analysis-feed"] });
      toast.success("Qualidade das perguntas analisada! 🎯");
    },
    onError: (e) =>
      toast.error(`Falha ao analisar perguntas: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
}
