import { useBIGestor } from "@/hooks/useBIGestor";
import { Helmet } from "react-helmet-async";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { AnalyticsLoadingSkeleton as BIGestorLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DollarSign, Target, TrendingUp, Users, AlertTriangle, BarChart3, PieChart as PieIcon, Activity, TrendingDown, Briefcase, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { BITopClientsSection } from "@/components/bi/BITopClientsSection";
import { BISalesInsights } from "@/components/bi/BISalesInsights";
import { BIVendasMacro } from "@/components/bi/BIVendasMacro";
import { BIGestorTeamSection } from "@/components/bi/BIGestorTeamSection";
import { CriticalMomentsFeed } from "@/components/conversational/CriticalMomentsFeed";
import { useNavigate } from "react-router-dom";

const ABC_COLORS = { A: "hsl(var(--success))", B: "hsl(var(--warning))", C: "hsl(var(--destructive))" };
const STAGE_LABELS: Record<string, string> = { pending: "Lead", qualified: "Qualificado", proposal: "Proposta", negotiation: "Negociação" };

const BIGestor = () => {
  const { data, isLoading } = useBIGestor();
  const navigate = useNavigate();
  const formatCurrency = (value: number | string) => `R$ ${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <>
      <Helmet>
        <title>BI Gestão | Promo Champions</title>
        <meta name="description" content="Business Intelligence para Gestores" />
      </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<BIGestorLoadingSkeleton />} duration={400}>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-display flex items-center gap-3"><Sparkles className="h-8 w-8 text-primary" /><span className="gradient-text">BI Gestão</span></h1>
                    <p className="text-muted-foreground font-medium mt-1">{currentMonth} • Visão consolidada do time</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {data && data.stagnantDeals > 0 && <Badge className="bg-warning/10 text-warning border-warning/30 animate-pulse-glow"><AlertTriangle className="h-3 w-3 mr-1" /> {data.stagnantDeals} deals estagnados</Badge>}
                    {data && data.missedGoals > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/30"><TrendingDown className="h-3 w-3 mr-1" /> {data.missedGoals} abaixo da meta</Badge>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { title: "Faturamento Time", value: formatCurrency(data?.totalTeamRevenue || 0), icon: DollarSign, change: data?.teamRevenueChange, variant: "primary" },
                { title: "Meta Time", value: formatCurrency(data?.totalTeamGoal || 0), icon: Target, progress: data?.teamGoalProgress },
                { title: "Pipeline Total", value: formatCurrency(data?.totalPipelineValue || 0), icon: Briefcase },
                { title: "Forecast Ponderado", value: formatCurrency(data?.weightedForecast || 0), icon: TrendingUp, variant: "success" },
                { title: "Vendedores Ativos", value: String(data?.activeSalespeople || 0), icon: Users },
                { title: "Performance Média", value: `${(data?.avgPerformance || 0).toFixed(0)}%`, icon: BarChart3 }
              ].map((stat, index) => (
                <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${100 + index * 80}ms` }}>
                  <Card className={cn("glass-card hover-lift press-scale group relative overflow-hidden", stat.variant === "primary" && "border-primary/30", stat.variant === "success" && "border-success/30")}>
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", stat.variant === "primary" && "bg-gradient-to-br from-primary/10 to-transparent", stat.variant === "success" && "bg-gradient-to-br from-success/10 to-transparent")} />
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110", stat.variant === "primary" ? "bg-gradient-to-br from-primary to-primary-glow" : stat.variant === "success" ? "bg-gradient-to-br from-success to-success/80" : "bg-muted")}>
                          <stat.icon className={cn("h-4 w-4", stat.variant ? "text-primary-foreground" : "text-muted-foreground")} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium truncate">{stat.title}</span>
                      </div>
                      <p className={cn("text-lg font-bold", stat.variant === "primary" && "gradient-text")}>{stat.value}</p>
                      {stat.change !== undefined && <span className={cn("text-xs font-medium", stat.change > 0 ? "text-success" : stat.change < 0 ? "text-destructive" : "text-muted-foreground")}>{stat.change > 0 && "+"}{stat.change.toFixed(1)}% vs mês anterior</span>}
                      {stat.progress !== undefined && <div className="mt-2"><Progress value={Math.min(stat.progress, 100)} className="h-1.5" /><span className="text-xs text-muted-foreground">{stat.progress.toFixed(0)}% da meta</span></div>}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <BIVendasMacro className="animate-slide-up" />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
                <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><TrendingUp className="h-4 w-4 text-primary-foreground" /></div>Evolução de Receita (6 meses)</CardTitle></CardHeader>
                <CardContent>
                  {data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={data.revenueByMonth}>
                        <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "var(--shadow-lg)" }} formatter={(value: any) => [formatCurrency(value), "Receita"]} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground"><div className="text-center"><BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" /><p>Sem dados</p></div></div>}
                </CardContent>
              </Card>

              <Card className="glass-card animate-slide-up" style={{ animationDelay: "450ms" }}>
                <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-xp to-primary"><PieIcon className="h-4 w-4 text-xp-foreground" /></div>Análise ABC</CardTitle></CardHeader>
                <CardContent>
                  {data?.abcClients && data.abcClients.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart><Pie data={data.abcClients} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="revenue">{data.abcClients.map((entry) => <Cell key={entry.classification} fill={ABC_COLORS[entry.classification as keyof typeof ABC_COLORS]} />)}</Pie><Tooltip formatter={(value: any) => [formatCurrency(value)]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} /></PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {data.abcClients.map(abc => (
                          <div key={abc.classification} className="flex items-center gap-2 text-sm hover-scale-sm cursor-default">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ABC_COLORS[abc.classification as keyof typeof ABC_COLORS] }} />
                            <span className="font-semibold">Classe {abc.classification}</span>
                            <span className="text-muted-foreground">• {abc.count} vendedores</span>
                            <span className="ml-auto font-bold">{formatCurrency(abc.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="h-[160px] flex items-center justify-center text-muted-foreground">Sem dados</div>}
                </CardContent>
              </Card>
            </div>

            {/* Pipeline & Deals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card animate-slide-up" style={{ animationDelay: "500ms" }}>
                <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><Briefcase className="h-4 w-4 text-primary-foreground" /></div>Saúde do Pipeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-xl glass hover-scale-sm"><p className="text-2xl font-black gradient-text">{data?.totalPipelineDeals || 0}</p><p className="text-xs text-muted-foreground font-medium">Deals</p></div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-warning/10 to-transparent border border-warning/20 hover-scale-sm"><p className="text-2xl font-black text-warning">{data?.atRiskDeals || 0}</p><p className="text-xs text-muted-foreground font-medium">Em Risco</p></div>
                    <div className="text-center p-3 rounded-xl glass hover-scale-sm"><p className="text-2xl font-black">{(data?.avgDaysInPipeline || 0).toFixed(0)}d</p><p className="text-xs text-muted-foreground font-medium">Média</p></div>
                  </div>
                  <div className="space-y-3">
                    {data?.dealsByStage.map((stage, idx) => (
                      <div key={stage.stage} className="animate-slide-up" style={{ animationDelay: `${550 + idx * 50}ms` }}>
                        <div className="flex items-center justify-between text-sm mb-1"><span className="font-medium">{STAGE_LABELS[stage.stage] || stage.stage}</span><span className="text-muted-foreground">{stage.count} • <span className="font-semibold text-foreground">{formatCurrency(stage.value)}</span></span></div>
                        <Progress value={stage.count > 0 ? (stage.value / (data?.totalPipelineValue || 1)) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card animate-slide-up" style={{ animationDelay: "550ms" }}>
                <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-chart-2 to-success"><Activity className="h-4 w-4 text-success-foreground" /></div>Deals por Fonte</CardTitle></CardHeader>
                <CardContent>
                  {data?.dealsBySource && data.dealsBySource.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.dealsBySource} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} formatter={(value: any) => [formatCurrency(value), "Valor"]} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">Sem dados</div>}
                </CardContent>
              </Card>
            </div>

            {/* Team Section */}
            <BIGestorTeamSection
              topPerformers={data?.topPerformers || []}
              underperformers={data?.underperformers || []}
              salespeoplePerformance={data?.salespeoplePerformance || []}
              formatCurrency={formatCurrency}
            />

            <BITopClientsSection className="animate-slide-up" />
            <BISalesInsights className="animate-slide-up" />

            <CriticalMomentsFeed
              onOpenRecording={() => navigate("/conversational-intelligence")}
            />
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
    </>
  );
};

export default BIGestor;
