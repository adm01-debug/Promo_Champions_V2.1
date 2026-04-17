import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InboundReplyEvent {
  id: string;
  provider: string;
  message_id: string | null;
  from_email: string | null;
  subject: string | null;
  received_at: string;
  event_type: string;
  matched_enrollment_id: string | null;
  created_at: string;
}

export function useUpdateAutoPauseSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; auto_pause_on_reply?: boolean; auto_pause_on_bounce?: boolean }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("sequences").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["sequence", vars.id] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
      toast.success("Configurações de auto-pausa atualizadas");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useResumeEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; sequenceId: string }) => {
      const { error } = await supabase
        .from("sequence_enrollments")
        .update({
          status: "active",
          auto_paused_at: null,
          auto_pause_reason: null,
          next_action_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["sequence-enrollments", vars.sequenceId] });
      toast.success("Inscrição retomada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInboundReplyEvents(limit = 50) {
  return useQuery({
    queryKey: ["inbound-reply-events", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inbound_reply_events")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as InboundReplyEvent[];
    },
  });
}
