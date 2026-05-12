import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { useMyCommissions, type CommissionStatus } from "@/hooks/useCommissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommissionCalculator } from "@/components/financeiro/CommissionCalculator";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusBadge: Record<CommissionStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", variant: "outline" },
  approved: { label: "Aprovada", variant: "secondary" },
  paid: { label: "Paga", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export default function Comissoes() {
  const { data: commissions = [], isLoading } = useMyCommissions();

  const totals = useMemo(() => {
    const t = { pending: 0, approved: 0, paid: 0, all: 0 };
    for (const c of commissions) {
      t.all += c.commission_amount;
      if (c.status === "pending") t.pending += c.commission_amount;
      else if (c.status === "approved") t.approved += c.commission_amount;
      else if (c.status === "paid") t.paid += c.commission_amount;
    }
    return t;
  }, [commissions]);

  const renderList = (filter?: CommissionStatus) => {
    const list = filter ? commissions.filter((c) => c.status === filter) : commissions;
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <Card className="p-8 text-center">
          <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma comissão encontrada</p>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{c.sales?.client_name ?? "Cliente"}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.sales?.product_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(c.created_at), "dd MMM yyyy", { locale: ptBR })}
                    {" · "}Base: {formatBRL(c.base_amount)}
                    {" · "}{c.percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-display">{formatBRL(c.commission_amount)}</p>
                  <Badge variant={statusBadge[c.status].variant} className="mt-1">
                    {statusBadge[c.status].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Minhas Comissões | Promo Champions</title>
        <meta name="description" content="Acompanhe suas comissões pendentes, aprovadas e pagas em tempo real." />
      </Helmet>

      <main className="container max-w-6xl py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title">Minhas Comissões</h1>
            <p className="text-sm text-muted-foreground">Visão consolidada das suas comissões</p>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Resumo de comissões">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total geral</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{formatBRL(totals.all)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-streak" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{formatBRL(totals.pending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Aprovadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{formatBRL(totals.approved)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pagas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{formatBRL(totals.paid)}</p>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas</TabsTrigger>
            <TabsTrigger value="paid">Pagas</TabsTrigger>
            <TabsTrigger value="cancelled"><XCircle className="h-3 w-3 mr-1" />Canceladas</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderList()}</TabsContent>
          <TabsContent value="pending" className="mt-4">{renderList("pending")}</TabsContent>
          <TabsContent value="approved" className="mt-4">{renderList("approved")}</TabsContent>
          <TabsContent value="paid" className="mt-4">{renderList("paid")}</TabsContent>
          <TabsContent value="cancelled" className="mt-4">{renderList("cancelled")}</TabsContent>
        </Tabs>
      </main>
    </>
  );
}
