import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LucideIcon } from "lucide-react";
import { DollarSign, Target, TrendingUp, ShoppingBag, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { startOfMonth, endOfMonth, format, subMonths, differenceInDays, parseISO } from "date-fns";
import { NextBestActionCard } from "@/components/ai/NextBestActionCard";
import { VendedorHeader } from "@/components/vendedor/VendedorHeader";
import { VendedorCharts } from "@/components/vendedor/VendedorCharts";
import { VendedorBottomRow } from "@/components/vendedor/VendedorBottomRow";
import { PageTransition } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

interface Sale {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  created_at: string;
}

const useVendedorData = (id: string) => {
  return useQuery({
    queryKey: ["vendedor-dashboard", id],
    queryFn: async () => {
      const { data: salesperson, error: spError } = await supabase
        .from("salespeople").select("*").eq("id", id).maybeSingle();
      if (spError) throw spError;
      if (!salesperson) throw new Error("Vendedor não encontrado");

      const currentMonth = format(new Date(), "yyyy-MM") + "-01";
      const { data: goal } = await supabase
        .from("sales_goals").select("*").eq("salesperson_id", id).eq("month", currentMonth).maybeSingle();

      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const { data: currentSales } = await supabase
        .from("sales").select("*").eq("salesperson_id", id)
        .gte("created_at", monthStart.toISOString()).lte("created_at", monthEnd.toISOString());

      const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
      const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
      const { data: previousSales } = await supabase
        .from("sales").select("*").eq("salesperson_id", id)
        .gte("created_at", prevMonthStart.toISOString()).lte("created_at", prevMonthEnd.toISOString());

      const { data: allSales } = await supabase
        .from("sales").select("*").eq("salesperson_id", id).order("created_at", { ascending: false });

      return {
        salesperson: salesperson as { id: string; name: string; email: string | null; avatar_url: string | null; commission_rate: number },
        goal: goal?.goal_amount || 0,
        currentSales: (currentSales || []) as Sale[],
        previousSales: (previousSales || []) as Sale[],
        allSales: (allSales || []) as Sale[],
      };
    },
    enabled: !!id,
  });
};

const StatCard = ({ title, value, numericValue, change, icon: Icon, variant = "default", isHero = false }: {
  title: string; 
  value: string; 
  numericValue?: number;
  change?: number; 
  icon: LucideIcon; 
  variant?: "default" | "primary" | "success";
  isHero?: boolean;
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className={cn(
      "glass rounded-xl p-5 relative overflow-hidden group transition-all duration-300",
      variant === "primary" && "gradient-border glow-primary", 
      variant === "success" && "border-success/30 bg-success/5",
      isHero && "sm:col-span-2 lg:col-span-2 p-8"
    )}>
      {isHero && (
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="h-24 w-24" />
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", variant === "primary" ? "gradient-primary" : variant === "success" ? "bg-success/20" : "bg-muted")}>
          <Icon className={cn("h-4 w-4", variant === "primary" || variant === "success" ? "text-primary-foreground" : "text-muted-foreground")} />
        </div>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        {change !== undefined && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full ml-auto",
            isPositive && "bg-success/20 text-success", isNegative && "bg-destructive/20 text-destructive",
            !isPositive && !isNegative && "bg-muted text-muted-foreground")}>
            {isPositive && "+"}{change}%
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className={cn(
          "font-black tracking-tighter", 
          isHero ? "text-4xl sm:text-5xl lg:text-6xl" : "text-2xl",
          variant === "primary" && "gradient-text"
        )}>
          {isHero && <span className="text-2xl sm:text-3xl mr-1 text-muted-foreground/50 font-medium">R$</span>}
          {value}
        </p>
      </div>
      
      {isHero && (
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

const VendedorDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useVendedorData(id || "");

  if (!isLoading && (error || !data)) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Vendedor não encontrado</h2>
          <Link to="/vendedores"><Button variant="outline">Voltar para Vendedores</Button></Link>
        </div>
      </div>
    );
  }

  const { salesperson, goal, currentSales, previousSales, allSales } = data || { salesperson: null as never, goal: 0, currentSales: [] as Sale[], previousSales: [] as Sale[], allSales: [] as Sale[] };

  const completedSales = currentSales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const previousRevenue = previousSales.filter(s => s.status === "completed").reduce((sum, s) => sum + Number(s.amount), 0);
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const goalProgress = goal > 0 ? (totalRevenue / goal) * 100 : 0;
  const commission = totalRevenue * (salesperson?.commission_rate || 0) / 100;
  const pendingSales = currentSales.filter(s => s.status === "pending" || s.status === "negotiation");
  const pipelineValue = pendingSales.reduce((sum, s) => sum + Number(s.amount), 0);

  const animatedRevenue = useCountUp(totalRevenue, { duration: 1400 });
  const animatedCommission = useCountUp(commission, { duration: 1400 });
  const animatedPipeline = useCountUp(pipelineValue, { duration: 1400 });
  const animatedGoal = useCountUp(goal, { duration: 1400 });

  const salesByDay: Record<string, number> = {};
  completedSales.forEach(sale => { const day = format(parseISO(sale.created_at), "dd/MM"); salesByDay[day] = (salesByDay[day] || 0) + Number(sale.amount); });
  const chartData = Object.entries(salesByDay).map(([day, value]) => ({ day, value }));

  const salesByCategory: Record<string, number> = {};
  completedSales.forEach(sale => { salesByCategory[sale.category] = (salesByCategory[sale.category] || 0) + Number(sale.amount); });
  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));

  const recentDeals = allSales.slice(0, 5);
  const staleTasks = pendingSales.filter(sale => differenceInDays(new Date(), parseISO(sale.created_at)) >= 3);
  const daysRemaining = differenceInDays(endOfMonth(new Date()), new Date());
  const dailyRequired = goal > 0 && daysRemaining > 0 ? Math.max(0, (goal - totalRevenue) / daysRemaining) : 0;

  return (
    <PageTransition>
      <Helmet>
        <title>Dashboard Vendedor | Promo Champions</title>
        <meta name="description" content="Painel de performance do vendedor" />
      </Helmet>
      <SkeletonTransition isLoading={isLoading} skeleton={<VendedorDashboardLoadingSkeleton />} duration={400}>
        <div className="min-h-screen bg-background p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <VendedorHeader salesperson={salesperson} goalProgress={goalProgress} salespersonId={id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Faturamento Mensal", value: animatedRevenue.toLocaleString("pt-BR"), numericValue: totalRevenue, change: Number(revenueChange.toFixed(1)), icon: DollarSign, variant: "primary" as const, delay: "100ms", isHero: true },
                { title: "Comissão Estimada", value: `R$ ${animatedCommission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, icon: TrendingUp, variant: "success" as const, delay: "200ms" },
                { title: "Meta Individual", value: `R$ ${animatedGoal.toLocaleString("pt-BR")}`, icon: Target, variant: "default" as const, delay: "150ms" },
                { title: "Pipeline Ativo", value: `R$ ${animatedPipeline.toLocaleString("pt-BR")}`, icon: ShoppingBag, variant: "default" as const, delay: "250ms" },
              ].map((stat) => (
                <motion.div 
                  key={stat.title} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: parseInt(stat.delay) / 1000 }}
                  className={cn(stat.isHero ? "sm:col-span-2 lg:col-span-2" : "")}
                >
                  <StatCard 
                    title={stat.title} 
                    value={stat.value} 
                    numericValue={stat.numericValue}
                    change={stat.change} 
                    icon={stat.icon} 
                    variant={stat.variant} 
                    isHero={stat.isHero}
                  />
                </motion.div>
              ))}
            </div>

            {dailyRequired > 0 && goalProgress < 100 && (
              <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4 border border-warning/30 bg-warning/5" style={{ animationDelay: "300ms" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20"><Calendar className="h-5 w-5 text-warning" /></div>
                  <div>
                    <p className="font-medium">Para bater a meta</p>
                    <p className="text-sm text-muted-foreground">
                      Faltam <span className="font-bold text-warning">{daysRemaining} dias</span> •
                      Você precisa vender <span className="font-bold text-warning">R$ {dailyRequired.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/dia</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <VendedorCharts chartData={chartData} categoryData={categoryData} />

            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "430ms" }}>
              <NextBestActionCard salespersonId={id} />
            </div>

            <VendedorBottomRow recentDeals={recentDeals} staleTasks={staleTasks} />
          </div>
        </div>
      </SkeletonTransition>
    </PageTransition>
  );
};

export default VendedorDashboard;
