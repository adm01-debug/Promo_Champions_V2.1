import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LucideIcon } from "lucide-react";
import { 
  ArrowLeft, 
  DollarSign, 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Flame,
  Star
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { startOfMonth, endOfMonth, format, subMonths, differenceInDays, parseISO } from "date-fns";
import { NextBestActionCard } from "@/components/ai/NextBestActionCard";
import { CustomFieldsDisplay } from "@/components/salespeople/CustomFieldsDisplay";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SalespersonData {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  commission_rate: number;
}

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
      // Fetch salesperson
      const { data: salesperson, error: spError } = await supabase
        .from("salespeople")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (spError) throw spError;
      if (!salesperson) throw new Error("Vendedor não encontrado");

      // Fetch current month goal
      const currentMonth = format(new Date(), "yyyy-MM") + "-01";
      const { data: goal } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("salesperson_id", id)
        .eq("month", currentMonth)
        .maybeSingle();

      // Fetch current month sales
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const { data: currentSales } = await supabase
        .from("sales")
        .select("*")
        .eq("salesperson_id", id)
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      // Fetch previous month sales for comparison
      const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
      const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
      const { data: previousSales } = await supabase
        .from("sales")
        .select("*")
        .eq("salesperson_id", id)
        .gte("created_at", prevMonthStart.toISOString())
        .lte("created_at", prevMonthEnd.toISOString());

      // Fetch all-time stats
      const { data: allSales } = await supabase
        .from("sales")
        .select("*")
        .eq("salesperson_id", id)
        .order("created_at", { ascending: false });

      return {
        salesperson: salesperson as SalespersonData,
        goal: goal?.goal_amount || 0,
        currentSales: (currentSales || []) as Sale[],
        previousSales: (previousSales || []) as Sale[],
        allSales: (allSales || []) as Sale[],
      };
    },
    enabled: !!id,
  });
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = "default" 
}: { 
  title: string; 
  value: string; 
  change?: number; 
  icon: LucideIcon; 
  variant?: "default" | "primary" | "success";
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={cn(
      "glass rounded-xl p-5",
      variant === "primary" && "gradient-border glow-primary",
      variant === "success" && "border-success/30 bg-success/5"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-lg",
          variant === "primary" ? "gradient-primary" : 
          variant === "success" ? "bg-success/20" : "bg-muted"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            variant === "primary" || variant === "success" ? "text-white" : "text-muted-foreground"
          )} />
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
        {change !== undefined && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full ml-auto",
            isPositive && "bg-success/20 text-success",
            isNegative && "bg-destructive/20 text-destructive",
            !isPositive && !isNegative && "bg-muted text-muted-foreground"
          )}>
            {isPositive && "+"}{change}%
          </span>
        )}
      </div>
      <p className={cn(
        "text-2xl font-bold",
        variant === "primary" && "gradient-text"
      )}>{value}</p>
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
          <Link to="/vendedores">
            <Button variant="outline">Voltar para Vendedores</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { salesperson, goal, currentSales, previousSales, allSales } = data || { salesperson: null, goal: 0, currentSales: [], previousSales: [], allSales: [] };

  // Calculate stats
  const completedSales = currentSales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const previousRevenue = previousSales.filter(s => s.status === "completed").reduce((sum, s) => sum + Number(s.amount), 0);
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  const goalProgress = goal > 0 ? (totalRevenue / goal) * 100 : 0;
  const commission = totalRevenue * (salesperson.commission_rate / 100);
  
  const pendingSales = currentSales.filter(s => s.status === "pending" || s.status === "negotiation");
  const pipelineValue = pendingSales.reduce((sum, s) => sum + Number(s.amount), 0);

  // Sales by day for chart
  const salesByDay: Record<string, number> = {};
  completedSales.forEach(sale => {
    const day = format(parseISO(sale.created_at), "dd/MM");
    salesByDay[day] = (salesByDay[day] || 0) + Number(sale.amount);
  });
  const chartData = Object.entries(salesByDay).map(([day, value]) => ({ day, value }));

  // Sales by category
  const salesByCategory: Record<string, number> = {};
  completedSales.forEach(sale => {
    salesByCategory[sale.category] = (salesByCategory[sale.category] || 0) + Number(sale.amount);
  });
  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))", "hsl(var(--warning))"];

  // Recent deals
  const recentDeals = allSales.slice(0, 5);

  // Pending tasks (deals that need attention)
  const staleTasks = pendingSales.filter(sale => {
    const daysSince = differenceInDays(new Date(), parseISO(sale.created_at));
    return daysSince >= 3;
  });

  const daysRemaining = differenceInDays(endOfMonth(new Date()), new Date());
  const dailyRequired = goal > 0 && daysRemaining > 0 
    ? Math.max(0, (goal - totalRevenue) / daysRemaining) 
    : 0;

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<VendedorDashboardLoadingSkeleton />}
      duration={400}
    >
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up">
          <Link to="/vendedores" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Ranking</span>
          </Link>

          <div className="glass rounded-2xl p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/30 shadow-xl">
                  <AvatarImage src={salesperson.avatar_url || undefined} alt={salesperson.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                    {salesperson.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {goalProgress >= 100 && (
                  <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black">{salesperson.name}</h1>
                <p className="text-muted-foreground">{salesperson.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    {salesperson.commission_rate}% comissão
                  </span>
                  {goalProgress >= 100 && (
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Meta batida!
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-muted-foreground">Progresso da Meta</span>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradient)"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(goalProgress, 100) * 3.52} 352`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                      "text-2xl font-black",
                      goalProgress >= 100 ? "text-success" : "gradient-text"
                    )}>
                      {goalProgress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Faturamento"
              value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`}
              change={Number(revenueChange.toFixed(1))}
              icon={DollarSign}
              variant="primary"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <StatCard
              title="Meta"
              value={`R$ ${goal.toLocaleString("pt-BR")}`}
              icon={Target}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Comissão"
              value={`R$ ${commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
              icon={TrendingUp}
              variant="success"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <StatCard
              title="Pipeline"
              value={`R$ ${pipelineValue.toLocaleString("pt-BR")}`}
              icon={ShoppingBag}
            />
          </div>
        </div>

        {/* Daily Target Alert */}
        {dailyRequired > 0 && goalProgress < 100 && (
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4 border border-warning/30 bg-warning/5" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "350ms" }}>
            <h3 className="text-lg font-semibold mb-4">Vendas do Mês</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Vendas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhuma venda este mês
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "400ms" }}>
            <h3 className="text-lg font-semibold mb-4">Por Categoria</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Sem dados
              </div>
            )}
            <div className="space-y-2 mt-4">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="capitalize">{cat.name}</span>
                  </div>
                  <span className="font-medium">R$ {cat.value.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Best Action AI Card */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "430ms" }}>
          <NextBestActionCard salespersonId={id} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deals */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "450ms" }}>
            <h3 className="text-lg font-semibold mb-4">Vendas Recentes</h3>
            {recentDeals.length > 0 ? (
              <div className="space-y-3">
                {recentDeals.map(deal => (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{deal.client_name}</p>
                      <p className="text-sm text-muted-foreground">{deal.product_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {Number(deal.amount).toLocaleString("pt-BR")}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        deal.status === "completed" && "bg-success/20 text-success",
                        deal.status === "pending" && "bg-warning/20 text-warning",
                        deal.status === "cancelled" && "bg-destructive/20 text-destructive"
                      )}>
                        {deal.status === "completed" ? "Fechado" : deal.status === "pending" ? "Pendente" : "Cancelado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "500ms" }}>
            <h3 className="text-lg font-semibold mb-4">Tarefas Pendentes</h3>
            {staleTasks.length > 0 ? (
              <div className="space-y-3">
                {staleTasks.map(task => {
                  const daysSince = differenceInDays(new Date(), parseISO(task.created_at));
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
                      <Clock className="h-5 w-5 text-warning" />
                      <div className="flex-1">
                        <p className="font-medium">{task.client_name}</p>
                        <p className="text-sm text-muted-foreground">{task.product_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {Number(task.amount).toLocaleString("pt-BR")}</p>
                        <p className="text-xs text-warning">{daysSince} dias parado</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                <p>Nenhuma tarefa pendente!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
};

export default VendedorDashboard;
