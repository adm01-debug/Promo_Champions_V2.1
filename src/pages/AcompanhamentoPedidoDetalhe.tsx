import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package, FileText, Wallet, HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/navigation/BackButton";
import { TrackTimeline } from "@/components/order-tracking/TrackTimeline";
import { useOrderTrackingDetail } from "@/hooks/orders/useOrderTracking";
import {
  FINANCIAL_STAGES,
  OPERATIONAL_STAGES,
  POST_SALE_STAGES,
  formatBRL,
  formatDate,
  formatDateTime,
} from "@/lib/orderTracking/stages";

export default function AcompanhamentoPedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrderTrackingDetail(id);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <Helmet>
        <title>{order ? `Pedido #${order.orderNumber}` : "Pedido"} | Acompanhamento</title>
        <meta name="description" content="Acompanhamento detalhado do pedido em todas as etapas operacionais, financeiras e de pós-venda." />
      </Helmet>

      <BackButton label="Voltar para Acompanhamento" fallbackPath="/acompanhamento-pedidos" />

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      )}

      {!isLoading && !order && (
        <Card>
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este pedido não existe ou não está mais disponível.
            </p>
            <Button asChild>
              <Link to="/acompanhamento-pedidos">Ver acompanhamento</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && order && (
        <>
          <Card>
            <CardContent className="p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h1 className="font-display text-2xl font-semibold">Pedido #{order.orderNumber}</h1>
                  <Badge
                    variant={
                      order.health === "on_track" ? "success" : order.health === "at_risk" ? "warning" : "destructive"
                    }
                  >
                    {order.health === "on_track" ? "No prazo" : order.health === "at_risk" ? "Em risco" : "Atrasado"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.clientName} · Criado em {formatDate(order.createdAt)} · Entrega prevista {formatDate(order.estimatedDelivery)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor total</p>
                <p className="font-display text-2xl font-semibold">{formatBRL(order.totalValue)}</p>
                {order.invoiceNumber && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                    <FileText className="h-3 w-3" /> {order.invoiceNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TrackHeader label="Operacional" pct={order.progressByTrack.operational} tone="primary" icon={Package} />
            <TrackHeader label="Financeiro" pct={order.progressByTrack.financial} tone="success" icon={Wallet} />
            <TrackHeader label="Pós-Venda" pct={order.progressByTrack.post_sale} tone="warning" icon={HeartHandshake} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operacional</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackTimeline title="" stages={OPERATIONAL_STAGES} progress={order.stages} accent="primary" />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackTimeline title="" stages={FINANCIAL_STAGES} progress={order.stages} accent="success" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Parcelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {order.installments.map((inst) => (
                      <li key={inst.number} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">Parcela {inst.number}/{order.installments.length}</p>
                          <p className="text-xs text-muted-foreground">
                            {inst.paid && inst.paidAt
                              ? `Paga em ${formatDate(inst.paidAt)}`
                              : `Vence em ${formatDate(inst.dueDate)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums">{formatBRL(inst.amount)}</p>
                          <Badge variant={inst.paid ? "success" : "warning"} className="mt-0.5 text-[10px]">
                            {inst.paid ? "Paga" : "A vencer"}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pós-Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackTimeline title="" stages={POST_SALE_STAGES} progress={order.stages} accent="warning" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico recente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {order.stages
                  .filter((s) => s.state !== "pending")
                  .slice(-8)
                  .reverse()
                  .map((s) => {
                    const def = [...OPERATIONAL_STAGES, ...FINANCIAL_STAGES, ...POST_SALE_STAGES].find((d) => d.key === s.key);
                    return (
                      <li key={s.key} className="flex items-center justify-between border-b last:border-0 pb-2">
                        <span className="font-medium">{def?.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(s.completedAt ?? s.startedAt)}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function TrackHeader({
  label,
  pct,
  tone,
  icon: Icon,
}: {
  label: string;
  pct: number;
  tone: "primary" | "success" | "warning";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const toneBg = { primary: "bg-primary/10 text-primary", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning" };
  const barTone = { primary: "[&>div]:bg-primary", success: "[&>div]:bg-success", warning: "[&>div]:bg-warning" };
  const value = Math.round(pct * 100);
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${toneBg[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="font-medium text-sm">{label}</p>
          <span className="ml-auto text-sm font-semibold tabular-nums">{value}%</span>
        </div>
        <Progress value={value} className={`h-2 ${barTone[tone]}`} />
      </CardContent>
    </Card>
  );
}
