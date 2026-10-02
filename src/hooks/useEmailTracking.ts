import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EmailEventType = 'sent' | 'opened' | 'clicked' | 'bounced' | 'replied';

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
    queryKey: ['email-tracking', salesperson?.id],
    queryFn: async (): Promise<EmailTrackingEvent[]> => {
      const query = supabase
        .from('email_tracking_events')
        .select('*')
        .order('tracked_at', { ascending: false })
        .limit(200);

      if (salesperson?.id) {
        query.eq('salesperson_id', salesperson.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EmailTrackingEvent[];
    },
    enabled: !!salesperson?.id,
  });
}

export function useEmailTrackingStats() {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ['email-tracking-stats', salesperson?.id],
    queryFn: async (): Promise<EmailTrackingStats> => {
      const query = supabase.from('email_tracking_events').select('event_type');

      if (salesperson?.id) {
        query.eq('salesperson_id', salesperson.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const events = data || [];
      const sent = events.filter(e => e.event_type === 'sent').length;
      const opened = events.filter(e => e.event_type === 'opened').length;
      const clicked = events.filter(e => e.event_type === 'clicked').length;
      const replied = events.filter(e => e.event_type === 'replied').length;
      const bounced = events.filter(e => e.event_type === 'bounced').length;

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
