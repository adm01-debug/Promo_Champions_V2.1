import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ObjectionAnalysis,
  CallObjection,
  ObjectionLibraryEntry,
  ObjectionType,
} from "@/components/conversational/objections/objectionHelpers";

export function useObjectionAnalysis(recordingId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["objection-analysis", recordingId],
    enabled: !!recordingId,
    queryFn: async (): Promise<ObjectionAnalysis | null> => {
      const { data, error } = await supabase
        .from("call_objection_analysis")
        .select("*")
        .eq("recording_id", recordingId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ObjectionAnalysis) ?? null;
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`objection-analysis-${recordingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_objection_analysis", filter: `recording_id=eq.${recordingId}` },
        () => qc.invalidateQueries({ queryKey: ["objection-analysis", recordingId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [recordingId, qc]);

  return query;
}

export function useCallObjections(recordingId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["call-objections", recordingId],
    enabled: !!recordingId,
    queryFn: async (): Promise<CallObjection[]> => {
      const { data, error } = await supabase
        .from("call_objections")
        .select("*")
        .eq("recording_id", recordingId!)
        .order("client_turn_index", { ascending: true });
      if (error) throw error;
      return (data as unknown as CallObjection[]) ?? [];
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`call-objections-${recordingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_objections", filter: `recording_id=eq.${recordingId}` },
        () => qc.invalidateQueries({ queryKey: ["call-objections", recordingId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [recordingId, qc]);

  return query;
}

export function useObjectionLibrary(filter?: { type?: ObjectionType; limit?: number }) {
  return useQuery({
    queryKey: ["objection-library", filter?.type, filter?.limit],
    queryFn: async (): Promise<ObjectionLibraryEntry[]> => {
      let q = supabase
        .from("objection_library")
        .select("*")
        .order("frequency_count", { ascending: false })
        .order("last_seen_at", { ascending: false })
        .limit(filter?.limit ?? 10);
      if (filter?.type) q = q.eq("objection_type", filter.type);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as ObjectionLibraryEntry[]) ?? [];
    },
  });
}

export function useAnalyzeObjectionHandling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-objection-handling", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_d, recording_id) => {
      qc.invalidateQueries({ queryKey: ["objection-analysis", recording_id] });
      qc.invalidateQueries({ queryKey: ["call-objections", recording_id] });
      qc.invalidateQueries({ queryKey: ["objection-library"] });
      toast.success("Análise de objeções concluída! 🎯");
    },
    onError: (e) => toast.error(`Falha: ${e instanceof Error ? e.message : "erro"}`),
  });
}
