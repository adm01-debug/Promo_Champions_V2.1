import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Package, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTrackingCard } from "@/components/order-tracking/OrderTrackingCard";
import { useOrderTracking } from "@/hooks/orders/useOrderTracking";
import { formatBRL } from "@/components/orders/orderHelpers";

type FilterKey = "all" | "active" | "delivered" | "cancelled";

export default function AcompanhamentoPedidos() {
  const { data: orders, isLoading, isError } = useOrderTracking();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const matchSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (order.clientName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "active" && !["delivered", "cancelled"].includes(order.status)) ||
        order.status === filter;

      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  const kpis = useMemo(() => {
    if (!orders) return { total: 0, value: 0, active: 0, delivered: 0, cancelled: 0 };

    return {
      total: orders.length,
      value: orders.reduce((sum, order) => sum + order.totalValue, 0),
      active: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    };
  }, [orders]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <Helmet>
        <title>Acompanhamento de Pedidos | CRM</title>
        <meta
          name="description"
          content="Consulte os status, itens e eventos registrados para os pedidos aos quais você tem acesso."
        />
      </Helmet>

      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Acompanhamento de Pedidos</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Status, valores e histórico dos pedidos registrados no sistema.
        </p>
      </motion.header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Pedidos visíveis" value={String(kpis.total)} icon={Package} tone="primary" />
        <KPICard label="Valor total" value={formatBRL(kpis.value)} icon={CheckCircle2} tone="success" />
        <KPICard label="Ativos" value={String(kpis.active)} icon={Clock} tone="primary" />
        <KPICard label="Entregues" value={String(kpis.delivered)} icon={CheckCircle2} tone="success" />
        <KPICard label="Cancelados" value={String(kpis.cancelled)} icon={XCircle} tone="destructive" />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nº do pedido ou cliente..."
              className="pl-9"
            />
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterKey)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="delivered">Entregues</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <XCircle className="h-10 w-10 mx-auto text-destructive" />
            <p className="font-medium">Não foi possível carregar os pedidos</p>
            <p className="text-sm text-muted-foreground">Tente novamente. Nenhum dado de demonstração foi exibido.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <Package className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">Nenhum pedido encontrado</p>
            <p className="text-sm text-muted-foreground">Ajuste a busca ou os filtros acima.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((order, index) => (
            <OrderTrackingCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "destructive";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="font-display text-lg font-semibold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
