import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trophy, ChevronLeft, ChevronRight, CalendarDays, Filter, X, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMyBonusAwards, useMyBonusAwardsRealtime, fetchAllMyBonusAwards } from '@/hooks/useMyBonusAwards';
import type { AwardStatus } from '@/hooks/useCommissionBonusAwards';
import { buildCsv, downloadCsv } from '@/lib/csv';

const PAGE_SIZE = 10;

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusConfig: Record<
  AwardStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  paid: { label: 'Paga', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
};

/** Lista dos últimos 12 meses em YYYY-MM. */
function last12Months(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ value, label: format(d, "MMMM 'de' yyyy", { locale: ptBR }) });
  }
  return out;
}

export default function MinhasPremiacoes() {
  const [status, setStatus] = useState<AwardStatus | 'all'>('all');
  const [period, setPeriod] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  useMyBonusAwardsRealtime();

  const { data, isLoading, isError, error } = useMyBonusAwards({
    status,
    period,
    page,
    pageSize: PAGE_SIZE,
  });

  const months = useMemo(last12Months, []);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const kpis = useMemo(() => {
    const rows = data?.rows ?? [];
    const paid = rows.filter((r) => r.status === 'paid');
    const pending = rows.filter((r) => r.status === 'pending');
    return {
      totalPaid: paid.reduce((s, r) => s + Number(r.computed_amount || 0), 0),
      totalPending: pending.reduce((s, r) => s + Number(r.computed_amount || 0), 0),
      countPaid: paid.length,
      countPending: pending.length,
    };
  }, [data]);

  const resetFilters = () => {
    setStatus('all');
    setPeriod('all');
    setPage(0);
  };

  const hasFilters = status !== 'all' || period !== 'all';

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows = await fetchAllMyBonusAwards({ status, period });
      if (rows.length === 0) {
        toast.info('Nenhuma premiação para exportar com os filtros atuais.');
        return;
      }
      const csv = buildCsv(rows, [
        { header: 'Premiação', value: (r) => r.bonus_name ?? '' },
        { header: 'Período', value: (r) => format(new Date(r.period_month), 'MM/yyyy') },
        { header: 'Valor (BRL)', value: (r) => Number(r.computed_amount || 0).toFixed(2).replace('.', ',') },
        { header: 'Status', value: (r) => statusConfig[r.status]?.label ?? r.status },
        { header: 'Conquistada em', value: (r) => format(new Date(r.awarded_at), 'dd/MM/yyyy HH:mm') },
        { header: 'Paga em', value: (r) => (r.paid_at ? format(new Date(r.paid_at), 'dd/MM/yyyy HH:mm') : '') },
      ]);
      const stamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      downloadCsv(`minhas-premiacoes_${stamp}.csv`, csv);
      toast.success(`Exportadas ${rows.length} premiação(ões).`);
    } catch (err) {
      toast.error(`Falha ao exportar: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Minhas Premiações | Histórico de conquistas</title>
        <meta
          name="description"
          content="Histórico completo das suas premiações conquistadas e pagas, com filtros por status e período."
        />
        <link rel="canonical" href="/minhas-premiacoes" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-page-title">Minhas Premiações</h1>
            <p className="text-sm text-muted-foreground">
              Histórico de conquistas e pagamentos com filtros e atualização em tempo real.
            </p>
          </div>
        </header>

        {/* KPIs (baseados na página atual) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total pago (página)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{brl(kpis.totalPaid)}</div>
              <div className="text-xs text-muted-foreground">{kpis.countPaid} pagamento(s)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                Aguardando pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{brl(kpis.totalPending)}</div>
              <div className="text-xs text-muted-foreground">
                {kpis.countPending} pendente(s)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total no filtro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{data?.total ?? 0}</div>
              <div className="text-xs text-muted-foreground">registro(s)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {page + 1} / {totalPages}
              </div>
              <div className="text-xs text-muted-foreground">
                {PAGE_SIZE} por página
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" /> Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as AwardStatus | 'all');
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[220px]">
              <label className="text-xs text-muted-foreground mb-1 block">Período</label>
              <Select
                value={period}
                onValueChange={(v) => {
                  setPeriod(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                <X className="h-3.5 w-3.5" /> Limpar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-sm text-destructive">
                Erro ao carregar premiações: {error instanceof Error ? error.message : 'desconhecido'}
              </div>
            ) : (data?.rows ?? []).length === 0 ? (
              <div className="p-10 text-center">
                <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma premiação encontrada com os filtros atuais.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Premiação</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conquistada em</TableHead>
                      <TableHead>Paga em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data!.rows.map((row) => {
                      const sc = statusConfig[row.status];
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">
                            {row.bonus_name ?? '—'}
                          </TableCell>
                          <TableCell className="flex items-center gap-1 text-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            {format(new Date(row.period_month), "MMM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {brl(Number(row.computed_amount || 0))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(row.awarded_at), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.paid_at
                              ? format(new Date(row.paid_at), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {(data?.total ?? 0) > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Mostrando {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, data?.total ?? 0)} de {data?.total ?? 0}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
