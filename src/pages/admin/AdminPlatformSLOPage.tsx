/**
 * AdminPlatformSLOPage — OBS-02
 *
 * Consome fn_admin_platform_slo() para exibir os SLOs consolidados dos últimos
 * 30 dias: webhook dispatch, callbacks V4, estabilidade de circuit breakers e
 * taxa livre de erros. Admin-only (a RPC valida via has_role()).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SLORow {
  day: string;
  webhook_success_ratio: number | null;
  webhook_success_target: number;
  webhook_sent_ok: number;
  webhook_failed: number;
  v4_callback_success_ratio: number | null;
  v4_callback_success_target: number;
  v4_callback_ok: number;
  v4_callback_failed: number;
  circuit_stability_ratio: number | null;
  circuit_stability_target: number;
  circuits_opened: number;
  circuit_events_total: number;
  error_free_ratio: number | null;
  error_free_target: number;
  critical_error_count: number;
  total_log_count: number;
}

interface SLODefinition {
  key: 'webhook' | 'v4' | 'circuit' | 'error';
  label: string;
  ratioField: keyof SLORow;
  targetField: keyof SLORow;
  okField: keyof SLORow;
  koField: keyof SLORow;
  color: string;
}

const SLOS: SLODefinition[] = [
  {
    key: 'webhook',
    label: 'Webhook Dispatch',
    ratioField: 'webhook_success_ratio',
    targetField: 'webhook_success_target',
    okField: 'webhook_sent_ok',
    koField: 'webhook_failed',
    color: 'hsl(var(--primary))',
  },
  {
    key: 'v4',
    label: 'V4 Callbacks',
    ratioField: 'v4_callback_success_ratio',
    targetField: 'v4_callback_success_target',
    okField: 'v4_callback_ok',
    koField: 'v4_callback_failed',
    color: 'hsl(142 76% 36%)',
  },
  {
    key: 'circuit',
    label: 'Circuit Stability',
    ratioField: 'circuit_stability_ratio',
    targetField: 'circuit_stability_target',
    okField: 'circuit_events_total',
    koField: 'circuits_opened',
    color: 'hsl(48 96% 53%)',
  },
  {
    key: 'error',
    label: 'Error-Free',
    ratioField: 'error_free_ratio',
    targetField: 'error_free_target',
    okField: 'total_log_count',
    koField: 'critical_error_count',
    color: 'hsl(346 87% 43%)',
  },
];

function pct(n: number | null): string {
  if (n === null || n === undefined) return '—';
  return `${(n * 100).toFixed(2)}%`;
}

function statusFor(ratio: number | null, target: number): 'meta' | 'abaixo' | 'sem-dados' {
  if (ratio === null || ratio === undefined) return 'sem-dados';
  return ratio >= target ? 'meta' : 'abaixo';
}

export default function AdminPlatformSLOPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'platform-slo'],
    queryFn: async (): Promise<SLORow[]> => {
      const { data, error } = await supabase.rpc('fn_admin_platform_slo' as never);
      if (error) throw error;
      return (data ?? []) as SLORow[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((r) => ({
        day: format(parseISO(r.day), 'dd/MM', { locale: ptBR }),
        Webhook: r.webhook_success_ratio !== null ? Number((r.webhook_success_ratio * 100).toFixed(2)) : null,
        V4: r.v4_callback_success_ratio !== null ? Number((r.v4_callback_success_ratio * 100).toFixed(2)) : null,
        Circuit: r.circuit_stability_ratio !== null ? Number((r.circuit_stability_ratio * 100).toFixed(2)) : null,
        Errors: r.error_free_ratio !== null ? Number((r.error_free_ratio * 100).toFixed(2)) : null,
      }));
  }, [data]);

  const latest = data?.[0];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">SLO da Plataforma</h1>
        <p className="text-sm text-muted-foreground">
          Consolidação dos SLOs operacionais dos últimos 30 dias. Atualiza a cada 60 s.
        </p>
      </header>

      {isError && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Erro ao carregar SLOs: {(error as Error)?.message ?? 'desconhecido'}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SLOS.map((slo) => {
          const ratio = latest ? (latest[slo.ratioField] as number | null) : null;
          const target = latest ? (latest[slo.targetField] as number) : 0.99;
          const ok = latest ? (latest[slo.okField] as number) : 0;
          const ko = latest ? (latest[slo.koField] as number) : 0;
          const status = statusFor(ratio, target);
          return (
            <Card key={slo.key}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <span>{slo.label}</span>
                  <Badge
                    variant={status === 'meta' ? 'default' : status === 'abaixo' ? 'destructive' : 'secondary'}
                  >
                    {status === 'meta' ? 'Meta' : status === 'abaixo' ? 'Abaixo' : 'Sem dados'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" style={{ color: slo.color }}>
                      {pct(ratio)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      alvo {pct(target)} · hoje: {ok} ok / {ko} falhas
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendência 30 dias (%)</CardTitle>
        </CardHeader>
        <CardContent className="h-[360px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <ReferenceLine y={99} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label="99%" />
                <Line type="monotone" dataKey="Webhook" stroke="hsl(var(--primary))" dot={false} connectNulls />
                <Line type="monotone" dataKey="V4" stroke="hsl(142 76% 36%)" dot={false} connectNulls />
                <Line type="monotone" dataKey="Circuit" stroke="hsl(48 96% 53%)" dot={false} connectNulls />
                <Line type="monotone" dataKey="Errors" stroke="hsl(346 87% 43%)" dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como interpretar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Webhook Dispatch:</strong> proporção de entregas bem-sucedidas em{' '}
            <code>winloss_webhook_deliveries</code>. Meta 99%.
          </p>
          <p>
            <strong className="text-foreground">V4 Callbacks:</strong> proporção de callbacks confirmados vs.
            falhas/exauridos em <code>v4_callback_metrics</code>. Meta 99%.
          </p>
          <p>
            <strong className="text-foreground">Circuit Stability:</strong> 1 − (aberturas / eventos totais) em{' '}
            <code>circuit_breaker_events</code>. Meta 95%.
          </p>
          <p>
            <strong className="text-foreground">Error-Free:</strong> 1 − (erros críticos / total de logs) em{' '}
            <code>error_logs</code>. Meta 99%.
          </p>
          <p className="text-xs">
            Fonte: view <code>public.v_platform_slo</code> · RPC <code>fn_admin_platform_slo()</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
