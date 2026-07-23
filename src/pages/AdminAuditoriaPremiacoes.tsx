import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, CheckCircle2, XCircle, Clock, Wallet, Download, LayoutList, Layers } from 'lucide-react';
import {
  useCommissionBonusAwards,
  useUpdateAwardStatus,
  useDeleteAward,
  type AwardStatus,
  type AwardWithRefs,
} from '@/hooks/useCommissionBonusAwards';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

const statusMeta: Record<AwardStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  paid: { label: 'Pago', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border' },
};

type ViewMode = 'detailed' | 'consolidated';

interface ConsolidatedRow {
  salesperson_id: string;
  salesperson_name: string;
  totalCount: number;
  pendingSum: number;
  paidSum: number;
  cancelledSum: number;
  totalSum: number;
  lastAt: string;
}

function csvEscape(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[";,\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, header: string[], rows: (string | number | null)[][]) {
  const bom = '\uFEFF';
  const csv =
    bom +
    [header, ...rows]
      .map((r) => r.map(csvEscape).join(';'))
      .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminAuditoriaPremiacoes() {
  const [statusFilter, setStatusFilter] = useState<AwardStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [periodFilter, setPeriodFilter] = useState<string>('all'); // 'all' | 'YYYY-MM'
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all'); // 'all' | id
  const { data: rawAwards = [], isLoading } = useCommissionBonusAwards({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const updateStatus = useUpdateAwardStatus();
  const remove = useDeleteAward();
  const qc = useQueryClient();

  // Realtime — mantém a lista sincronizada e notifica novas conquistas
  useEffect(() => {
    const channel = supabase
      .channel('commission_bonus_awards_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commission_bonus_awards' },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['commission-bonus-awards'] });
          if (payload.eventType === 'INSERT') {
            const row = payload.new as { computed_amount?: number } | null;
            const amount = Number(row?.computed_amount ?? 0);
            toast.success('Nova premiação conquistada', {
              description: amount ? brl(amount) : undefined,
            });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Períodos únicos existentes (YYYY-MM) para o filtro
  const periodOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of rawAwards) set.add(a.period_month.slice(0, 7));
    return Array.from(set).sort().reverse();
  }, [rawAwards]);

  // Vendedores únicos para o filtro
  const salespersonOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of rawAwards) {
      if (!map.has(a.salesperson_id)) {
        map.set(a.salesperson_id, a.salesperson_name ?? '—');
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [rawAwards]);

  // Aplica filtros de período e vendedor localmente
  const awards = useMemo(() => {
    return rawAwards.filter((a) => {
      if (periodFilter !== 'all' && a.period_month.slice(0, 7) !== periodFilter) return false;
      if (salespersonFilter !== 'all' && a.salesperson_id !== salespersonFilter) return false;
      return true;
    });
  }, [rawAwards, periodFilter, salespersonFilter]);

  const kpis = useMemo(() => {
    const total = awards.reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    const pending = awards.filter((a) => a.status === 'pending');
    const pendingSum = pending.reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    const paidSum = awards
      .filter((a) => a.status === 'paid')
      .reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    return { total, pendingCount: pending.length, pendingSum, paidSum };
  }, [awards]);

  const consolidated = useMemo<ConsolidatedRow[]>(() => {
    const map = new Map<string, ConsolidatedRow>();
    for (const a of awards) {
      const key = a.salesperson_id;
      const amount = Number(a.computed_amount || 0);
      const current = map.get(key) ?? {
        salesperson_id: key,
        salesperson_name: a.salesperson_name ?? '—',
        totalCount: 0,
        pendingSum: 0,
        paidSum: 0,
        cancelledSum: 0,
        totalSum: 0,
        lastAt: a.awarded_at,
      };
      current.totalCount += 1;
      current.totalSum += amount;
      if (a.status === 'pending') current.pendingSum += amount;
      else if (a.status === 'paid') current.paidSum += amount;
      else if (a.status === 'cancelled') current.cancelledSum += amount;
      if (a.awarded_at > current.lastAt) current.lastAt = a.awarded_at;
      map.set(key, current);
    }
    return Array.from(map.values()).sort((a, b) => b.totalSum - a.totalSum);
  }, [awards]);

  const drillDownToSalesperson = (id: string) => {
    setSalespersonFilter(id);
    setViewMode('detailed');
  };

  const handleExport = () => {
    if (awards.length === 0) {
      toast.info('Nenhum registro para exportar');
      return;
    }
    const stamp = format(new Date(), 'yyyyMMdd-HHmm');
    if (viewMode === 'consolidated') {
      downloadCsv(
        `premiacoes-consolidado-${stamp}.csv`,
        ['Vendedor', 'Registros', 'Pendente (R$)', 'Pago (R$)', 'Cancelado (R$)', 'Total (R$)', 'Ultima conquista'],
        consolidated.map((r) => [
          r.salesperson_name,
          r.totalCount,
          r.pendingSum.toFixed(2),
          r.paidSum.toFixed(2),
          r.cancelledSum.toFixed(2),
          r.totalSum.toFixed(2),
          format(parseISO(r.lastAt), 'yyyy-MM-dd HH:mm'),
        ]),
      );
    } else {
      downloadCsv(
        `premiacoes-detalhado-${stamp}.csv`,
        ['Vendedor', 'Bonus', 'Periodo', 'Tipo', 'Valor', 'Status', 'Concedido em', 'Pago em'],
        awards.map((a: AwardWithRefs) => [
          a.salesperson_name ?? '',
          a.bonus_name ?? '',
          format(parseISO(a.period_month), 'yyyy-MM'),
          a.bonus_kind,
          Number(a.computed_amount).toFixed(2),
          statusMeta[a.status].label,
          format(parseISO(a.awarded_at), 'yyyy-MM-dd HH:mm'),
          a.paid_at ? format(parseISO(a.paid_at), 'yyyy-MM-dd HH:mm') : '',
        ]),
      );
    }
    toast.success('CSV exportado');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoria de Premiações</h1>
            <p className="text-sm text-muted-foreground">
              Histórico de bônus concedidos, controle de pagamento e cancelamentos.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border bg-background/60 p-0.5 h-8">
            <Button
              size="sm"
              variant={viewMode === 'detailed' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('detailed')}
            >
              <LayoutList className="h-3.5 w-3.5 mr-1" /> Detalhado
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'consolidated' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('consolidated')}
            >
              <Layers className="h-3.5 w-3.5 mr-1" /> Consolidado
            </Button>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as AwardStatus | 'all')}
          >
            <SelectTrigger className="w-44 h-8">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              {periodOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {format(parseISO(`${p}-01`), "MMM/yy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger className="w-52 h-8">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {salespersonOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar CSV
          </Button>
        </div>
      </header>

      {(salespersonFilter !== 'all' || periodFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {periodFilter !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Período: {format(parseISO(`${periodFilter}-01`), "MMM/yy", { locale: ptBR })}
              <button
                type="button"
                className="ml-1 opacity-60 hover:opacity-100"
                onClick={() => setPeriodFilter('all')}
                aria-label="Remover filtro de período"
              >×</button>
            </Badge>
          )}
          {salespersonFilter !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Vendedor: {salespersonOptions.find((s) => s.id === salespersonFilter)?.name ?? '—'}
              <button
                type="button"
                className="ml-1 opacity-60 hover:opacity-100"
                onClick={() => setSalespersonFilter('all')}
                aria-label="Remover filtro de vendedor"
              >×</button>
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => { setPeriodFilter('all'); setSalespersonFilter('all'); }}
          >
            Limpar tudo
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total registrado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black tabular-nums">{brl(kpis.total)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Pendentes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400">
              {brl(kpis.pendingSum)}
            </p>
            <p className="text-[11px] text-muted-foreground">{kpis.pendingCount} registro(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Pago</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
              {brl(kpis.paidSum)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">
            {viewMode === 'consolidated' ? 'Vendedores' : 'Registros exibidos'}
          </CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums">
              {viewMode === 'consolidated' ? consolidated.length : awards.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {viewMode === 'consolidated' ? 'Consolidado por vendedor' : 'Registros'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : awards.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhum registro de premiação para os filtros selecionados.
            </div>
          ) : viewMode === 'consolidated' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Registros</TableHead>
                    <TableHead className="text-right">Pendente</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Cancelado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Última conquista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidated.map((r) => (
                    <TableRow key={r.salesperson_id}>
                      <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.totalCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">{brl(r.pendingSum)}</TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">{brl(r.paidSum)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{brl(r.cancelledSum)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{brl(r.totalSum)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(parseISO(r.lastAt), "d MMM yyyy", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Bônus</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Concedido em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awards.map((a) => {
                    const period = format(parseISO(a.period_month), "MMM/yy", { locale: ptBR });
                    const awardedAt = format(parseISO(a.awarded_at), "d MMM yyyy", { locale: ptBR });
                    const isPaid = a.status === 'paid';
                    const isCancelled = a.status === 'cancelled';
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.salesperson_name ?? '—'}</TableCell>
                        <TableCell>{a.bonus_name ?? '—'}</TableCell>
                        <TableCell className="capitalize">{period}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {a.bonus_kind === 'fixed'
                            ? brl(Number(a.computed_amount))
                            : `${Number(a.computed_amount).toFixed(2)}%`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusMeta[a.status].className}>
                            {statusMeta[a.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{awardedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {!isPaid && !isCancelled && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ id: a.id, status: 'paid' })}
                                disabled={updateStatus.isPending}
                              >
                                <Wallet className="h-3.5 w-3.5 mr-1" /> Marcar pago
                              </Button>
                            )}
                            {isPaid && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus.mutate({ id: a.id, status: 'pending' })}
                                disabled={updateStatus.isPending}
                              >
                                <Clock className="h-3.5 w-3.5 mr-1" /> Reabrir
                              </Button>
                            )}
                            {!isCancelled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus.mutate({ id: a.id, status: 'cancelled' })}
                                disabled={updateStatus.isPending}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Remover este registro definitivamente?')) {
                                  remove.mutate(a.id);
                                }
                              }}
                              disabled={remove.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 rotate-45" />
                            </Button>
                          </div>
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
    </div>
  );
}
