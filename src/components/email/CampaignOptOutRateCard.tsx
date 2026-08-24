import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Megaphone } from 'lucide-react';

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
import {
  OPT_OUT_RISK_THRESHOLD,
  useCampaignOptOutRates,
} from '@/hooks/email/useCampaignOptOutRates';

/** Trunca o prompt da campanha para exibição em tabela. */
function campaignLabel(prompt: string): string {
  const clean = (prompt ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Campanha sem descrição';
  return clean.length > 70 ? `${clean.slice(0, 70)}…` : clean;
}

/** Ranking de campanhas de e-mail por taxa de descadastro (últimos 90 dias). */
export const CampaignOptOutRateCard = React.memo(function CampaignOptOutRateCard() {
  const { data, isLoading, isError } = useCampaignOptOutRates(90);

  const rows = useMemo(
    () =>
      [...(data ?? [])]
        .filter((r) => r.sent_count > 0)
        .sort((a, b) => b.opt_out_rate - a.opt_out_rate || b.sent_count - a.sent_count)
        .slice(0, 10),
    [data],
  );

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  if (isError) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Não foi possível carregar a taxa de descadastro por campanha.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" aria-hidden />
          Descadastro por campanha
        </CardTitle>
        <CardDescription>
          Últimos 90 dias. Descadastros atribuídos apenas quando ocorrem após o envio. Alerta acima
          de {OPT_OUT_RISK_THRESHOLD}%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma campanha com envios registrados no período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead className="w-28">Data</TableHead>
                <TableHead className="w-24 text-right">Enviados</TableHead>
                <TableHead className="w-24 text-right">Opt-outs</TableHead>
                <TableHead className="w-28 text-right">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const risky = row.opt_out_rate >= OPT_OUT_RISK_THRESHOLD;
                return (
                  <TableRow key={row.job_id}>
                    <TableCell className="font-medium">{campaignLabel(row.prompt)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(row.created_at), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.sent_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.opted_out_count}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={risky ? 'destructive' : 'secondary'} className="gap-1">
                        {risky && <AlertTriangle className="h-3 w-3" aria-hidden />}
                        {row.opt_out_rate.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
});
