import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { useMyCommissions, type CommissionStatus } from "@/hooks/useCommissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { CommissionCalculator } from "@/components/financeiro/CommissionCalculator";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { cn } from "@/lib/utils";

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
        <Card className="p-8 text-center bg-white/5 border-dashed border-white/10">
          <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground italic">Nenhuma comissão encontrada para este filtro.</p>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow group border-white/5 bg-black/20 overflow-hidden">
            <CardContent className="p-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] ml-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm uppercase tracking-tight">{c.sales?.client_name ?? "Cliente"}</p>
                    {c.is_first_sale && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black uppercase tracking-tighter h-4 px-1">
                        Ativação
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate uppercase font-medium">{c.sales?.product_name ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                    {format(new Date(c.created_at), "dd MMM yyyy", { locale: ptBR })}
                    {" · "}BASE: {formatBRL(c.base_amount)}
                    {" · "}{c.percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black italic tracking-tighter text-primary">{formatBRL(c.commission_amount)}</p>
                  <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mt-1 border-white/10", 
                    c.status === 'paid' ? "bg-emerald-500/10 text-emerald-400" : 
                    c.status === 'approved' ? "bg-blue-500/10 text-blue-400" : 
                    c.status === 'pending' ? "bg-amber-500/10 text-amber-400" : "text-muted-foreground")}>
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

      <main className="container max-w-7xl py-6 space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter gradient-text">Minhas Comissões</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Relatório Financeiro de Performance</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Live Payout Tracking</span>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Resumo de comissões">
          {[
            { label: "Total Geral", value: totals.all, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: "Pendentes", value: totals.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Aprovadas", value: totals.approved, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Pagas", value: totals.paid, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, i) => (
            <Card key={i} className="border-white/5 bg-black/40 backdrop-blur-md overflow-hidden relative group">
              <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full opacity-10 transition-opacity group-hover:opacity-20", item.bg)} />
              <CardHeader className="pb-1 px-4 pt-4 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</CardTitle>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-black italic tracking-tighter font-display">{formatBRL(item.value)}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-black/20 border border-white/10 p-1 mb-6">
                <TabsTrigger value="all" className="text-[10px] font-black uppercase tracking-widest">Todas</TabsTrigger>
                <TabsTrigger value="pending" className="text-[10px] font-black uppercase tracking-widest">Pendentes</TabsTrigger>
                <TabsTrigger value="approved" className="text-[10px] font-black uppercase tracking-widest">Aprovadas</TabsTrigger>
                <TabsTrigger value="paid" className="text-[10px] font-black uppercase tracking-widest">Pagas</TabsTrigger>
                <TabsTrigger value="cancelled" className="text-[10px] font-black uppercase tracking-widest">Canceladas</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">{renderList()}</TabsContent>
              <TabsContent value="pending" className="mt-0">{renderList("pending")}</TabsContent>
              <TabsContent value="approved" className="mt-0">{renderList("approved")}</TabsContent>
              <TabsContent value="paid" className="mt-0">{renderList("paid")}</TabsContent>
              <TabsContent value="cancelled" className="mt-0">{renderList("cancelled")}</TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <CommissionCalculator />
            
            <Card className="border-dashed border-white/10 bg-transparent">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Informação Importante</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  As comissões são geradas automaticamente após a conclusão da venda e auditadas pelo departamento financeiro em até 48h.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
