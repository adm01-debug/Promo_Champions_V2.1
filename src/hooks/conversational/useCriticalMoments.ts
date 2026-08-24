import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  sortMoments,
  type CriticalMoment,
  type MomentStatus,
} from "@/components/conversational/criticalMomentsHelpers";

export function useCriticalMoments(recordingId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!recordingId) return;
    const channel = supabase
      .channel(`critical-moments-${recordingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "call_critical_moments",
          filter: `recording_id=eq.${recordingId}`,
        },
        () => qc.invalidateQueries({ queryKey: ["critical-moments", recordingId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordingId, qc]);

  return useQuery({
    queryKey: ["critical-moments", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_critical_moments")
        .select("*")
        .eq("recording_id", recordingId!)
        .order("timestamp_sec", { ascending: true });
      if (error) throw error;
      return sortMoments((data as CriticalMoment[]) ?? []);
    },
  });
}

export function useUpdateCriticalMoment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MomentStatus }) => {
      const { error } = await supabase
        .from("call_critical_moments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["critical-moments"] });
      qc.invalidateQueries({ queryKey: ["critical-moments-feed"] });
    },
    onError: (e) =>
      toast.error(`Falha ao atualizar: ${e instanceof Error ? e.message : "erro"}`),
  });
}

export function useDetectCriticalMoments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("detect-critical-moments", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as { recording_id: string; moments_detected: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["critical-moments", data?.recording_id] });
      toast.success(`${data?.moments_detected ?? 0} momento(s) crítico(s) detectado(s) 🚨`);
    },
    onError: (e) =>
      toast.error(`Falha ao detectar momentos: ${e instanceof Error ? e.message : "erro"}`),
  });
}

export interface FeedRow extends CriticalMoment {
  call_recordings?: { title: string | null } | null;
}

export function useMyCriticalMomentsFeed(limit = 30) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("critical-moments-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "call_critical_moments" },
        (payload) => {
          const row = payload.new as CriticalMoment;
          if (row.severity === "high" || row.severity === "critical") {
            const fn = row.severity === "critical" ? toast.error : toast.warning;
            fn(`Momento ${row.severity === "critical" ? "crítico" : "de alta atenção"} detectado`, {
              description: row.quote?.slice(0, 120) ?? "Abra a call para revisar",
            });
          }
          qc.invalidateQueries({ queryKey: ["critical-moments-feed"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["critical-moments-feed", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_critical_moments")
        .select("*, call_recordings(title)")
        .in("severity", ["high", "critical"])
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as FeedRow[]) ?? [];
    },
  });
}
