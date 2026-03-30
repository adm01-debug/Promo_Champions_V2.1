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

interface DailyEmailStats {
  date: string;
  sent: number;
  failed: number;
  total: number;
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
  successRate: number;
  recentLogs: EmailLog[];
  dailyStats: DailyEmailStats[];
  byFunction: FunctionEmailStats[];
  topRecipients: { email: string; count: number }[];
}

export function useEmailMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['email-metrics', days],
    queryFn: async (): Promise<EmailMetricsData> => {
      const startDate = subDays(new Date(), days);

      const { data: logs, error } = await supabase
        .from('email_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const emailLogs = (logs || []) as EmailLog[];

      // Calculate totals
      const totalSent = emailLogs.filter(l => l.status === 'sent').length;
      const totalFailed = emailLogs.filter(l => l.status === 'failed').length;
      const successRate = emailLogs.length > 0 
        ? (totalSent / emailLogs.length) * 100 
        : 100;

      // Calculate daily stats
      const dailyMap = new Map<string, { sent: number; failed: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, { sent: 0, failed: 0 });
      }

      emailLogs.forEach(log => {
        const date = format(new Date(log.created_at), 'yyyy-MM-dd');
        const stats = dailyMap.get(date);
        if (stats) {
          if (log.status === 'sent') {
            stats.sent++;
          } else if (log.status === 'failed') {
            stats.failed++;
          }
        }
      });

      const dailyStats: DailyEmailStats[] = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
          date,
          sent: stats.sent,
          failed: stats.failed,
          total: stats.sent + stats.failed
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate by function
      const functionMap = new Map<string, { sent: number; failed: number }>();
      emailLogs.forEach(log => {
        const stats = functionMap.get(log.function_name) || { sent: 0, failed: 0 };
        if (log.status === 'sent') {
          stats.sent++;
        } else if (log.status === 'failed') {
          stats.failed++;
        }
        functionMap.set(log.function_name, stats);
      });

      const byFunction: FunctionEmailStats[] = Array.from(functionMap.entries())
        .map(([function_name, stats]) => ({
          function_name,
          sent: stats.sent,
          failed: stats.failed,
          total: stats.sent + stats.failed,
          successRate: stats.sent + stats.failed > 0 
            ? (stats.sent / (stats.sent + stats.failed)) * 100 
            : 100
        }))
        .sort((a, b) => b.total - a.total);

      // Calculate top recipients
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
        successRate,
        recentLogs: emailLogs.slice(0, 50),
        dailyStats,
        byFunction,
        topRecipients
      };
    },
    staleTime: 60000,
    refetchInterval: 120000
  });
}
