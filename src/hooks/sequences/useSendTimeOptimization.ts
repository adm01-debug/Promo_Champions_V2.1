import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BestSendWindow {
  contact_id: string;
  contact_type: string;
  hour_of_day: number;
  day_of_week: number;
  opens: number;
  clicks: number;
  replies: number;
  score: number;
  rank: number;
}

export function useContactSendProfile(
  contactId: string | undefined,
  contactType: "lead" | "client" | undefined,
) {
  return useQuery({
    queryKey: ["contact-best-send-window", contactId, contactType],
    queryFn: async () => {
      if (!contactId || !contactType) return [];
      const { data, error } = await supabase
        .from("contact_best_send_window")
        .select("*")
        .eq("contact_id", contactId)
        .eq("contact_type", contactType)
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BestSendWindow[];
    },
    enabled: !!contactId && !!contactType,
  });
}

export function useToggleSendTimeOptimization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from("sequences")
        .update({ send_time_optimization: enabled })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      qc.invalidateQueries({ queryKey: ["sequence", data.id] });
      toast.success(data.send_time_optimization ? "STO ativado" : "STO desativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== Send Time Profiles & Scheduled Sends =====
import { useEffect } from "react";

export interface SendTimeProfile {
  id: string;
  sale_id: string;
  best_hour: number;
  best_dow: number;
  confidence: number;
  sample_size: number;
  tz: string;
  hour_distribution: number[];
  dow_distribution: number[];
  last_calculated_at: string;
}

export interface ScheduledSend {
  id: string;
  owner_id: string;
  sale_id: string;
  channel: string;
  payload: Record<string, unknown>;
  scheduled_for: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  optimization_source: "profile" | "global" | "manual";
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export function useSendTimeProfile(saleId: string | undefined) {
  return useQuery({
    queryKey: ["send-time-profile", saleId],
    enabled: !!saleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("send_time_profiles")
        .select("*")
        .eq("sale_id", saleId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SendTimeProfile | null) ?? null;
    },
  });
}

export function useScheduleOptimalSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sale_id: string;
      channel: string;
      payload: Record<string, unknown>;
      force_now?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("schedule-optimal-send", { body: input });
      if (error) throw new Error(error.message);
      return data as { id: string; scheduled_for: string; source: string; confidence: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-sends"] }),
    onError: (e: Error) => toast.error(`Erro ao agendar: ${e.message}`),
  });
}

export function useScheduledSends(status: ScheduledSend["status"] | "all" = "pending") {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["scheduled-sends", status],
    queryFn: async () => {
      let qb = supabase.from("scheduled_sends").select("*").order("scheduled_for", { ascending: true }).limit(200);
      if (status !== "all") {
        qb = qb.eq("status", status) as any; // Temporary assertion for complex chain if needed, but trying to avoid any
      }
      const { data, error } = await qb;
      if (error) throw error;
      return (data ?? []) as unknown as ScheduledSend[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("scheduled-sends-realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "scheduled_sends" }, () =>
        qc.invalidateQueries({ queryKey: ["scheduled-sends"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return q;
}

export function useCancelScheduledSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_sends").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-sends"] });
      toast.success("Envio cancelado");
    },
    onError: (e: Error) => toast.error(`Erro ao cancelar: ${e.message}`),
  });
}
