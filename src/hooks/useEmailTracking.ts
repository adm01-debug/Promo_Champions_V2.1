import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type EmailEventType = "sent" | "opened" | "clicked" | "bounced" | "replied";

export interface EmailTrackingEvent {
  id: string;
  sale_id: string | null;
  salesperson_id: string | null;
  recipient_email: string;
  subject: string;
  event_type: EmailEventType;
  tracked_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EmailTrackingStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  total_bounced: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
}

export function useEmailTracking() {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ["email-tracking", salesperson?.id],
    queryFn: async (): Promise<EmailTrackingEvent[]> => {
      const { data, error } = await supabase
        .from("email_tracking_events")
        .select("*")
        .order("tracked_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as EmailTrackingEvent[];
    },
    enabled: !!salesperson?.id,
  });
}

export function useEmailTrackingStats() {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ["email-tracking-stats", salesperson?.id],
    queryFn: async (): Promise<EmailTrackingStats> => {
      const { data, error } = await supabase
        .from("email_tracking_events")
        .select("event_type");

      if (error) throw error;

      const events = data || [];
      const sent = events.filter(e => e.event_type === "sent").length;
      const opened = events.filter(e => e.event_type === "opened").length;
      const clicked = events.filter(e => e.event_type === "clicked").length;
      const replied = events.filter(e => e.event_type === "replied").length;
      const bounced = events.filter(e => e.event_type === "bounced").length;

      return {
        total_sent: sent,
        total_opened: opened,
        total_clicked: clicked,
        total_replied: replied,
        total_bounced: bounced,
        open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        click_rate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
        reply_rate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
      };
    },
    enabled: !!salesperson?.id,
  });
}

export function useLogEmailEvent() {
  const queryClient = useQueryClient();
  const { salesperson } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      sale_id?: string;
      recipient_email: string;
      subject: string;
      event_type: EmailEventType;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("email_tracking_events")
        .insert({
          sale_id: input.sale_id || null,
          salesperson_id: salesperson?.id,
          recipient_email: input.recipient_email,
          subject: input.subject,
          event_type: input.event_type,
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["email-tracking-stats"] });
    },
    onError: () => toast.error("Erro ao registrar evento de email"),
  });
}
