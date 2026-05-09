import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

interface EmailLog {
  id: string;
  function_name: string;
  recipient_email: string;
  subject: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface TrackingEvent {
  id: string;
  event_type: 'open' | 'click';
  recipient_email: string;
  subject: string;
  tracked_at: string;
}

interface DailyEmailStats {
  date: string;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
}

interface SubjectPerformance {
  subject: string;
  sent: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
}

interface FunctionEmailStats {
  function_name: string;
  sent: number;
  failed: number;
  total: number;
  successRate: number;
}

interface EmailMetricsData {
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  successRate: number;
  openRate: number;
  clickRate: number;
  dailyStats: DailyEmailStats[];
  bySubject: SubjectPerformance[];
  byFunction: FunctionEmailStats[];
  topRecipients: { email: string; count: number }[];
  recentLogs: EmailLog[];
}

export function useEmailMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['email-metrics-v3', days],
    queryFn: async (): Promise<EmailMetricsData> => {
      const startDate = subDays(new Date(), days);

      // Fetch logs
      const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // Fetch tracking events
      const { data: events } = await supabase
        .from('email_tracking_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const emailLogs = (logs || []) as EmailLog[];
      const trackingEvents = (events || []) as unknown as TrackingEvent[];

      const totalSent = emailLogs.filter(l => l.status === 'sent').length;
      const totalFailed = emailLogs.filter(l => l.status === 'failed').length;
      const totalOpened = trackingEvents.filter(e => e.event_type === 'open').length;
      const totalClicked = trackingEvents.filter(e => e.event_type === 'click').length;

      const successRate = emailLogs.length > 0 ? (totalSent / emailLogs.length) * 100 : 100;
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      // Daily stats
      const dailyMap = new Map<string, DailyEmailStats>();
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, { date, sent: 0, failed: 0, opened: 0, clicked: 0 });
      }

      emailLogs.forEach(log => {
        const date = format(new Date(log.created_at), 'yyyy-MM-dd');
        const stats = dailyMap.get(date);
        if (stats) {
          if (log.status === 'sent') stats.sent++;
          else if (log.status === 'failed') stats.failed++;
        }
      });

      trackingEvents.forEach(event => {
        const date = format(new Date(event.tracked_at), 'yyyy-MM-dd');
        const stats = dailyMap.get(date);
        if (stats) {
          if (event.event_type === 'open') stats.opened++;
          else if (event.event_type === 'click') stats.clicked++;
        }
      });

      // Subject performance (A/B comparisons)
      const subjectMap = new Map<string, { sent: number; opens: number; clicks: number }>();
      emailLogs.forEach(log => {
        if (!log.subject || log.status !== 'sent') return;
        const s = subjectMap.get(log.subject) || { sent: 0, opens: 0, clicks: 0 };
        s.sent++;
        subjectMap.set(log.subject, s);
      });

      trackingEvents.forEach(event => {
        if (!event.subject) return;
        const s = subjectMap.get(event.subject);
        if (s) {
          if (event.event_type === 'open') s.opens++;
          else if (event.event_type === 'click') s.clicks++;
        }
      });

      const bySubject: SubjectPerformance[] = Array.from(subjectMap.entries())
        .map(([subject, stats]) => ({
          subject,
          ...stats,
          openRate: stats.sent > 0 ? (stats.opens / stats.sent) * 100 : 0,
          clickRate: stats.sent > 0 ? (stats.clicks / stats.sent) * 100 : 0,
        }))
        .sort((a, b) => b.sent - a.sent)
        .slice(0, 10);

      // By Function (Backward compatibility)
      const functionMap = new Map<string, { sent: number; failed: number }>();
      emailLogs.forEach(log => {
        const stats = functionMap.get(log.function_name) || { sent: 0, failed: 0 };
        if (log.status === 'sent') stats.sent++;
        else if (log.status === 'failed') stats.failed++;
        functionMap.set(log.function_name, stats);
      });

      const byFunction: FunctionEmailStats[] = Array.from(functionMap.entries())
        .map(([function_name, stats]) => ({
          function_name,
          sent: stats.sent,
          failed: stats.failed,
          total: stats.sent + stats.failed,
          successRate: (stats.sent + stats.failed) > 0 ? (stats.sent / (stats.sent + stats.failed)) * 100 : 100
        }))
        .sort((a, b) => b.total - a.total);

      // Top Recipients (Backward compatibility)
      const recipientMap = new Map<string, number>();
      emailLogs.forEach(log => {
        const count = recipientMap.get(log.recipient_email) || 0;
        recipientMap.set(log.recipient_email, count + 1);
      });

      const topRecipients = Array.from(recipientMap.entries())
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalSent,
        totalFailed,
        totalOpened,
        totalClicked,
        successRate,
        openRate,
        clickRate,
        dailyStats: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        bySubject,
        byFunction,
        topRecipients,
        recentLogs: emailLogs.slice(0, 50),
      };
    },
    staleTime: 60000,
  });
}
