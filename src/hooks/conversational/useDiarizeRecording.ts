import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDiarizeRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("diarize-call-recording", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as {
        recording_id: string;
        talk_ratio_seller: number;
        talk_ratio_client: number;
        longest_monologue_sec: number;
        interruptions_count: number;
        turns_count: number;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["call-recordings"] });
      toast.success("Diarização concluída! 🎙️");
    },
    onError: (e) =>
      toast.error(`Falha na diarização: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
}
