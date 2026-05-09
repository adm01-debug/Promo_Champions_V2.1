import { Card } from "@/components/ui/card";
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
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const IntelligenceCockpit = () => {
  const navigate = useNavigate();

  const hubs = [
    {
      title: "Revenue Intelligence",
      description: "Análise preditiva de receita e performance de vendas.",
      icon: TrendingUp,
      route: "/revenue-intelligence",
      stats: { label: "Forecast Accuracy", value: "94%", trend: "+2.4%" },
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Conversational",
      description: "Insights extraídos de reuniões e interações com clientes.",
      icon: MessageSquare,
      route: "/conversational-intelligence",
      stats: { label: "Positive Sentiment", value: "78%", trend: "+5.1%" },
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Deal Intelligence",
      description: "Saúde do pipeline e identificação de riscos em deals.",
      icon: Briefcase,
      route: "/deal-intelligence",
      stats: { label: "Win Rate Prob.", value: "62%", trend: "-1.2%" },
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Predictive AI",
      description: "Modelos avançados para prospecção e fechamento.",
      icon: Brain,
      route: "/inteligencia-preditiva",
      stats: { label: "Next Best Action", value: "89", trend: "+12" },
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* CEO Level Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Executive View</Badge>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">May 2026 • Quarter 2</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase italic leading-none">
            Intelligence <span className="text-primary">Cockpit</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Sua central de comando unificada. Insights de IA consolidados de todos os módulos para decisões estratégicas rápidas.
          </p>
        </div>
        
        <Card className="p-4 border-primary/30 bg-primary/5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Business Health Score</p>
            <div className="text-3xl font-black text-primary">88/100</div>
          </div>
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
            <ShieldCheck className="size-6 text-primary" />
          </div>
        </Card>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub) => (
          <Card 
            key={hub.title}
            className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/40 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5"
            onClick={() => navigate(hub.route)}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${hub.bg}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${hub.bg}`}>
                <hub.icon className={`w-5 h-5 ${hub.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{hub.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{hub.description}</p>
            
            <div className="pt-4 border-t border-border/40 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{hub.stats.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono">{hub.stats.value}</span>
                  <span className={`text-[10px] font-bold ${hub.stats.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {hub.stats.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Unified Insights & Strategic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border/40 bg-gradient-to-br from-card to-primary/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Strategic Pulse
            </h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background/50">Real-time Analysis</Badge>
              <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-widest">Export QBR</Button>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-primary" /> Meta do Quarter
                  </span>
                  <span className="text-foreground">82%</span>
                </div>
                <Progress value={82} className="h-2 bg-primary/10" />
                <p className="text-[10px] text-muted-foreground italic">Faltam R$ 420k para o Target</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Market Sentiment
                  </span>
                  <span className="text-foreground">Saudável (74)</span>
                </div>
                <Progress value={74} className="h-2 bg-blue-500/10" />
                <p className="text-[10px] text-muted-foreground italic">Baseado em 142 reuniões IA</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-500" /> Sales Cycle
                  </span>
                  <span className="text-foreground">18.4 dias</span>
                </div>
                <div className="h-2 w-full bg-amber-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[65%]" />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Redução de 2.1d vs. Mês Anterior</p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Brain className="size-12" />
              </div>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                AI Strategic Insight
              </h4>
              <p className="text-sm text-card-foreground leading-relaxed">
                A performance atual projeta um fechamento de <span className="font-black text-primary underline decoration-2 underline-offset-4">R$ 2.48M</span>. O <span className="font-bold">Deal Intelligence</span> identificou uma concentração de 42% da receita em apenas 3 grandes contas (Risco de Concentração). O módulo <span className="font-bold">Conversational</span> alerta para um aumento de menções ao concorrente <span className="italic">"NexGen"</span> em reuniões de descoberta.
              </p>
              <div className="mt-4 flex gap-4">
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary group/link">
                  Explorar Forecast Detalhado <ChevronRight className="size-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 border-border/40 bg-card/50">
            <h3 className="font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs text-muted-foreground">
              <AlertCircle className="size-4 text-destructive" />
              Prioridades do Gestor (AI)
            </h3>
            <div className="space-y-4">
              {[
                { label: "Deal Stalled", desc: "Acme Corp parado há 12 dias", color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Risco de Churn", desc: "Cliente 'Global Tech' reduziu uso em 30%", color: "text-rose-500", bg: "bg-rose-500/10" },
                { label: "Pipeline Gap", desc: "Necessário +R$ 400k para atingir meta", color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Coaching Ops", desc: "SDR João com 15% win-rate em calls", color: "text-purple-500", bg: "bg-purple-500/10" }
              ].map((alert, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/40 group cursor-pointer">
                  <div className={`w-1 rounded-full ${alert.color.replace('text', 'bg')} transition-all group-hover:w-1.5`} />
                  <div>
                    <p className={`text-[10px] font-black uppercase ${alert.color}`}>{alert.label}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest h-9">
              Abrir Central de Alertas
            </Button>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Brain className="size-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-tighter">Ask Anything AI</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3 leading-snug">Pergunte qualquer coisa sobre o seu negócio para a nossa inteligência.</p>
            <Button size="sm" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-purple-500 hover:bg-purple-600 text-white border-none">Consultar Analista</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceCockpit;

export default IntelligenceCockpit;