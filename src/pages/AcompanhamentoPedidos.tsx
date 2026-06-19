import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Package, Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTrackingCard } from "@/components/order-tracking/OrderTrackingCard";
import { useOrderTracking } from "@/hooks/orders/useOrderTracking";
import { formatBRL } from "@/lib/orderTracking/stages";
import type { TrackKey } from "@/lib/orderTracking/stages";

type FilterKey = "all" | TrackKey | "at_risk";

export default function AcompanhamentoPedidos() {
  const { data: orders, isLoading } = useOrderTracking();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.clientName.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "at_risk" && o.health !== "on_track") ||
        o.currentTrack === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  const kpis = useMemo(() => {
    if (!orders) return { total: 0, value: 0, onTrack: 0, atRisk: 0, delivered: 0 };
    return {
      total: orders.length,
      value: orders.reduce((s, o) => s + o.totalValue, 0),
      onTrack: orders.filter((o) => o.health === "on_track").length,
      atRisk: orders.filter((o) => o.health !== "on_track").length,
      delivered: orders.filter((o) => o.currentTrack !== "operational").length,
    };
  }, [orders]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <Helmet>
        <title>Acompanhamento de Pedidos | CRM</title>
        <meta
          name="description"
          content="Acompanhe em tempo real os status operacionais, financeiros e de pós-venda dos seus pedidos."
        />
      </Helmet>

      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Acompanhamento de Pedidos</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Visão completa de Compras → Logística → Triagem → Personalização → Expedição → Entrega, mais Financeiro e Pós-Venda.
        </p>
      </motion.header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Pedidos ativos" value={String(kpis.total)} icon={Package} tone="primary" />
        <KPICard label="Valor total" value={formatBRL(kpis.value)} icon={CheckCircle2} tone="success" />
        <KPICard label="No prazo" value={String(kpis.onTrack)} icon={CheckCircle2} tone="success" />
        <KPICard label="Em risco" value={String(kpis.atRisk)} icon={AlertTriangle} tone="warning" />
        <KPICard label="Pós-operacional" value={String(kpis.delivered)} icon={Clock} tone="primary" />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nº do pedido ou cliente..."
              className="pl-9"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="operational">Operacional</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="post_sale">Pós-Venda</TabsTrigger>
              <TabsTrigger value="at_risk">Atenção</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <Package className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">Nenhum pedido encontrado</p>
            <p className="text-sm text-muted-foreground">Ajuste a busca ou os filtros acima.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o, i) => (
            <OrderTrackingCard key={o.id} order={o} index={i} />
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
  tone: "primary" | "success" | "warning";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
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
