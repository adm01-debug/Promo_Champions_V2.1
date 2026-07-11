/**
 * AdminWebVitalsPage — QUAL-01
 *
 * Consome fn_admin_web_vitals_p75() e destaca métricas P75 acima do budget
 * (LCP > 2.5s, CLS > 0.1, INP > 200ms). Agrupa por rota + device.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Row {
  day: string;
  route: string;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  metric_name: string;
  samples: number;
  p50: number | null;
  p75: number | null;
  p95: number | null;
  budget_p75: number | null;
}

function formatValue(metric: string, value: number | null): string {
  if (value === null || value === undefined) return '—';
  if (metric === 'CLS') return value.toFixed(3);
  return `${value.toFixed(0)} ms`;
}

function ratingFor(metric: string, p75: number | null, budget: number | null): 'good' | 'poor' | 'unknown' {
  if (p75 === null || budget === null) return 'unknown';
  return p75 <= budget ? 'good' : 'poor';
}

export default function AdminWebVitalsPage() {
  const [device, setDevice] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'web-vitals-p75'],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc('fn_admin_web_vitals_p75' as never);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      if (device !== 'all' && r.device_type !== device) return false;
      if (search && !r.route.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, device, search]);

  // Latest day summary
  const summary = useMemo(() => {
    if (!data) return null;
    const latestDay = data[0]?.day;
    if (!latestDay) return null;
    const dayRows = data.filter((r) => r.day === latestDay);
    const byMetric = new Map<string, { good: number; poor: number }>();
    for (const r of dayRows) {
      const bucket = byMetric.get(r.metric_name) ?? { good: 0, poor: 0 };
      const rating = ratingFor(r.metric_name, r.p75, r.budget_p75);
      if (rating === 'good') bucket.good += 1;
      else if (rating === 'poor') bucket.poor += 1;
      byMetric.set(r.metric_name, bucket);
    }
    return { day: latestDay, byMetric: Array.from(byMetric.entries()) };
  }, [data]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Web Vitals P75</h1>
        <p className="text-sm text-muted-foreground">
          Métricas de performance do frontend agregadas em 30 dias. Alerta quando o P75 exceder o budget
          (LCP 2500ms, CLS 0.1, INP 200ms, FCP 1800ms, TTFB 800ms).
        </p>
      </header>

      {isError && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Erro ao carregar métricas: {(error as Error)?.message ?? 'desconhecido'}
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {summary.byMetric.map(([metric, counts]) => (
            <Card key={metric}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-500">{counts.good}</span>
                  <span className="text-xs text-muted-foreground">rotas ok</span>
                </div>
                {counts.poor > 0 && (
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-destructive">{counts.poor}</span>
                    <span className="text-xs text-muted-foreground">acima do budget</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Detalhe por rota / device / métrica</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar rota…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="unknown">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="max-h-[560px] overflow-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Métrica</TableHead>
                    <TableHead className="text-right">Samples</TableHead>
                    <TableHead className="text-right">P50</TableHead>
                    <TableHead className="text-right">P75</TableHead>
                    <TableHead className="text-right">P95</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, i) => {
                    const rating = ratingFor(r.metric_name, r.p75, r.budget_p75);
                    return (
                      <TableRow key={`${r.day}-${r.route}-${r.device_type}-${r.metric_name}-${i}`}>
                        <TableCell className="whitespace-nowrap">{r.day}</TableCell>
                        <TableCell className="max-w-xs truncate font-mono text-xs">{r.route}</TableCell>
                        <TableCell>{r.device_type}</TableCell>
                        <TableCell className="font-medium">{r.metric_name}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.samples}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatValue(r.metric_name, r.p50)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatValue(r.metric_name, r.p75)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatValue(r.metric_name, r.p95)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatValue(r.metric_name, r.budget_p75)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={rating === 'good' ? 'default' : rating === 'poor' ? 'destructive' : 'secondary'}
                          >
                            {rating === 'good' ? 'Meta' : rating === 'poor' ? 'Acima' : 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhuma métrica no filtro atual.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
