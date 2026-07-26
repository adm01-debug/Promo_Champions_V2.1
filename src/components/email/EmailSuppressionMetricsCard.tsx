import React, { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Minus, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useEmailOptOutMetrics } from '@/hooks/email/useEmailOptOutMetrics';
import { sourceLabel } from '@/hooks/email/emailOptOutMetricsHelpers';

/** Painel de métricas da lista de supressão (últimos 90 dias). */
export const EmailSuppressionMetricsCard = React.memo(function EmailSuppressionMetricsCard() {
  const { data, isLoading, isError } = useEmailOptOutMetrics();

  const trendLabel = useMemo(() => {
    if (!data || data.deltaPct === null) return null;
    return `${data.deltaPct > 0 ? '+' : ''}${data.deltaPct}% vs. 7 dias anteriores`;
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-40 rounded-xl lg:col-span-2" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Não foi possível carregar as métricas de supressão.
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    data.deltaPct === null ? Minus : data.deltaPct > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" aria-hidden />
            Volume de supressões
          </CardTitle>
          <CardDescription>Últimos 30 dias de novos bloqueios de envio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{data.last30}</p>
              <p className="text-xs text-muted-foreground">últimos 30 dias</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{data.last7}</p>
              <p className="text-xs text-muted-foreground">últimos 7 dias</p>
            </div>
            {trendLabel && (
              <Badge
                variant={data.deltaPct && data.deltaPct > 0 ? 'destructive' : 'secondary'}
                className="gap-1"
              >
                <TrendIcon className="h-3 w-3" aria-hidden />
                {trendLabel}
              </Badge>
            )}
          </div>

          <div className="h-28" role="img" aria-label="Série diária de supressões nos últimos 30 dias">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="optOutFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  formatter={(value: number) => [`${value}`, 'Supressões']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#optOutFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Origem dos bloqueios</CardTitle>
          <CardDescription>Distribuição em 90 dias ({data.total} registros).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.breakdown.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma supressão registrada no período.</p>
          )}
          {data.breakdown.slice(0, 5).map((item) => (
            <div key={item.source} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={cn('truncate', 'text-foreground')}>{sourceLabel(item.source)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {item.count} · {item.pct}%
                </span>
              </div>
              <Progress value={item.pct} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
