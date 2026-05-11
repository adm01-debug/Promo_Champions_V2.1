import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Users, 
  ChevronRight, 
  Sparkles, 
  ShieldAlert,
  Search,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { useCustomerSuccess, type AccountHealth } from "@/hooks/useCustomerSuccess";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const RISK_VARIANTS: Record<AccountHealth["churn_risk"], string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive/20 text-destructive border-destructive/40 animate-pulse",
};

const RISK_LABELS: Record<AccountHealth["churn_risk"], string> = {
  low: "Saudável",
  medium: "Atenção",
  high: "Em Risco",
  critical: "Crítico",
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

const KPICard = ({ icon: Icon, label, value, subtext, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="glass relative overflow-hidden group hover:border-primary/40 transition-all">
      <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity", color)}>
        <Icon className="size-16" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-background/50 border border-border/50", color)}>
            <Icon className="size-4" />
          </div>
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black font-display tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          {subtext}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

export function CustomerSuccessHub() {
  const { data, isLoading } = useCustomerSuccess();
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    return data.accounts.filter(a => 
      a.account_name.toLowerCase().includes(search.toLowerCase()) ||
      a.tier.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <Helmet>
        <title>Customer Success Hub | Promo Champions</title>
        <meta name="description" content="Saúde de clientes, risco de churn e oportunidades de expansão" />
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 px-3 py-1">
              <Sparkles className="size-3" /> IA-Powered Retention
            </Badge>
          </div>
          <h1 className="text-4xl font-black font-display gradient-text tracking-tighter">Customer Success Hub</h1>
          <p className="text-muted-foreground mt-1 font-medium">Radar de saúde e motor de expansão de receita</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar contas ou tiers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass"
          />
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            icon={Users} 
            label="Contas Totais" 
            value={summary.total_accounts} 
            subtext={<>Health médio: <span className="font-bold text-primary">{summary.avg_health_score}/100</span></>}
            color="text-primary"
            delay={0.1}
          />
          <KPICard 
            icon={ShieldAlert} 
            label="Em Risco Crítico" 
            value={summary.critical} 
            subtext={<>{summary.at_risk} contas em alerta total</>}
            color="text-destructive"
            delay={0.2}
          />
          <KPICard 
            icon={TrendingUp} 
            label="Expansion Ready" 
            value={summary.expansion_ready} 
            subtext="Oportunidades de upsell detectadas"
            color="text-success"
            delay={0.3}
          />
          <KPICard 
            icon={DollarSign} 
            label="Revenue at Risk" 
            value={formatBRL(summary.total_revenue_at_risk)} 
            subtext="Exposição anualizada de churn"
            color="text-warning"
            delay={0.4}
          />
        </div>
      )}

      <Card className="glass border-border/40 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-primary" />
              <CardTitle className="text-lg">Radar de Saúde por Conta</CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
              Live Telemetry
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="size-16 mx-auto mb-4 opacity-10" />
                <p className="font-display font-bold">Nenhuma conta encontrada para "{search}"</p>
              </div>
            ) : (
              filteredAccounts.map((acc, i) => (
                <motion.div 
                  key={acc.account_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 hover:bg-muted/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                          {acc.account_name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-background/50">
                          {acc.tier}
                        </Badge>
                        <Badge className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5", RISK_VARIANTS[acc.churn_risk])}>
                          {RISK_LABELS[acc.churn_risk]}
                        </Badge>
                        {acc.expansion_potential > 75 && (
                          <Badge variant="glow" className="gap-1 bg-success/10 text-success border-success/30 animate-pulse">
                            <Zap className="size-3" /> Upsell Potential
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Activity className="size-3.5 text-primary" />
                          <span className="font-medium">Atividade: <span className="text-foreground">{acc.days_since_last_activity}d</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-3.5 text-success" />
                          <span className="font-medium">ARR: <span className="text-foreground">{formatBRL(acc.total_revenue)}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-warning" />
                          <span className="font-medium">Cycle: <span className="text-foreground">Renovação em 45d</span></span>
                        </div>
                      </div>

                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <Zap className="size-3" />
                        </div>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                          {acc.recommended_action}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-72 space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Health Index</span>
                        <span className={cn(
                          "text-xl font-black font-display tracking-tight",
                          acc.health_score > 75 ? "text-success" : acc.health_score > 40 ? "text-warning" : "text-destructive"
                        )}>
                          {acc.health_score}%
                        </span>
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${acc.health_score}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                            acc.health_score > 75 ? "bg-success" : acc.health_score > 40 ? "bg-warning" : "bg-destructive"
                          )}
                        />
                      </div>
                      
                      {acc.health_factors && (
                        <div className="grid grid-cols-3 gap-2">
                          {acc.health_factors.slice(0, 3).map((f, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-background/40 border border-border/50 text-center">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground truncate">{f.label}</p>
                              <p className={cn(
                                "text-[10px] font-bold mt-0.5",
                                f.status === "good" ? "text-success" : f.status === "warning" ? "text-warning" : "text-destructive"
                              )}>
                                {f.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                        <ChevronRight className="size-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Botões de Ação Global */}
      <div className="flex justify-center gap-4">
        <button className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
          <Zap className="size-4" /> Gerar QBR Automatizada
        </button>
        <button className="px-6 py-3 rounded-2xl bg-muted border border-border/50 font-bold hover:bg-muted/80 transition-all flex items-center gap-2">
          <CheckCircle2 className="size-4" /> Validar Health Score
        </button>
      </div>
    </div>
  );
}
