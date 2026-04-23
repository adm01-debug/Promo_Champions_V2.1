import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CoachingAction, CoachingStatus } from "@/components/conversational/coachingHelpers";

export function useCoachingActions(recordingId?: string) {
  return useQuery({
    queryKey: ["coaching-actions", recordingId],
    queryFn: async () => {
      if (!recordingId) return [];
      const { data, error } = await supabase
        .from("coaching_actions")
        .select("*")
        .eq("recording_id", recordingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoachingAction[];
    },
    enabled: !!recordingId,
  });
}

export function useCoachingActionsBySalesperson(salespersonId?: string, days = 30) {
  return useQuery({
    queryKey: ["coaching-actions-sp", salespersonId, days],
    queryFn: async () => {
      if (!salespersonId) return [];
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("coaching_actions")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoachingAction[];
    },
    enabled: !!salespersonId,
  });
}

export function useUpdateCoachingAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status?: CoachingStatus;
      manager_note?: string | null;
    }) => {
      const patch: Record<string, unknown> = {};
      if (input.status) {
        patch.status = input.status;
        if (input.status === "accepted" || input.status === "practiced") {
          patch.accepted_at = new Date().toISOString();
        }
      }
      if (input.manager_note !== undefined) patch.manager_note = input.manager_note;

      const { error } = await supabase
        .from("coaching_actions")
        .update(patch as never)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coaching-actions"] });
      qc.invalidateQueries({ queryKey: ["coaching-actions-sp"] });
      qc.invalidateQueries({ queryKey: ["coaching-progress"] });
    },
    onError: (e) => toast.error(`Falha ao atualizar: ${e instanceof Error ? e.message : "?"}`),
  });
}

export function useExtractCoaching() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("extract-coaching-actions", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as { recording_id: string; actions_count: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["coaching-actions", data.recording_id] });
      toast.success(`Coaching gerado: ${data.actions_count} ações`);
    },
    onError: (e) => toast.error(`Erro: ${e instanceof Error ? e.message : "?"}`),
  });
}
