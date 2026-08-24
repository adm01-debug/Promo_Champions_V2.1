import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LifeBuoy } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RECOVERY_RISK_THRESHOLD,
  campaignLabel,
  failureTypeLabel,
  formatRecoveryDuration,
  recoveryHealth,
  recoveryHealthVariant,
  sumRecovery,
} from '@/hooks/email/recoveryRateHelpers';
import {
  useCampaignRecoveryRates,
  useRecoveryByFailureType,
} from '@/hooks/email/useRecoveryRates';

const WINDOW_DAYS = 90;

interface StatProps {
  label: string;
  value: string;
}

const Stat = React.memo(function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
});

/**
 * Taxa de recuperação após reenvio: compara o status antes (falhou) e depois
 * (entregue) de cada rascunho, por campanha e por tipo de falha.
 */
export const RecoveryRateCard = React.memo(function RecoveryRateCard() {
  const campaigns = useCampaignRecoveryRates(WINDOW_DAYS);
  const types = useRecoveryByFailureType(WINDOW_DAYS);

  const campaignRows = useMemo(
    () =>
      [...(campaigns.data ?? [])]
        .sort((a, b) => a.recovery_rate - b.recovery_rate || b.failed_total - a.failed_total)
        .slice(0, 10),
    [campaigns.data],
  );

  const typeRows = useMemo(
    () => [...(types.data ?? [])].sort((a, b) => b.failed_total - a.failed_total),
    [types.data],
  );

  const totals = useMemo(() => sumRecovery(types.data ?? []), [types.data]);

  if (campaigns.isLoading || types.isLoading) return <Skeleton className="h-80 rounded-xl" />;

  if (campaigns.isError || types.isError) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Não foi possível carregar as métricas de recuperação após reenvio.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-primary" aria-hidden />
          Recuperação após reenvio
        </CardTitle>
        <CardDescription>
          Últimos {WINDOW_DAYS} dias. Considera apenas rascunhos que falharam ao menos uma vez:
          &quot;recuperado&quot; significa entregue depois da falha (robô ou reenvio manual). Falhas
          permanentes (supressão, endereço inválido) não são cobradas — meta de{' '}
          {RECOVERY_RISK_THRESHOLD}% vale para falhas transitórias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Falharam" value={String(totals.failedTotal)} />
          <Stat label="Recuperados" value={String(totals.recoveredCount)} />
          <Stat label="Ainda em falha" value={String(totals.stillFailing)} />
          <Stat label="Taxa de recuperação" value={`${totals.recoveryRate.toFixed(2)}%`} />
        </div>

        {totals.failedTotal === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma falha registrada no período — não há recuperação a medir.
          </p>
        ) : (
          <Tabs defaultValue="tipo">
            <TabsList className="bg-background/60 h-8">
              <TabsTrigger value="tipo" className="h-6 text-xs">
                Por tipo de falha
              </TabsTrigger>
              <TabsTrigger value="campanha" className="h-6 text-xs">
                Por campanha
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tipo" className="pt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de falha</TableHead>
                    <TableHead className="w-24 text-right">Falhas</TableHead>
                    <TableHead className="w-28 text-right">Recuperados</TableHead>
                    <TableHead className="w-28 text-right">Tempo médio</TableHead>
                    <TableHead className="w-28 text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeRows.map((row) => {
                    const health = recoveryHealth(row.failure_type, row.recovery_rate);
                    return (
                      <TableRow key={row.failure_type}>
                        <TableCell className="font-medium">
                          {failureTypeLabel(row.failure_type)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.failed_total}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.recovered_count}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatRecoveryDuration(row.avg_recovery_minutes)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={recoveryHealthVariant(health)}>
                            {row.recovery_rate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="campanha" className="pt-3">
              {campaignRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma campanha com falhas no período.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead className="w-24">Data</TableHead>
                      <TableHead className="w-20 text-right">Falhas</TableHead>
                      <TableHead className="w-24 text-right">Recup.</TableHead>
                      <TableHead className="w-24 text-right">Em falha</TableHead>
                      <TableHead className="w-24 text-right">Taxa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignRows.map((row) => (
                      <TableRow key={row.job_id}>
                        <TableCell className="font-medium">{campaignLabel(row.prompt)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(row.created_at), 'dd/MM/yy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.failed_total}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.recovered_count}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.still_failing}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              row.recovery_rate >= RECOVERY_RISK_THRESHOLD
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {row.recovery_rate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
});
