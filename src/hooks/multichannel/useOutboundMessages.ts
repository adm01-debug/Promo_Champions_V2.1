import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OutboundMessage {
  id: string;
  enrollment_id: string | null;
  step_id: string | null;
  channel: "whatsapp" | "sms";
  provider: string;
  to_number: string;
  body: string | null;
  provider_message_id: string | null;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export const useOutboundMessages = (enrollmentId?: string, limit = 50) => {
  return useQuery({
    queryKey: ["outbound-messages", enrollmentId ?? "all", limit],
    queryFn: async () => {
      let q = supabase
        .from("outbound_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (enrollmentId) q = q.eq("enrollment_id", enrollmentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as OutboundMessage[];
    },
    enabled: enrollmentId !== "",
  });
};

export const useOutboundMessagesByDay = (days = 7) => {
  return useQuery({
    queryKey: ["outbound-messages-by-day", days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase
        .from("outbound_messages")
        .select("channel, status, created_at")
        .gte("created_at", since.toISOString());
      if (error) throw error;
      const rows = (data ?? []) as Array<{ channel: string; status: string; created_at: string }>;
      const byChannel: Record<string, { sent: number; failed: number; total: number }> = {};
      rows.forEach((r) => {
        const k = r.channel;
        if (!byChannel[k]) byChannel[k] = { sent: 0, failed: 0, total: 0 };
        byChannel[k].total++;
        if (r.status === "failed") byChannel[k].failed++;
        else byChannel[k].sent++;
      });
      return { byChannel, total: rows.length };
    },
  });
};
