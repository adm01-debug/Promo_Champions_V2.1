import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { Button } from "@/components/ui/button";

interface ArenaAITipsProps {
  data: ActivityGoalProgress[];
}

export const ArenaAITips: React.FC<ArenaAITipsProps> = ({ data }) => {
  const tips = useMemo(() => {
    const activeData = data.filter(d => d.hasGoals);
    if (activeData.length === 0) return [];

    const results = [];
    const laggard = [...activeData].sort((a, b) => a.progress.overall - b.progress.overall)[0];
    const leader = [...activeData].sort((a, b) => b.progress.overall - a.progress.overall)[0];
    const lowCalls = activeData.filter(d => (d.current.calls / d.goals.calls) < 0.4);

    if (laggard && laggard.progress.overall < 40) {
      results.push({
        id: 1,
        title: "Protocolo de Recuperação",
        description: `${laggard.salesperson_name} está em zona crítica (${laggard.progress.overall.toFixed(0)}%). Necessário reforço imediato em prospecção fria.`,
        impact: "Crítico",
        color: "text-status-error",
        bgColor: "bg-status-error/10"
      });
    }

    if (lowCalls.length > 0) {
      results.push({
        id: 2,
        title: "Gargalo de Conexão",
        description: `Detectado baixo volume de ligações em ${lowCalls.length} pilotos. Sugestão: Iniciar 'Power Hour' de chamadas agora.`,
        impact: "Alta",
        color: "text-primary",
        bgColor: "bg-primary/10"
      });
    }

    if (leader && leader.progress.overall >= 90) {
      results.push({
        id: 3,
        title: "Otimização de Fechamento",
        description: `${leader.salesperson_name} está a um passo do 100%. Priorizar follow-up de propostas enviadas hoje.`,
        impact: "Oportunidade",
        color: "text-status-success",
        bgColor: "bg-status-success/10"
      });
    }

    return results.slice(0, 2);
  }, [data]);

  if (tips.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">AI Strategy Copilot</h3>
      </div>
      
      {tips.map(tip => (
        <Card key={tip.id} className={cn("border bg-background/40 backdrop-blur-xl shadow-2xl group transition-all duration-500 overflow-hidden relative", tip.color.replace('text-', 'border-') + '/20', "hover:border-opacity-100")}>
          <div className={cn("absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 opacity-20", tip.bgColor)} />
          <CardContent className="p-4 flex gap-4 relative z-10">
            <div className="mt-1">
              <div className={cn("p-2 rounded-xl bg-background border shadow-inner group-hover:rotate-12 transition-transform", tip.color.replace('text-', 'border-') + '/20')}>
                <Lightbulb className={cn("h-4 w-4", tip.color)} />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", tip.color)}>{tip.title}</span>
                <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full uppercase", tip.bgColor, tip.color)}>Impacto: {tip.impact}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-foreground/80">
                {tip.description}
              </p>
              <Button variant="ghost" size="sm" className="h-6 p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent group-hover:gap-2 transition-all">
                Executar Agora <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};