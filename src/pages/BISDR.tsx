import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useBIFilters } from "@/hooks/useBIFilters";
import { useBISDR } from "@/hooks/useBISDR";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { PageTransition, StaggeredContainer } from "@/components/transitions/PageTransition";
import { BIFilterBar, BIMetricCard, BIMetricsGrid, BIProjectionCard, BIComparisonCard, BIClientList } from "@/components/bi";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, UserCheck, Percent, Clock, Activity, Phone, Mail, Calendar, Trophy, TrendingUp, Sparkles, Zap, Linkedin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BISDRCharts } from "@/components/bi/BISDRCharts";

const BISDR = () => {
  const { salesperson } = useAuth();
  const filters = useBIFilters("this_month");
  const { data, isLoading, refetch } = useBISDR({ dateRange: filters.dateRange });

  return (
    <>
    <Helmet>
      <title>BI SDR | Promo Champions</title>
      <meta name="description" content="Business Intelligence para SDRs" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<VendedorDashboardLoadingSkeleton />} duration={400}>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl hover-scale">
                      <AvatarImage src={salesperson?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-bold">{salesperson?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    {data && data.goalProgress >= 100 && (<div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg animate-bounce-in"><Zap className="h-4 w-4 text-success-foreground" /></div>)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-display flex items-center justify-center md:justify-start gap-2"><Sparkles className="h-6 w-6 text-primary" /><span className="gradient-text">BI SDR</span></h1>
                    <p className="text-muted-foreground font-medium">{salesperson?.name} • {filters.periodLabel}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20"><Users className="h-3 w-3 mr-1" /> Prospecção</Badge>
                      {data && data.currentRank <= 3 && (<Badge className="rank-gold text-rank-gold-foreground"><Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}</Badge>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-muted-foreground font-medium">Meta de Atividades</span>
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="56" cy="56" r="48" fill="none" stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientSDR)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`} />
                        <defs><linearGradient id="gradientSDR" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--primary-glow))" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center"><span className={cn("text-xl font-black", data && data.goalProgress >= 100 ? "text-success" : "gradient-text")}>{(data?.goalProgress || 0).toFixed(0)}%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <BIFilterBar period={filters.period} onPeriodChange={filters.setPeriod} customRange={filters.customRange} onCustomRangeChange={filters.setCustomRange} onReset={filters.resetFilters} hasActiveFilters={filters.hasActiveFilters} isLoading={isLoading} onRefresh={() => refetch()} />

            <StaggeredContainer delay={0.1}>
              <BIMetricsGrid cols={6}>
                <BIMetricCard title="Leads Gerados" value={data?.totalLeadsGenerated || 0} icon={Users} variant="primary" comparison={{ previousPeriod: { value: data?.previousPeriod.totalLeads || 0, label: "Período Anterior" }, lastYear: { value: data?.sameLastYear.totalLeads || 0, label: "Mesmo Período Ano Anterior" } }} delay={0} />
                <BIMetricCard title="Leads Qualificados" value={data?.qualifiedLeads || 0} icon={UserCheck} variant="success" comparison={{ previousPeriod: { value: data?.previousPeriod.qualifiedLeads || 0, label: "Período Anterior" } }} delay={1} />
                <BIMetricCard title="Taxa de Qualificação" value={data?.qualificationRate || 0} icon={Percent} format="percent" delay={2} />
                <BIMetricCard title="Tempo Médio Qualif." value={`${(data?.avgQualificationTime || 0).toFixed(1)}d`} icon={Clock} delay={3} />
                <BIMetricCard title="Total Atividades" value={data?.totalActivities || 0} icon={Activity} variant="warning" comparison={{ previousPeriod: { value: data?.previousPeriod.totalActivities || 0, label: "Período Anterior" } }} delay={4} />
                <BIMetricCard title="Ranking SDR" value={`#${data?.currentRank || "-"}`} icon={Trophy} variant={data && data.currentRank <= 3 ? "success" : "default"} subtitle={`de ${data?.totalSDRs || 0} SDRs`} delay={5} />
              </BIMetricsGrid>
            </StaggeredContainer>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Phone, value: data?.totalCalls || 0, label: "Ligações", color: "blue-500" },
                { icon: Mail, value: data?.totalEmails || 0, label: "E-mails", color: "green-500" },
                { icon: Linkedin, value: data?.totalLinkedIn || 0, label: "LinkedIn", color: "cyan-500" },
                { icon: MessageCircle, value: data?.totalWhatsApp || 0, label: "WhatsApp", color: "emerald-500" },
                { icon: Calendar, value: data?.totalMeetings || 0, label: "Reuniões", color: "purple-500" },
                { icon: TrendingUp, value: (data?.avgActivitiesPerDay || 0).toFixed(1), label: "Média/dia", color: "orange-500" },
              ].map(({ icon: Icon, value, label, color }) => (
                <Card key={label} className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-${color}/15`}><Icon className={`h-5 w-5 text-${color}`} /></div>
                    <div><p className="text-metric">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIProjectionCard title="Projeção de Leads" currentValue={data?.totalLeadsGenerated || 0} projectedValue={data?.projectedLeads || 0} goalValue={data?.leadGoal || 50} daysRemaining={data?.dailyLeadsNeeded ? Math.ceil((data.leadGoal - data.totalLeadsGenerated) / data.dailyLeadsNeeded) : 0} dailyRequired={data?.dailyLeadsNeeded || 0} format="number" />
              <BIComparisonCard title="Atividades" currentValue={data?.totalActivities || 0} previousValue={data?.previousPeriod.totalActivities || 0} lastYearValue={data?.sameLastYear.totalActivities || 0} format="number" />
            </div>

            <BISDRCharts leadsByDay={data?.leadsByDay} activitiesByDay={data?.activitiesByDay} conversionFunnel={data?.conversionFunnel} leadsBySource={data?.leadsBySource} />

            <BIClientList title="Top Prospects no Pipeline" clients={data?.topProspects?.map(p => ({ name: p.name, company: p.company, totalValue: p.value, daysInPipeline: p.daysInPipeline })) || []} type="prospects" maxItems={5} />
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default BISDR;
