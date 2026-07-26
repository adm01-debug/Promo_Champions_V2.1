import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCampaignHealthAlerts,
  type CampaignHealthAlert,
} from '@/hooks/email/useCampaignHealthAlerts';

const TYPE_LABEL: Record<CampaignHealthAlert['alert_type'], string> = {
  opt_out_rate: 'Descadastro alto',
  failure_rate: 'Falhas de envio',
  stalled: 'Campanha parada',
};

const SEVERITY_VARIANT: Record<
  CampaignHealthAlert['severity'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  info: 'outline',
  warning: 'secondary',
  critical: 'destructive',
};

/** Histórico dos alertas automáticos gerados pelo monitor de campanhas. */
export const CampaignHealthAlertsCard = React.memo(function CampaignHealthAlertsCard() {
  const { data, isLoading } = useCampaignHealthAlerts(20);
  const alerts = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" aria-hidden />
          Alertas automáticos de campanha
        </CardTitle>
        <CardDescription>
          Verificação a cada 30 minutos: descadastro acima do limite, falhas de envio e campanhas
          paradas — com janela de silêncio para evitar repetição.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`cha-sk-${i}`} className="h-14 w-full rounded-lg" />
          ))
        ) : alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum alerta registrado. Suas campanhas estão dentro dos limites.
          </p>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(a.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={SEVERITY_VARIANT[a.severity]}>{TYPE_LABEL[a.alert_type]}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
});
