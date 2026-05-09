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

    const laggard = [...activeData].sort((a, b) => a.progress.overall - b.progress.overall)[0];
    const leader = [...activeData].sort((a, b) => b.progress.overall - a.progress.overall)[0];

    return [
      {
        id: 1,
        title: "Estratégia de Recuperação",
        description: `${laggard.salesperson_name} está com volume baixo de emails. Sugestão: Disparar cadência de reativação agora.`,
        impact: "Alta"
      },
      {
        id: 2,
        title: "Momento de Escala",
        description: `${leader.salesperson_name} está em 'Hot Streak'. Faltam 3 reuniões para o recorde semanal.`,
        impact: "Média"
      }
    ];
  }, [data]);

  if (tips.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">AI Strategy Copilot</h3>
      </div>
      
      {tips.map(tip => (
        <Card key={tip.id} className="border border-primary/10 bg-background/40 backdrop-blur-xl shadow-2xl group hover:border-primary/40 transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10 group-hover:scale-150" />
          <CardContent className="p-4 flex gap-4 relative z-10">
            <div className="mt-1">
              <div className="p-2 rounded-xl bg-background border border-primary/20 shadow-inner group-hover:rotate-12 transition-transform">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{tip.title}</span>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase">Impacto: {tip.impact}</span>
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