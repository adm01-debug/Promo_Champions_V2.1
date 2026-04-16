import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeartPulse, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { differenceInDays } from "date-fns";

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
        <title>Health Score de Clientes | Promo Champions</title>
        <meta name="description" content="Acompanhe a saúde do relacionamento com cada cliente." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display">💓 Health Score</h1>
              <p className="text-sm text-muted-foreground mt-1">Saúde do relacionamento com seus clientes</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs gap-1 text-status-success border-status-success/30">
                <CheckCircle className="h-3 w-3" /> {summary.healthy} Saudáveis
              </Badge>
              <Badge variant="outline" className="text-xs gap-1 text-status-warning border-status-warning/30">
                <AlertTriangle className="h-3 w-3" /> {summary.atRisk} Em Risco
              </Badge>
              <Badge variant="outline" className="text-xs gap-1 text-destructive border-destructive/30">
                <TrendingDown className="h-3 w-3" /> {summary.critical} Críticos
              </Badge>
            </div>
          </motion.div>

          {clientsLoading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : healthData.length === 0 ? (
            <Card className="p-8 text-center glass border-border/40">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Sem dados de clientes</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {healthData.map(client => {
                const cfg = tierConfig[client.tier];
                const Icon = cfg.icon;
                return (
                  <motion.div key={client.id} variants={itemVariants}>
                    <Card className={cn("p-4 glass border-border/40 hover-lift-sm transition-all", client.tier === "critical" && "border-destructive/15")}>
                      <div className="flex items-center gap-4">
                        {/* Score Circle */}
                        <div className={cn("relative w-14 h-14 rounded-full flex items-center justify-center shrink-0", cfg.bg)}>
                          <span className={cn("font-display font-bold text-lg", cfg.color)}>{client.score}</span>
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border) / 0.2)" strokeWidth="3" />
                            <circle
                              cx="28" cy="28" r="24" fill="none"
                              stroke="currentColor"
                              className={cfg.color}
                              strokeWidth="3"
                              strokeDasharray={`${(client.score / 100) * 150.8} 150.8`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{client.name}</p>
                            <Badge variant="outline" className={cn("text-[9px] gap-1", cfg.color, cfg.border)}>
                              <Icon className="h-2.5 w-2.5" /> {cfg.label}
                            </Badge>
                          </div>
                          {client.company && <p className="text-[10px] text-muted-foreground">{client.company}</p>}
                          {/* Factor bars */}
                          <div className="flex gap-3 mt-2">
                            {client.factors.map(f => (
                              <div key={f.label} className="flex-1">
                                <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                                  <span>{f.label}</span>
                                  <span>{f.value}/{f.max}</span>
                                </div>
                                <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
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
                          <p className="font-display font-bold text-sm">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(client.totalValue)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">receita total</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default ClientHealthScore;
