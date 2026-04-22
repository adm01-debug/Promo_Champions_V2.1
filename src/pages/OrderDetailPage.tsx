import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/BackButton";
import { useOrder } from "@/hooks/orders/useOrder";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { OrderItemsCard } from "@/components/orders/OrderItemsCard";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { statusLabel, statusTone, formatDateTime } from "@/components/orders/orderHelpers";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <Helmet>
        <title>{data?.order ? `Pedido ${data.order.order_number}` : "Detalhe do pedido"} | Meus Pedidos</title>
        <meta name="description" content="Acompanhe os detalhes, itens e status do seu pedido em tempo real." />
      </Helmet>

      <BackButton label="Voltar para Meus Pedidos" fallbackPath="/meus-pedidos" />

      {isLoading && <OrderDetailSkeleton />}

      {!isLoading && (isError || !data?.order) && (
        <Card>
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este pedido não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Button asChild>
              <Link to="/meus-pedidos">Ver meus pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && data?.order && (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Pedido #{data.order.order_number}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Criado em {formatDateTime(data.order.created_at)}
              </p>
            </div>
            <Badge variant={statusTone(data.order.status)} size="lg">
              {statusLabel(data.order.status)}
            </Badge>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Acompanhamento</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusTimeline
                  currentStatus={data.order.status}
                  events={data.events}
                  cancellationReason={data.order.cancellation_reason}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <OrderItemsCard items={data.items} />
              <OrderSummaryCard
                subtotal={Number(data.order.subtotal)}
                shipping={Number(data.order.shipping)}
                total={Number(data.order.total)}
              />
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
