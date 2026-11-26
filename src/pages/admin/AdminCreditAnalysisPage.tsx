import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  useCreditAnalysis,
  type CreditOutboxStatus,
  type PendingCreditOrder,
} from '@/hooks/admin/useCreditAnalysis';
import { formatBRL, formatDateTime } from '@/components/orders/orderHelpers';

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

const OUTBOX_LABEL: Record<CreditOutboxStatus, string> = {
  pending: 'Na fila',
  processing: 'Enviando',
  delivered: 'Entregue',
  dead: 'Falhou',
};

function OutboxBadge({ status }: { status: CreditOutboxStatus | null }) {
  if (!status) {
    return (
      <Badge
        variant="destructive"
        title="Nenhum evento de solicitação foi criado para este pedido"
      >
        Não gerado
      </Badge>
    );
  }
  const variant =
    status === 'delivered' ? 'success' : status === 'dead' ? 'destructive' : 'warning';
  return <Badge variant={variant}>{OUTBOX_LABEL[status]}</Badge>;
}

function AdminCreditAnalysisContent() {
  const { data, isLoading, isError, error, refetch, isFetching } = useCreditAnalysis();
  const [detail, setDetail] = useState<PendingCreditOrder | null>(null);

  const orders = data?.orders ?? [];
  const totals = data?.totals;

  return (
    <>
      <Helmet>
        <title>Análise de Crédito | Promo Champions</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-page-title gradient-text">Análise de Crédito</h1>
            <p className="text-muted-foreground mt-1">
              Pedidos da primeira venda parados aguardando o parecer do Financeiro e o
              estado do envio da solicitação.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={Clock}
            label="Aguardando análise"
            value={totals?.awaiting ?? orders.length}
            tone="bg-amber-500/10 text-amber-600"
          />
          <Kpi
            icon={Send}
            label="Envio em andamento"
            value={totals?.inFlight ?? 0}
            tone="bg-blue-500/10 text-blue-600"
          />
          <Kpi
            icon={CheckCircle2}
            label="Solicitação entregue"
            value={totals?.delivered ?? 0}
            tone="bg-emerald-500/10 text-emerald-600"
          />
          <Kpi
            icon={AlertTriangle}
            label="Envio falhou"
            value={totals?.failed ?? 0}
            tone="bg-red-500/10 text-red-600"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Carregando fila…</div>
            ) : isError ? (
              <div className="p-6 text-sm text-destructive">
                Não foi possível carregar a fila:{' '}
                {(error as Error)?.message ?? 'erro desconhecido'}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Nenhum pedido aguardando análise de crédito.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Aguardando desde</TableHead>
                    <TableHead>Solicitação ao Financeiro</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          to={`/meus-pedidos/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{order.client_name ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.client_cnpj ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(order.total)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <OutboxBadge status={order.outbox_status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetail(order)}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          O parecer é registrado pelo Financeiro no endpoint autenticado{' '}
          <code>receive-credit-decision</code>; esta tela apenas acompanha o estado — o
          pedido sai da lista quando o crédito é aprovado ou reprovado.
        </p>
      </div>

      <Sheet open={Boolean(detail)} onOpenChange={open => !open && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Pedido {detail?.order_number}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Cliente</span>
                <span className="text-right">{detail.client_name ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">CNPJ</span>
                <span className="text-right">{detail.client_cnpj ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Valor do pedido</span>
                <span className="text-right">{formatBRL(detail.total)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Criado em</span>
                <span className="text-right">{formatDateTime(detail.created_at)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">Solicitação</span>
                <OutboxBadge status={detail.outbox_status} />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tentativas de envio</span>
                <span className="text-right">{detail.outbox_attempts}</span>
              </div>
              {detail.outbox_next_attempt_at && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Próxima tentativa</span>
                  <span className="text-right">
                    {formatDateTime(detail.outbox_next_attempt_at)}
                  </span>
                </div>
              )}
              {detail.outbox_delivered_at && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Entregue em</span>
                  <span className="text-right">
                    {formatDateTime(detail.outbox_delivered_at)}
                  </span>
                </div>
              )}
              {detail.outbox_last_error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                  <div className="text-xs font-medium text-destructive">
                    Último erro de envio
                  </div>
                  <div className="mt-1 break-words text-xs text-muted-foreground">
                    {detail.outbox_last_error}
                  </div>
                </div>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to={`/meus-pedidos/${detail.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir pedido
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function AdminCreditAnalysisPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <AdminCreditAnalysisContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
