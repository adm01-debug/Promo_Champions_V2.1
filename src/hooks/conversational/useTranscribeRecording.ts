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
      // Auto-trigger diarization in background
      const recId = data?.recording_id;
      if (recId) {
        supabase.functions
          .invoke("diarize-call-recording", { body: { recording_id: recId } })
          .then(({ error }) => {
            if (!error) qc.invalidateQueries({ queryKey: ["call-recordings"] });
          });
      }
    },
    onError: (e) => toast.error(`Falha na transcrição: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
}
