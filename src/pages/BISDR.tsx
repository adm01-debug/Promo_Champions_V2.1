import { useAuth } from "@/contexts/AuthContext";
import { useBIFilters } from "@/hooks/useBIFilters";
import { useBISDR } from "@/hooks/useBISDR";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { PageTransition, StaggeredContainer } from "@/components/transitions/PageTransition";
import { 
  BIFilterBar, 
  BIMetricCard, 
  BIMetricsGrid, 
  BIProjectionCard,
  BIComparisonCard,
  BIClientList 
} from "@/components/bi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Percent,
  Clock,
  Activity,
  Phone,
  Mail,
  Calendar,
  Trophy,
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const BISDR = () => {
  const { salesperson } = useAuth();
  const filters = useBIFilters("this_month");
  const { data, isLoading, refetch } = useBISDR({ 
    dateRange: filters.dateRange 
  });

  

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<VendedorDashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl hover-scale">
                      <AvatarImage src={salesperson?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-bold">
                        {salesperson?.name?.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {data && data.goalProgress >= 100 && (
                      <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg animate-bounce-in">
                        <Zap className="h-4 w-4 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-display flex items-center justify-center md:justify-start gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <span className="gradient-text">BI SDR</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">{salesperson?.name} • {filters.periodLabel}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Users className="h-3 w-3 mr-1" /> Prospecção
                      </Badge>
                      {data && data.currentRank <= 3 && (
                        <Badge className="rank-gold text-rank-gold-foreground">
                          <Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Goal Progress Circle */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-muted-foreground font-medium">Meta de Atividades</span>
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientSDR)"}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`}
                        />
                        <defs>
                          <linearGradient id="gradientSDR" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn(
                          "text-xl font-black",
                          data && data.goalProgress >= 100 ? "text-success" : "gradient-text"
                        )}>
                          {(data?.goalProgress || 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <BIFilterBar
              period={filters.period}
              onPeriodChange={filters.setPeriod}
              customRange={filters.customRange}
              onCustomRangeChange={filters.setCustomRange}
              onReset={filters.resetFilters}
              hasActiveFilters={filters.hasActiveFilters}
              isLoading={isLoading}
              onRefresh={() => refetch()}
            />

            {/* KPI Metrics */}
            <StaggeredContainer delay={0.1}>
              <BIMetricsGrid cols={6}>
                <BIMetricCard
                  title="Leads Gerados"
                  value={data?.totalLeadsGenerated || 0}
                  icon={Users}
                  variant="primary"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.totalLeads || 0, 
                      label: "Período Anterior" 
                    },
                    lastYear: { 
                      value: data?.sameLastYear.totalLeads || 0, 
                      label: "Mesmo Período Ano Anterior" 
                    }
                  }}
                  delay={0}
                />
                <BIMetricCard
                  title="Leads Qualificados"
                  value={data?.qualifiedLeads || 0}
                  icon={UserCheck}
                  variant="success"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.qualifiedLeads || 0, 
                      label: "Período Anterior" 
                    }
                  }}
                  delay={1}
                />
                <BIMetricCard
                  title="Taxa de Qualificação"
                  value={data?.qualificationRate || 0}
                  icon={Percent}
                  format="percent"
                  delay={2}
                />
                <BIMetricCard
                  title="Tempo Médio Qualif."
                  value={`${(data?.avgQualificationTime || 0).toFixed(1)}d`}
                  icon={Clock}
                  delay={3}
                />
                <BIMetricCard
                  title="Total Atividades"
                  value={data?.totalActivities || 0}
                  icon={Activity}
                  variant="warning"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.totalActivities || 0, 
                      label: "Período Anterior" 
                    }
                  }}
                  delay={4}
                />
                <BIMetricCard
                  title="Ranking SDR"
                  value={`#${data?.currentRank || "-"}`}
                  icon={Trophy}
                  variant={data && data.currentRank <= 3 ? "success" : "default"}
                  subtitle={`de ${data?.totalSDRs || 0} SDRs`}
                  delay={5}
                />
              </BIMetricsGrid>
            </StaggeredContainer>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/15">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.totalCalls || 0}</p>
                    <p className="text-xs text-muted-foreground">Ligações</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-500/15">
                    <Mail className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.totalEmails || 0}</p>
                    <p className="text-xs text-muted-foreground">E-mails</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/15">
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.totalMeetings || 0}</p>
                    <p className="text-xs text-muted-foreground">Reuniões</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/15">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(data?.avgActivitiesPerDay || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Média/dia</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projection & Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIProjectionCard
                title="Projeção de Leads"
                currentValue={data?.totalLeadsGenerated || 0}
                projectedValue={data?.projectedLeads || 0}
                goalValue={data?.leadGoal || 50}
                daysRemaining={data?.dailyLeadsNeeded ? Math.ceil((data.leadGoal - data.totalLeadsGenerated) / data.dailyLeadsNeeded) : 0}
                dailyRequired={data?.dailyLeadsNeeded || 0}
                format="number"
              />
              <BIComparisonCard
                title="Atividades"
                currentValue={data?.totalActivities || 0}
                previousValue={data?.previousPeriod.totalActivities || 0}
                lastYearValue={data?.sameLastYear.totalActivities || 0}
                format="number"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leads by Day */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                      <TrendingUp className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Leads por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.leadsByDay && data.leadsByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={data.leadsByDay}>
                        <defs>
                          <linearGradient id="colorLeadsGen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorLeadsQual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                        />
                        <Area type="monotone" dataKey="generated" name="Gerados" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorLeadsGen)" />
                        <Area type="monotone" dataKey="qualified" name="Qualificados" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#colorLeadsQual)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum lead no período</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activities by Day */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-chart-2 to-success">
                      <Activity className="h-4 w-4 text-success-foreground" />
                    </div>
                    Atividades por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.activitiesByDay && data.activitiesByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.activitiesByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                        />
                        <Bar dataKey="count" name="Atividades" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma atividade no período</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Funnel & Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Funil de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.conversionFunnel && (
                    <div className="space-y-3">
                      {data.conversionFunnel.map((stage) => (
                        <div key={stage.stage} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{stage.stage}</span>
                            <span className="text-muted-foreground">
                              {stage.count} ({stage.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-6 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500"
                              style={{ width: `${stage.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leads by Source */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Leads por Fonte</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.leadsBySource && data.leadsBySource.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.leadsBySource}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="source"
                        >
                          {data.leadsBySource.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} leads`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {data?.leadsBySource?.map((src, idx) => (
                      <Badge key={src.source} variant="outline" className="text-xs">
                        <div 
                          className="w-2 h-2 rounded-full mr-1.5" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {src.source}: {src.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Prospects */}
            <BIClientList
              title="Top Prospects no Pipeline"
              clients={data?.topProspects?.map(p => ({
                name: p.name,
                company: p.company,
                totalValue: p.value,
                daysInPipeline: p.daysInPipeline
              })) || []}
              type="prospects"
              maxItems={5}
            />
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default BISDR;
