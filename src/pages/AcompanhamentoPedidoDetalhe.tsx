import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/navigation/BackButton";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { OrderItemsCard } from "@/components/orders/OrderItemsCard";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { useOrder } from "@/hooks/orders/useOrder";
import { formatDateTime, statusLabel, statusTone } from "@/components/orders/orderHelpers";

export default function AcompanhamentoPedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);
  const order = data?.order;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <Helmet>
        <title>{order ? `Pedido #${order.order_number}` : "Pedido"} | Acompanhamento</title>
        <meta
          name="description"
          content="Consulte os status, itens e eventos efetivamente registrados para este pedido."
        />
      </Helmet>

      <BackButton label="Voltar para Acompanhamento" fallbackPath="/acompanhamento-pedidos" />

      {isLoading && <OrderDetailSkeleton />}

      {!isLoading && isError && (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar o pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O pedido pode existir, mas os detalhes não puderam ser consultados agora.
            </p>
            <Button asChild>
              <Link to="/acompanhamento-pedidos">Voltar para acompanhamento</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (!order || !data) && (
        <Card>
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este pedido não existe, não está mais disponível ou você não tem permissão para visualizá-lo.
            </p>
            <Button asChild>
              <Link to="/acompanhamento-pedidos">Ver acompanhamento</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && order && (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h1 className="font-display text-2xl font-semibold tracking-tight">Pedido #{order.order_number}</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Criado em {formatDateTime(order.created_at)} · Última atualização em {formatDateTime(order.updated_at)}
              </p>
            </div>
            <Badge variant={statusTone(order.status)} size="lg">
              {statusLabel(order.status)}
            </Badge>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Status do pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusTimeline
                  currentStatus={order.status}
                  events={data.events}
                  cancellationReason={order.cancellation_reason}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <OrderItemsCard items={data.items} />
              <OrderSummaryCard
                subtotal={Number(order.subtotal)}
                shipping={Number(order.shipping)}
                total={Number(order.total)}
              />
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observações registradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-96 rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
