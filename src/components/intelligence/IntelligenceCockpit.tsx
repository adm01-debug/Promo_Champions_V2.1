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
  Timer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Intelligence <span className="text-primary italic">Cockpit</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de comando integrada para decisões baseadas em dados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/relatorios")}>
            Relatório Completo
          </Button>
          <Button size="sm" className="shadow-lg shadow-primary/20">
            Gerar Insights IA
          </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub) => (
          <Card 
            key={hub.title}
            className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => navigate(hub.route)}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${hub.bg}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${hub.bg}`}>
                <hub.icon className={`w-5 h-5 ${hub.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{hub.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{hub.description}</p>
            
            <div className="pt-4 border-t border-border/40 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{hub.stats.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono">{hub.stats.value}</span>
                  <span className={`text-[10px] font-medium ${hub.stats.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {hub.stats.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Unified Insights & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border/40 bg-card/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Intelligence Pulse
            </h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium animate-pulse">
              LIVE DATA
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Target className="w-3 h-3" /> Meta Trimestral
                  </span>
                  <span className="font-mono font-medium">82%</span>
                </div>
                <Progress value={82} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Sentiment Index
                  </span>
                  <span className="font-mono font-medium">74%</span>
                </div>
                <Progress value={74} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Sales Velocity
                  </span>
                  <span className="font-mono font-medium">18d</span>
                </div>
                <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%]" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/20 p-4 border border-border/20">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                Executive Summary (AI)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A performance deste mês indica um crescimento orgânico de 12% no pipeline qualificado. 
                O <span className="text-primary font-medium">Conversational Intelligence</span> detectou um aumento de 15% em menções competitivas da "Concorrente X", sugerindo a necessidade de ajuste imediato nos Battle Cards. 
                O forecast atual projeta um fechamento de <span className="text-foreground font-semibold">R$ 2.4M</span> com 88% de confiança.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/40 bg-card/50">
          <h3 className="font-semibold mb-4">Critical Alerts</h3>
          <div className="space-y-4">
            {[
              { label: "Deal Stalled", desc: "Acme Corp parado há 12 dias", color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Low Sentiment", desc: "Call com João Silva apresentou sinais de risco", color: "text-rose-500", bg: "bg-rose-500/10" },
              { label: "Pipeline Gap", desc: "Necessário +R$ 400k para atingir meta", color: "text-blue-500", bg: "bg-blue-500/10" }
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/40">
                <div className={`w-1 rounded-full ${alert.color.replace('text', 'bg')}`} />
                <div>
                  <p className={`text-xs font-bold uppercase ${alert.color}`}>{alert.label}</p>
                  <p className="text-xs text-muted-foreground">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground hover:text-primary">
            Ver Todas Notificações
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default IntelligenceCockpit;