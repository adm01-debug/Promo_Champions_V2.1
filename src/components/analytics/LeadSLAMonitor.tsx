import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, AlertTriangle, CheckCircle2, Timer } from 'lucide-react';

interface SLAMetrics {
  totalLeads: number;
  respondedWithinSLA: number;
  slaRate: number;
  avgResponseMinutes: number;
  overdueleads: number;
}

export const LeadSLAMonitor: FC = () => {
  const { data, isLoading } = useQuery<SLAMetrics>({
    queryKey: ['lead-sla-metrics'],
    queryFn: async () => {
      // Get recent leads (sales with status pending)
      const { data: leads } = await supabase
        .from('sales')
        .select('id, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get first activity per lead to measure response time
      const leadIds = (leads || []).map(l => l.id);
      const { data: activities } = await supabase
        .from('activities')
        .select('sale_id, created_at')
        .in('sale_id', leadIds.length > 0 ? leadIds : ['none'])
        .order('created_at', { ascending: true });

      const SLA_HOURS = 24; // 24h SLA
      const firstActivityMap = new Map<string, string>();
      (activities || []).forEach(a => {
        if (a.sale_id && !firstActivityMap.has(a.sale_id)) {
          firstActivityMap.set(a.sale_id, a.created_at);
        }
      });

      let respondedWithinSLA = 0;
      let totalResponseMinutes = 0;
      let respondedCount = 0;
      let overdueCount = 0;

      (leads || []).forEach(lead => {
        const firstActivity = firstActivityMap.get(lead.id);
        if (firstActivity) {
          const responseTime = new Date(firstActivity).getTime() - new Date(lead.created_at).getTime();
          const responseMinutes = responseTime / (1000 * 60);
          totalResponseMinutes += responseMinutes;
          respondedCount++;

          if (responseMinutes <= SLA_HOURS * 60) {
            respondedWithinSLA++;
          }
        } else {
          const age = Date.now() - new Date(lead.created_at).getTime();
          if (age > SLA_HOURS * 60 * 60 * 1000) {
            overdueCount++;
          }
        }
      });

      return {
        totalLeads: (leads || []).length,
        respondedWithinSLA,
        slaRate: respondedCount > 0 ? Math.round((respondedWithinSLA / respondedCount) * 100) : 100,
        avgResponseMinutes: respondedCount > 0 ? Math.round(totalResponseMinutes / respondedCount) : 0,
        overdueleads: overdueCount,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  return (
    <Card className="glass border-border/40 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Monitor de SLA de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl font-bold">{data.slaRate}%</p>
            <p className="text-xs text-muted-foreground">Dentro do SLA</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-bold">{formatTime(data.avgResponseMinutes)}</p>
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
          </div>
        </div>

        {data.overdueleads > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              {data.overdueleads} leads sem resposta
            </span>
            <Badge variant="destructive" className="ml-auto text-xs">Urgente</Badge>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{data.totalLeads} leads pendentes</span>
          <span>SLA: 24h</span>
        </div>
      </CardContent>
    </Card>
  );
};
