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
import { Trophy, CheckCircle2, XCircle, Clock, Wallet } from 'lucide-react';
import {
  useCommissionBonusAwards,
  useUpdateAwardStatus,
  useDeleteAward,
  type AwardStatus,
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

export default function AdminAuditoriaPremiacoes() {
  const [statusFilter, setStatusFilter] = useState<AwardStatus | 'all'>('all');
  const { data: awards = [], isLoading } = useCommissionBonusAwards({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const updateStatus = useUpdateAwardStatus();
  const remove = useDeleteAward();

  const kpis = useMemo(() => {
    const total = awards.reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    const pending = awards.filter((a) => a.status === 'pending');
    const pendingSum = pending.reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    const paidSum = awards
      .filter((a) => a.status === 'paid')
      .reduce((acc, a) => acc + Number(a.computed_amount || 0), 0);
    return { total, pendingCount: pending.length, pendingSum, paidSum };
  }, [awards]);

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
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AwardStatus | 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </header>

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
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Registros exibidos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black tabular-nums">{awards.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros</CardTitle>
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
