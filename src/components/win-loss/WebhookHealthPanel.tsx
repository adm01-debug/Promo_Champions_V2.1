import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useWebhookDeliveryStats } from "@/hooks/win-loss/useWebhookDeliveryStats";
import { useWebhookAlerts, activeAlertsBySubscription } from "@/hooks/win-loss/useWebhookAlerts";
import type { RechartsTooltipProps } from "@/types/recharts";
import { cn } from "@/lib/utils";

function rateClasses(rate: number, total: number) {
  if (total === 0) return "text-muted-foreground";
  if (rate >= 95) return "text-success";
  if (rate >= 80) return "text-warning";
  return "text-destructive";
}

function HealthTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { attempt: number; failures: number; total: number };
  return (
    <div className="rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium">Tentativa {p.attempt}</p>
      <p className="text-muted-foreground">
        {p.failures} falha{p.failures === 1 ? "" : "s"} de {p.total} tentativa{p.total === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function WebhookHealthPanel() {
  const { data, isLoading } = useWebhookDeliveryStats();
  const { data: alerts } = useWebhookAlerts();
  const activeBySub = activeAlertsBySubscription(alerts ?? []);
  const degradedCount = activeBySub.size;


  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" aria-hidden />
          Saúde de entregas <span className="text-xs font-normal text-muted-foreground">· últimos 7 dias</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {degradedCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
            <p>
              <strong>{degradedCount}</strong> assinatura{degradedCount === 1 ? "" : "s"} com alerta ativo nos últimos 60 minutos.
              Verifique a lista abaixo para detalhes.
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !data || data.total === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Nenhuma entrega registrada nos últimos 7 dias.
          </p>
        ) : (
          <>
            <div
              className="grid grid-cols-3 gap-2"
              role="img"
              aria-label={`${data.successRate.toFixed(1)}% de sucesso, ${data.failed} falhas em ${data.total} tentativas`}
            >
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Taxa de sucesso</p>
                <p className={cn("text-2xl font-bold", rateClasses(data.successRate, data.total))}>
                  {data.successRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tentativas</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Falhas</p>
                <p className={cn("text-2xl font-bold", data.failed > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {data.failed}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Falhas por tentativa</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.failuresByAttempt} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="attempt"
                    tickFormatter={(v) => `Tentativa ${v}`}
                    className="text-[11px]"
                  />
                  <YAxis allowDecimals={false} className="text-[11px]" />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    content={<HealthTooltip />}
                  />
                  <Bar dataKey="failures" radius={[4, 4, 0, 0]}>
                    {data.failuresByAttempt.map((b) => (
                      <Cell key={b.attempt} fill="hsl(var(--destructive))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
