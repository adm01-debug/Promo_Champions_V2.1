import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  MessageSquare,
  Briefcase,
  Brain,
  Zap,
  ArrowUpRight,
  Target,
  Users,
  Timer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ExecutiveSummaryReport } from './ExecutiveSummaryReport';
import { ScenarioSimulator } from './ScenarioSimulator';
import { RelationshipGraph } from './RelationshipGraph';
import { IntelligenceCommandBar } from './IntelligenceCommandBar';
import { ActivityPulse } from './ActivityPulse';
import { HealthGauge } from './HealthGauge';
import { PerformanceTrends } from './PerformanceTrends';
import { StrategicRecommendations } from './StrategicRecommendations';
import { useLatestBriefing } from '@/hooks/executive-briefing/useLatestBriefing';
import { useDashboardKPIsPeriod } from '@/hooks/dashboard/useDashboardKPIsPeriod';
import { motion } from 'framer-motion';

const IntelligenceCockpit = () => {
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const { data: briefing } = useLatestBriefing();
  const { data: kpis } = useDashboardKPIsPeriod('quarter');
  const revenueChange = kpis?.changes.revenue ?? 0;

  const hubs = [
    {
      title: 'Revenue Intelligence',
      description: 'Análise preditiva de receita e performance de vendas.',
      icon: TrendingUp,
      route: '/revenue-intelligence',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Conversational',
      description: 'Insights extraídos de reuniões e interações com clientes.',
      icon: MessageSquare,
      route: '/conversational-intelligence',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Deal Intelligence',
      description: 'Saúde do pipeline e identificação de riscos em deals.',
      icon: Briefcase,
      route: '/deal-intelligence',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Predictive AI',
      description: 'Modelos avançados para prospecção e fechamento.',
      icon: Brain,
      route: '/inteligencia-preditiva',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ExecutiveSummaryReport isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      {/* CEO Level Executive Summary */}
      <div className="relative p-8 rounded-3xl bg-black/40 border border-white/5 overflow-hidden group/hero">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center relative z-10">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Strategic Intelligence
              </Badge>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {new Date().toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  • Quarter {Math.floor(new Date().getMonth() / 3) + 1}
                </span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.9]">
              Intelligence{' '}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                Cockpit
              </span>
            </h1>

            <p className="text-muted-foreground text-sm max-w-xl font-medium leading-relaxed">
              Central de comando unificada. Insights de IA consolidados para decisões
              executivas de alta precisão e baixo risco.
            </p>
          </div>

          <Card className="p-6 border-white/5 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center gap-4 relative group/health min-h-[180px]">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/health:opacity-100 transition-opacity rounded-xl" />
            {briefing ? (
              <HealthGauge value={briefing.pulse_score} />
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Pulse score indisponível
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  Gere o briefing executivo para calcular o score
                </p>
              </div>
            )}
            {revenueChange !== 0 && (
              <div
                className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest ${revenueChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                <ArrowUpRight className="size-3" /> {revenueChange >= 0 ? '+' : ''}
                {revenueChange.toFixed(1)}% Receita vs Tri. anterior
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="-mt-12 relative z-20 px-8">
        <IntelligenceCommandBar />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1"
      >
        {hubs.map(hub => (
          <Card
            key={hub.title}
            className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/40 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5"
            onClick={() => navigate(hub.route)}
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${hub.bg}`}
            />

            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${hub.bg}`}>
                <hub.icon className={`w-5 h-5 ${hub.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h3 className="text-section-title mb-1 group-hover:text-primary transition-colors">
              {hub.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {hub.description}
            </p>

          </Card>
        ))}
      </motion.div>

      {/* Unified Insights & Strategic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceTrends />
            <ScenarioSimulator />
          </div>
          <Card className="p-6 border-border/40 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-section-title flex items-center gap-2 uppercase italic tracking-tighter">
                <Zap className="w-5 h-5 text-primary" />
                Strategic <span className="text-primary">Pulse</span>
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-background/50 text-[10px]">
                  Real-time Analysis
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  onClick={() => setReportOpen(true)}
                >
                  Gerar CEO Summary
                </Button>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-primary" /> Pulse Score
                    </span>
                    <span className="text-foreground">
                      {briefing ? `${briefing.pulse_score}/100` : '—'}
                    </span>
                  </div>
                  <Progress
                    value={briefing?.pulse_score ?? 0}
                    className="h-1.5 bg-primary/10"
                  />
                  <p className="text-[9px] text-muted-foreground font-medium">
                    {briefing
                      ? `Briefing de ${briefing.briefing_date}`
                      : 'Briefing executivo não gerado'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> Vitórias-Chave
                    </span>
                    <span className="text-foreground">
                      {briefing ? briefing.key_wins.length : '—'}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (briefing?.key_wins.length ?? 0) * 25)}
                    className="h-1.5 bg-blue-500/10"
                  />
                  <p className="text-[9px] text-muted-foreground font-medium">
                    Registradas no último briefing
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-500" /> Riscos Ativos
                    </span>
                    <span className="text-foreground">
                      {briefing ? briefing.key_risks.length : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.min(100, (briefing?.key_risks.length ?? 0) * 25)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium">
                    {briefing && briefing.key_risks[0]
                      ? briefing.key_risks[0].title
                      : 'Nenhum risco reportado'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-black/40 p-5 border border-primary/10 relative overflow-hidden group/insight">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/insight:rotate-12 transition-transform">
                  <Brain className="size-12" />
                </div>
                <h4 className="text-[10px] font-black mb-3 flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                  <Sparkles className="w-4 h-4" />
                  AI Strategic Insight
                </h4>
                {briefing ? (
                  <p className="text-sm text-card-foreground leading-relaxed font-medium">
                    <span className="font-black text-primary">{briefing.headline}</span>{' '}
                    — {briefing.narrative}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Nenhum insight estratégico disponível. Gere o briefing
                    executivo para consolidar vitórias, riscos e ações
                    recomendadas com dados reais.
                  </p>
                )}
                <div className="mt-4 flex gap-4">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[10px] font-bold text-primary group/link uppercase tracking-widest"
                    onClick={() => navigate('/revenue-intelligence')}
                  >
                    Explorar Forecast Detalhado{' '}
                    <ChevronRight className="size-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 border-border/40 bg-card/50">
            <ActivityPulse />
            <Button
              variant="outline"
              className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest h-9 border-white/5 bg-white/5 hover:bg-white/10"
              onClick={() => navigate('/atividades')}
            >
              Ver Histórico Completo
            </Button>
          </Card>

          <div className="h-[350px]">
            <RelationshipGraph />
          </div>

          <Card className="p-4 bg-gradient-to-br from-primary to-blue-600 border-none relative overflow-hidden group/ask">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover/ask:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Brain className="size-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Ask Anything AI
              </p>
            </div>
            <p className="text-[11px] text-white/80 mb-3 leading-snug relative z-10">
              Consulte qualquer KPI ou insight via linguagem natural.
            </p>
            <Button
              size="sm"
              className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-white text-primary hover:bg-white/90 border-none relative z-10"
              onClick={() => navigate('/assistente')}
            >
              Consultar Analista
            </Button>
          </Card>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="pt-8 border-t border-white/5"
      >
        <StrategicRecommendations />
      </motion.div>
    </div>
  );
};

export default IntelligenceCockpit;
