import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CoachingScorecard, SalespersonAggregate } from "@/components/conversational/coaching/coachingHelpers";

export function useCoachingScorecard(recordingId: string | undefined | null) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["coaching-scorecard", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_coaching_scorecards")
        .select("*")
        .eq("recording_id", recordingId!)
        .maybeSingle();
      if (error) throw error;
      return data as CoachingScorecard | null;
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`ccs-${recordingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "call_coaching_scorecards", filter: `recording_id=eq.${recordingId}` },
        () => qc.invalidateQueries({ queryKey: ["coaching-scorecard", recordingId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [recordingId, qc]);

  return query;
}

export function useSalespersonCoachingAggregate(salespersonId: string | undefined | null) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["coaching-aggregate", salespersonId],
    enabled: !!salespersonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salesperson_coaching_aggregates")
        .select("*")
        .eq("salesperson_id", salespersonId!)
        .maybeSingle();
      if (error) throw error;
      return data as SalespersonAggregate | null;
    },
  });

  useEffect(() => {
    if (!salespersonId) return;
    const ch = supabase
      .channel(`sca-${salespersonId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "salesperson_coaching_aggregates", filter: `salesperson_id=eq.${salespersonId}` },
        () => qc.invalidateQueries({ queryKey: ["coaching-aggregate", salespersonId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [salespersonId, qc]);

  return query;
}

export function useCoachingLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ["coaching-leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salesperson_coaching_aggregates")
        .select("*")
        .order("avg_overall", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as SalespersonAggregate[];
    },
    staleTime: 60_000,
  });
}

export function useAggregateCoachingScorecard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("aggregate-coaching-scorecard", {
        body: { recording_id },
      });
      if (error) throw error;
      return data as { recording_id: string; overall_score: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["coaching-scorecard", d.recording_id] });
      qc.invalidateQueries({ queryKey: ["coaching-leaderboard"] });
      toast.success("Scorecard atualizado 🎯");
    },
    onError: (e) => toast.error(`Falha: ${e instanceof Error ? e.message : "erro"}`),
  });
}
