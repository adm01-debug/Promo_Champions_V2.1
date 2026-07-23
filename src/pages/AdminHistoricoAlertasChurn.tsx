import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChurnHistoryChart } from '@/components/admin/churn/ChurnHistoryChart';
import { useChurnPeriodPreference } from '@/hooks/bi/useChurnPeriodPreference';

type Level = 'low' | 'medium' | 'high' | 'critical' | 'all';

interface Row {
  id: string;
  user_id: string;
  title: string;
  message: string;
  priority: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface SalesRow {
  id: string;
  name: string;
}

const LEVEL_LABEL: Record<Exclude<Level, 'all'>, string> = {
  low: 'Baixo',
  medium: 'Moderado',
  high: 'Alto',
  critical: 'Crítico',
};

const LEVEL_TONE: Record<Exclude<Level, 'all'>, string> = {
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

const PAGE_SIZE = 25;

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const AdminHistoricoAlertasChurn = () => {
  const [level, setLevel] = React.useState<Level>('all');
  const [salespersonId, setSalespersonId] = React.useState<string>('all');
  const [from, setFrom] = React.useState<string>(
    format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  );
  const [to, setTo] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [level, salespersonId, from, to]);

  const { data: salespeople } = useQuery({
    queryKey: ['salespeople-mini'],
    queryFn: async (): Promise<SalesRow[]> => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data ?? []) as SalesRow[];
    },
    staleTime: 5 * 60_000,
  });

  const salespersonMap = React.useMemo(() => {
    const m = new Map<string, string>();
    (salespeople ?? []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [salespeople]);

  const buildQuery = React.useCallback(
    (opts?: { count?: 'exact'; range?: [number, number]; limit?: number }) => {
      let q = supabase
        .from('notifications')
        .select(
          'id, user_id, title, message, priority, metadata, created_at',
          opts?.count ? { count: opts.count } : undefined,
        )
        .eq('type', 'churn_alert')
        .gte('created_at', new Date(from + 'T00:00:00').toISOString())
        .lte('created_at', new Date(to + 'T23:59:59').toISOString())
        .order('created_at', { ascending: false });
      if (level !== 'all') q = q.eq('metadata->>level', level);
      if (salespersonId !== 'all') q = q.eq('user_id', salespersonId);
      if (opts?.range) q = q.range(opts.range[0], opts.range[1]);
      else if (opts?.limit) q = q.limit(opts.limit);
      return q;
    },
    [from, to, level, salespersonId],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['churn-history', { level, salespersonId, from, to, page }],
    queryFn: async () => {
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const { data, error, count } = await buildQuery({ count: 'exact', range: [start, end] });
      if (error) throw error;
      return { rows: (data ?? []) as Row[], total: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = data?.rows ?? [];

  const handleExport = async () => {
    try {
      toast.loading('Gerando CSV...', { id: 'csv' });
      const { data, error } = await buildQuery({ limit: 5000 });
      if (error) throw error;
      const list = (data ?? []) as Row[];
      const header = [
        'data_hora',
        'vendedor',
        'cliente',
        'nivel',
        'prioridade',
        'dias_sem_comprar',
        'media_cliente_dias',
        'limite_dias',
        'titulo',
        'mensagem',
      ];
      const lines = list.map((r) => {
        const m = (r.metadata ?? {}) as Record<string, unknown>;
        return [
          format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
          salespersonMap.get(r.user_id) ?? r.user_id,
          m.client_name ?? '',
          m.level ?? '',
          r.priority,
          m.days_since ?? '',
          m.expected_interval_days ?? '',
          m.threshold_days ?? '',
          r.title,
          r.message,
        ]
          .map(csvEscape)
          .join(';');
      });
      const csv = '\uFEFF' + [header.join(';'), ...lines].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historico-alertas-churn-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`CSV exportado (${list.length} registros)`, { id: 'csv' });
    } catch (e) {
      toast.error(`Falha ao exportar: ${(e as Error).message}`, { id: 'csv' });
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Histórico de Alertas de Churn | Admin</title>
        <meta name="description" content="Histórico paginado dos alertas de churn disparados" />
      </Helmet>

      <div className="p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Histórico de Alertas de Churn
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os alertas disparados, com filtros e exportação CSV.
            </p>
          </div>
          <Button onClick={handleExport} disabled={isFetching || rows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </header>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="filter-level" className="text-xs">Nível</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
                <SelectTrigger id="filter-level" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Moderado</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-seller" className="text-xs">Vendedor</Label>
              <Select value={salespersonId} onValueChange={setSalespersonId}>
                <SelectTrigger id="filter-seller" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(salespeople ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-from" className="text-xs">De</Label>
              <Input
                id="filter-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter-to" className="text-xs">Até</Label>
              <Input
                id="filter-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <ChurnHistoryChart from={from} to={to} level={level} salespersonId={salespersonId} />

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Vendedor</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Nível</th>
                  <th className="text-right px-4 py-3">Dias</th>
                  <th className="text-right px-4 py-3">Média</th>
                  <th className="text-right px-4 py-3">Limite</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={7} className="px-4 py-3">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      Nenhum alerta encontrado no período/filtro selecionado.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const m = (r.metadata ?? {}) as Record<string, unknown>;
                    const lvl = (m.level as Exclude<Level, 'all'>) ?? 'medium';
                    return (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs">
                          {format(new Date(r.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-2.5">
                          {salespersonMap.get(r.user_id) ?? (
                            <span className="text-muted-foreground text-xs">
                              {r.user_id.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {(m.client_name as string) ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={LEVEL_TONE[lvl]}>
                            {LEVEL_LABEL[lvl]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs">
                          {(m.days_since as number) ?? 0}d
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs">
                          {(m.expected_interval_days as number) > 0
                            ? `${m.expected_interval_days}d`
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs">
                          {(m.threshold_days as number) > 0
                            ? `${m.threshold_days}d`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">
              {total.toLocaleString('pt-BR')} alertas · Página {page + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default AdminHistoricoAlertasChurn;
