import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  HeartPulse, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Users, Ticket, RefreshCw, Activity,
  Zap, Calendar, BarChart3
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientHealth {
  id: string;
  name: string;
  company: string | null;
  totalValue: number;
  score: number;
  tier: "healthy" | "at_risk" | "critical";
  factors: { label: string; value: number; max: number }[];
}

const tierConfig = {
  healthy: { label: "Saudável", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30", icon: CheckCircle },
  at_risk: { label: "Em Risco", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30", icon: AlertTriangle },
  critical: { label: "Crítico", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: TrendingDown },
};

const ClientHealthScore = () => {
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients-health"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name, company, total_value, updated_at, created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sales } = useQuery({
    queryKey: ["sales-health"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("id, client_name, amount, status, created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const healthData = useMemo((): ClientHealth[] => {
    if (!clients?.length) return [];

    return clients.map(client => {
      const clientSales = (sales || []).filter(s => s.client_name === client.name);
      const wonSales = clientSales.filter(s => s.status === "completed" || s.status === "won");
      const lostSales = clientSales.filter(s => s.status === "lost");

      // Factor 1: Revenue (0-30)
      const revenue = wonSales.reduce((s, sale) => s + (sale.amount || 0), 0);
      const revScore = Math.min(30, (revenue / 100000) * 30);

      // Factor 2: Recency (0-30)
      const lastActivity = clientSales.length > 0
        ? Math.min(...clientSales.map(s => differenceInDays(new Date(), new Date(s.created_at))))
        : 999;
      const recencyScore = lastActivity < 7 ? 30 : lastActivity < 30 ? 20 : lastActivity < 90 ? 10 : 0;

      // Factor 3: Frequency (0-20)
      const freqScore = Math.min(20, wonSales.length * 5);

      // Factor 4: Win ratio (0-20)
      const total = clientSales.length;
      const winRatio = total > 0 ? wonSales.length / total : 0;
      const winScore = winRatio * 20;

      const totalScore = Math.round(revScore + recencyScore + freqScore + winScore);
      const tier: ClientHealth["tier"] = totalScore >= 60 ? "healthy" : totalScore >= 30 ? "at_risk" : "critical";

      return {
        id: client.id,
        name: client.name,
        company: client.company,
        totalValue: revenue,
        score: totalScore,
        tier,
        factors: [
          { label: "Receita", value: Math.round(revScore), max: 30 },
          { label: "Recência", value: Math.round(recencyScore), max: 30 },
          { label: "Frequência", value: Math.round(freqScore), max: 20 },
          { label: "Win Rate", value: Math.round(winScore), max: 20 },
        ],
      };
    }).sort((a, b) => a.score - b.score);
  }, [clients, sales]);

  const summary = useMemo(() => {
    const healthy = healthData.filter(c => c.tier === "healthy").length;
    const atRisk = healthData.filter(c => c.tier === "at_risk").length;
    const critical = healthData.filter(c => c.tier === "critical").length;
    return { healthy, atRisk, critical, total: healthData.length };
  }, [healthData]);

  return (
    <>
      <Helmet>
        <title>Customer Success 360 | Promo Champions</title>
        <meta name="description" content="Gestão completa de pós-venda, renovações, tickets e saúde do cliente." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                Customer Success 360
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Visão holística da saúde, renovações e engajamento da base.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-status-success/5 text-status-success border-status-success/30">
                {summary.healthy} Saudáveis
              </Badge>
              <Badge variant="outline" className="bg-status-warning/5 text-status-warning border-status-warning/30">
                {summary.atRisk} Em Risco
              </Badge>
              <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/30">
                {summary.critical} Críticos
              </Badge>
            </div>
          </motion.div>

          <Tabs defaultValue="health" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-[600px] h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="health" className="rounded-lg py-2">Health Score</TabsTrigger>
              <TabsTrigger value="renewals" className="rounded-lg py-2">Renovações</TabsTrigger>
              <TabsTrigger value="usage" className="rounded-lg py-2">Adoção (Uso)</TabsTrigger>
              <TabsTrigger value="support" className="rounded-lg py-2">Tickets</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              {clientsLoading ? (
                <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
              ) : healthData.length === 0 ? (
                <Card className="p-12 text-center glass border-border/40">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">Nenhum dado de saúde disponível ainda.</p>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {healthData.map(client => {
                    const cfg = tierConfig[client.tier];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={client.id} variants={itemVariants}>
                        <Card className={cn("p-4 glass border-border/40 hover:border-primary/20 transition-all group")}>
                          <div className="flex items-center gap-4">
                            <div className={cn("relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-inner", cfg.bg)}>
                              <span className={cn("font-display font-bold text-lg", cfg.color)}>{client.score}</span>
                              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" />
                                <motion.circle
                                  cx="28" cy="28" r="24" fill="none"
                                  stroke="currentColor"
                                  className={cfg.color}
                                  strokeWidth="3"
                                  initial={{ strokeDasharray: "0 150.8" }}
                                  animate={{ strokeDasharray: `${(client.score / 100) * 150.8} 150.8` }}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm truncate">{client.name}</p>
                                <Badge variant="outline" className={cn("text-[9px] font-bold h-4 px-1.5 uppercase", cfg.color, cfg.border)}>
                                  {cfg.label}
                                </Badge>
                              </div>
                              <div className="flex gap-3 mt-2">
                                {client.factors.map(f => (
                                  <div key={f.label} className="flex-1">
                                    <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                                      <span>{f.label}</span>
                                      <span className="font-bold">{f.value}</span>
                                    </div>
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={cn("h-full rounded-full transition-all", f.value / f.max >= 0.7 ? "bg-status-success" : f.value / f.max >= 0.4 ? "bg-status-warning" : "bg-destructive")}
                                        style={{ width: `${(f.value / f.max) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-display font-bold text-sm text-primary">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(client.totalValue)}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">LTV</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="renewals">
              <RenewalView />
            </TabsContent>

            <TabsContent value="usage">
              <UsageAnalyticsView />
            </TabsContent>

            <TabsContent value="support">
              <SupportTicketsView />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </>
  );
};

function RenewalView() {
  const { data: renewals, isLoading } = useQuery({
    queryKey: ["cs-renewals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_renewals")
        .select("*, clients(name)")
        .order("contract_end_date", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="grid gap-4">
      {renewals?.length === 0 && <p className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl">Nenhuma renovação pendente.</p>}
      {renewals?.map(ren => (
        <Card key={ren.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors border-l-4 border-l-primary">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><RefreshCw className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="font-bold text-sm">{(ren.clients as any)?.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Expira em {ren.contract_end_date ? format(parseISO(ren.contract_end_date), "dd 'de' MMM, yyyy", { locale: ptBR }) : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold">R$ {ren.renewal_value?.toLocaleString()}</p>
              <Badge variant={ren.risk_level === 'high' ? 'destructive' : ren.risk_level === 'medium' ? 'secondary' : 'outline'} className="text-[10px] h-4">
                Risco {ren.risk_level}
              </Badge>
            </div>
            <div className="w-16">
              <p className="text-[10px] text-muted-foreground text-center mb-1 font-bold">{ren.probability}% Prob.</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${ren.probability}%` }} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsageAnalyticsView() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["cs-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_usage")
        .select("*, clients(name)")
        .order("usage_count", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {usage?.map(u => (
        <Card key={u.id} className="p-4 space-y-4 glass border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="font-bold text-xs">{(u.clients as any)?.name}</p>
            </div>
            <Badge variant="secondary" className="text-[9px]">{u.feature_name}</Badge>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black tracking-tighter">{u.usage_count}</p>
              <p className="text-[10px] text-muted-foreground font-bold">EVENTOS NO PERÍODO</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary/20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function SupportTicketsView() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["cs-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cs_tickets")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="grid gap-3">
      {tickets?.map(t => (
        <Card key={t.id} className="p-4 hover:bg-muted/20 transition-all border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Ticket className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs font-bold text-primary">{(t.clients as any)?.name} · {t.source}</p>
                <h4 className="font-bold text-sm mt-0.5">{t.subject}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={cn("text-[10px] uppercase font-black px-2", 
                t.status === 'open' ? 'bg-amber-500' : 'bg-emerald-500'
              )}>
                {t.status}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{format(parseISO(t.created_at), "dd/MM HH:mm")}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default ClientHealthScore;

