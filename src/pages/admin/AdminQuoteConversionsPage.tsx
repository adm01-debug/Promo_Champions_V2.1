/**
 * AdminQuoteConversionsPage
 *
 * Painel admin-only para observar as conversões orçamento → venda:
 *  - KPIs: total, sucesso/erro, reused_order, idempotency, latência p50/p95 (30 dias)
 *  - Gráfico diário de sucesso vs erro
 *  - Tabela de histórico (v_quote_conversion_history)
 *  - Consulta de trilha completa por quote_id ou sale_id (RPC fn_admin_conversion_trail)
 *
 * Todas as fontes exigem role admin. RPC/edge function retornam 403 caso contrário.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

interface MetricRow {
  day: string;
  attempts: number;
  successes: number;
  failures: number;
  idempotent_hits: number;
  reused_orders: number;
  success_rate_pct: number | null;
  latency_p50_ms: number | null;
  latency_p95_ms: number | null;
  latency_max_ms: number | null;
}

interface HistoryRow {
  audit_id: string;
  occurred_at: string;
  quote_id: string;
  quote_title: string | null;
  quote_client: string | null;
  sale_id: string | null;
  order_id: string | null;
  order_number: string | null;
  previous_status: string | null;
  new_status: string | null;
  reused_order: boolean;
  idempotent: boolean;
  success: boolean;
  error_code: string | null;
  error_message: string | null;
  latency_ms: number | null;
  request_id: string | null;
  actor_user_id: string | null;
}

function formatMs(v: number | null | undefined) {
  return v == null ? '—' : `${Math.round(v)} ms`;
}

export default function AdminQuoteConversionsPage() {
  const [trailInput, setTrailInput] = useState('');
  const [trailKind, setTrailKind] = useState<'quote_id' | 'sale_id'>('quote_id');
  const [trailData, setTrailData] = useState<unknown>(null);
  const [trailLoading, setTrailLoading] = useState(false);

  const metricsQ = useQuery({
    queryKey: ['admin-conversion-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_quote_conversion_metrics_daily' as never)
        .select('*')
        .limit(30);
      if (error) throw error;
      return (data ?? []) as MetricRow[];
    },
    staleTime: 60_000,
  });

  const historyQ = useQuery({
    queryKey: ['admin-conversion-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_quote_conversion_history' as never)
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as HistoryRow[];
    },
    staleTime: 30_000,
  });

  const kpis = useMemo(() => {
    const rows = metricsQ.data ?? [];
    const attempts = rows.reduce((s, r) => s + (r.attempts ?? 0), 0);
    const successes = rows.reduce((s, r) => s + (r.successes ?? 0), 0);
    const failures = rows.reduce((s, r) => s + (r.failures ?? 0), 0);
    const reused = rows.reduce((s, r) => s + (r.reused_orders ?? 0), 0);
    const idem = rows.reduce((s, r) => s + (r.idempotent_hits ?? 0), 0);
    const rate = attempts ? (successes / attempts) * 100 : null;
    const p50 = rows[0]?.latency_p50_ms ?? null;
    const p95 = rows[0]?.latency_p95_ms ?? null;
    return { attempts, successes, failures, reused, idem, rate, p50, p95 };
  }, [metricsQ.data]);

  async function loadTrail() {
    const value = trailInput.trim();
    if (!value) {
      toast.error('Informe um ID');
      return;
    }
    setTrailLoading(true);
    try {
      const { data, error } = await // eslint-disable-next-line no-restricted-syntax
      (
        supabase.rpc as unknown as (
          fn: string,
          args: Record<string, unknown>
        ) => Promise<{ data: unknown; error: { message: string } | null }>
      )(
        'fn_admin_conversion_trail',
        trailKind === 'quote_id' ? { _quote_id: value } : { _sale_id: value }
      );
      if (error) throw new Error(error.message);
      setTrailData(data);
      toast.success('Trilha carregada');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
      setTrailData(null);
    } finally {
      setTrailLoading(false);
    }
  }

  const chartData = useMemo(
    () =>
      [...(metricsQ.data ?? [])]
        .reverse()
        .map(r => ({ day: r.day, sucesso: r.successes, erro: r.failures })),
    [metricsQ.data]
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Conversões Orçamento → Venda
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Observabilidade da RPC <code>fn_convert_quote_to_sale</code> — sucesso, erro,
          latência e correlação por <code>X-Request-Id</code>.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tentativas (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.attempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.rate == null ? '—' : `${kpis.rate.toFixed(1)}%`}
            </div>
            <div className="text-muted-foreground text-xs">
              {kpis.successes} ok · {kpis.failures} erro
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latência (hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMs(kpis.p50)}</div>
            <div className="text-muted-foreground text-xs">p95: {formatMs(kpis.p95)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reuso / Idempotência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.reused} / {kpis.idem}
            </div>
            <div className="text-muted-foreground text-xs">
              pedidos reusados / chamadas idempotentes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart diário */}
      <Card>
        <CardHeader>
          <CardTitle>Sucesso vs Erro por dia</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 280 }}>
          {metricsQ.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sucesso" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="erro" stackId="a" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Trilha por ID */}
      <Card>
        <CardHeader>
          <CardTitle>Trilha completa por ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={trailKind}
              onChange={e => setTrailKind(e.target.value as 'quote_id' | 'sale_id')}
              className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-sm"
            >
              <option value="quote_id">quote_id</option>
              <option value="sale_id">sale_id</option>
            </select>
            <Input
              value={trailInput}
              onChange={e => setTrailInput(e.target.value)}
              placeholder="UUID"
              className="max-w-md"
            />
            <Button onClick={loadTrail} disabled={trailLoading}>
              {trailLoading ? 'Buscando…' : 'Ver trilha'}
            </Button>
          </div>
          {trailData !== null && (
            <pre className="bg-muted max-h-[500px] overflow-auto rounded-md p-3 text-xs">
              {JSON.stringify(trailData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico (últimas 100 tentativas)</CardTitle>
        </CardHeader>
        <CardContent>
          {historyQ.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Cliente / Título</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Transição</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Latência</TableHead>
                    <TableHead>Request-Id</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(historyQ.data ?? []).map(r => (
                    <TableRow key={r.audit_id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(r.occurred_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{r.quote_client ?? '—'}</div>
                        <div className="text-muted-foreground">
                          {r.quote_title ?? '—'}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {r.order_number ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.previous_status ?? '?'} → {r.new_status ?? '?'}
                      </TableCell>
                      <TableCell className="space-x-1">
                        {r.success ? (
                          <Badge variant="default">ok</Badge>
                        ) : (
                          <Badge variant="destructive">erro</Badge>
                        )}
                        {r.reused_order && <Badge variant="secondary">reused</Badge>}
                        {r.idempotent && <Badge variant="outline">idem</Badge>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatMs(r.latency_ms)}
                      </TableCell>
                      <TableCell
                        className="max-w-[140px] truncate font-mono text-xs"
                        title={r.request_id ?? ''}
                      >
                        {r.request_id ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-xs text-destructive">
                        {r.error_code
                          ? `[${r.error_code}] ${r.error_message ?? ''}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
