import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTranscribeRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("transcribe-call-recording", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as { recording_id: string; transcript_length: number; status: string };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["call-recordings"] });
      toast.success("Transcrição concluída! 📝");
      // Auto-chain: diarization → summarization (background)
      const recId = data?.recording_id;
      if (recId) {
        supabase.functions
          .invoke("diarize-call-recording", { body: { recording_id: recId } })
          .then(({ error }) => {
            if (!error) qc.invalidateQueries({ queryKey: ["call-recordings"] });
            return supabase.functions.invoke("summarize-call-recording", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) qc.invalidateQueries({ queryKey: ["call-recordings"] });
            return supabase.functions.invoke("detect-competitor-mentions", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["competitor-mentions", recId] });
            }
            return supabase.functions.invoke("extract-coaching-actions", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["coaching-actions", recId] });
            }
            return supabase.functions.invoke("analyze-sentiment-timeline", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["sentiment-timeline", recId] });
            }
            return supabase.functions.invoke("detect-critical-moments", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["critical-moments", recId] });
              qc.invalidateQueries({ queryKey: ["critical-moments-feed"] });
            }
            return supabase.functions.invoke("analyze-conversation-metrics", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["conversation-metrics", recId] });
              qc.invalidateQueries({ queryKey: ["conversation-metrics-feed"] });
            }
            return supabase.functions.invoke("analyze-question-quality", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["question-analysis", recId] });
              qc.invalidateQueries({ queryKey: ["call-questions", recId] });
              qc.invalidateQueries({ queryKey: ["question-analysis-feed"] });
            }
            return supabase.functions.invoke("analyze-objection-handling", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["objection-analysis", recId] });
              qc.invalidateQueries({ queryKey: ["call-objections", recId] });
              qc.invalidateQueries({ queryKey: ["objection-library"] });
            }
            return supabase.functions.invoke("aggregate-coaching-scorecard", {
              body: { recording_id: recId },
            });
          })
          .then((res) => {
            if (res && !res.error) {
              qc.invalidateQueries({ queryKey: ["coaching-scorecard", recId] });
              qc.invalidateQueries({ queryKey: ["coaching-leaderboard"] });
            }
          });
      }
    },
    onError: (e) => toast.error(`Falha na transcrição: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
}
