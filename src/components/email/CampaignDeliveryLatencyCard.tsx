import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Gauge, Timer } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCampaignDeliveryStats } from '@/hooks/email/useCampaignDeliveryStats';
import {
  classifyDelivery,
  completionRate,
  failureRate,
  formatDuration,
  summarizeDelivery,
  type DeliveryHealth,
} from '@/hooks/email/campaignDeliveryHelpers';

const HEALTH_META: Record<
  DeliveryHealth,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  ok: { label: 'Saudável', variant: 'outline' },
  lento: { label: 'Lento', variant: 'secondary' },
  travado: { label: 'Travado', variant: 'destructive' },
  falhando: { label: 'Falhando', variant: 'destructive' },
};

/** Trunca o prompt da campanha para exibição em tabela. */
function campaignLabel(prompt: string): string {
  const clean = (prompt ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Campanha sem descrição';
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

/** Monitoramento de latência e vazão de entrega das campanhas de e-mail em massa. */
export const CampaignDeliveryLatencyCard = React.memo(function CampaignDeliveryLatencyCard() {
  const { data, isLoading } = useCampaignDeliveryStats(30);

  const rows = useMemo(() => data ?? [], [data]);
  const summary = useMemo(() => summarizeDelivery(rows), [rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" aria-hidden />
          Latência de entrega por campanha
        </CardTitle>
        <CardDescription>
          Tempo entre a criação da campanha e o envio efetivo (p50 e p95), vazão por minuto e
          campanhas paradas — últimos 30 dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`dl-sk-${i}`} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma campanha enviada nos últimos 30 dias.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Enviados</p>
                <p className="text-lg font-semibold">{summary.sent}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Pendentes / falhas</p>
                <p className="text-lg font-semibold">
                  {summary.pending} / {summary.failed}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Pior p95</p>
                <p className="text-lg font-semibold">{formatDuration(summary.worstP95Seconds)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-3 w-3" aria-hidden />
                  Vazão média
                </p>
                <p className="text-lg font-semibold">{summary.avgThroughputPerMinute}/min</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead className="text-right">Conclusão</TableHead>
                  <TableHead className="text-right">p50</TableHead>
                  <TableHead className="text-right">p95</TableHead>
                  <TableHead className="text-right">Vazão</TableHead>
                  <TableHead className="text-right">Falhas</TableHead>
                  <TableHead className="text-right">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const health = classifyDelivery(r);
                  const meta = HEALTH_META[health];
                  return (
                    <TableRow key={r.job_id}>
                      <TableCell className="max-w-[280px]">
                        <span className="block truncate">{campaignLabel(r.prompt)}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.created_at
                            ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {completionRate(r)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDuration(r.p50_latency_seconds)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDuration(r.p95_latency_seconds)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.throughput_per_minute}/min
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{failureRate(r)}%</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
});
