import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShieldCheck, TrendingDown, Layers, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CronAlertMetrics {
  last_alert_at: string | null;
  window_24h: {
    alerts_total: number;
    alerts_stalled: number;
    alerts_failed: number;
    jobs_affected: number;
    raw_failures: number | null;
    dedupe_saved: number | null;
  };
  window_7d: {
    alerts_total: number;
    alerts_stalled: number;
    jobs_affected: number;
  };
  generated_at: string;
}

async function fetchMetrics(): Promise<CronAlertMetrics> {
  const { data, error } = await supabase.rpc('fn_admin_cron_alert_metrics');
  if (error) throw error;
  /* eslint-disable no-restricted-syntax */
  return data as unknown as CronAlertMetrics;
  /* eslint-enable no-restricted-syntax */
}

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'success' | 'warn' | 'danger';
}

function Stat({ label, value, hint, icon: Icon, tone = 'default' }: StatProps) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-500'
      : tone === 'warn'
        ? 'text-amber-500'
        : tone === 'danger'
          ? 'text-destructive'
          : 'text-primary';
  return (
    <div className="rounded-lg border bg-card/50 p-4 space-y-1">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className={cn('h-3.5 w-3.5', toneClass)} />
        <span>{label}</span>
      </div>
      <div className={cn('text-2xl font-semibold', toneClass)}>{value}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function CronAlertMetricsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'cron-alert-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Alertas de Cron — Métricas de deduplicação
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Janela de 6h por (jobid, status). Estimativa de supressão comparando falhas
            brutas do <code>cron.job_run_details</code> com registros efetivamente
            alertados.
          </p>
        </div>
        {data ? (
          <Badge variant="outline" className="whitespace-nowrap">
            atualizado{' '}
            {formatDistanceToNow(new Date(data.generated_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Falha ao carregar métricas: {(error as Error).message}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <Stat
                label="Alertas 24h"
                value={data.window_24h.alerts_total}
                hint={`${data.window_24h.alerts_stalled} travados · ${data.window_24h.alerts_failed} falhas`}
                icon={AlertTriangle}
                tone={data.window_24h.alerts_total > 0 ? 'warn' : 'success'}
              />
              <Stat
                label="Jobs afetados 24h"
                value={data.window_24h.jobs_affected}
                icon={Layers}
                tone={data.window_24h.jobs_affected > 0 ? 'warn' : 'success'}
              />
              <Stat
                label="Deduplicações 24h"
                value={data.window_24h.dedupe_saved ?? '—'}
                hint={
                  data.window_24h.raw_failures != null
                    ? `${data.window_24h.raw_failures} falhas brutas → ${data.window_24h.alerts_total} alertas`
                    : 'cron schema indisponível'
                }
                icon={TrendingDown}
                tone="success"
              />
              <Stat
                label="Último alerta"
                value={
                  data.last_alert_at
                    ? formatDistanceToNow(new Date(data.last_alert_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : 'nenhum'
                }
                icon={Clock}
                tone={data.last_alert_at ? 'warn' : 'success'}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-md border p-3">
                <div className="uppercase tracking-wide text-muted-foreground mb-1">
                  Alertas 7d
                </div>
                <div className="text-lg font-semibold">{data.window_7d.alerts_total}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="uppercase tracking-wide text-muted-foreground mb-1">
                  Travados 7d
                </div>
                <div className="text-lg font-semibold">
                  {data.window_7d.alerts_stalled}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="uppercase tracking-wide text-muted-foreground mb-1">
                  Jobs distintos 7d
                </div>
                <div className="text-lg font-semibold">
                  {data.window_7d.jobs_affected}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
