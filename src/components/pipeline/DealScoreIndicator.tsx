import React from "react";
import { cn } from "@/lib/utils";
import { Brain, Zap, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DealScoreIndicatorProps {
  score: number;
  factors?: string[];
  className?: string;
}

export const DealScoreIndicator = ({ score, factors, className }: DealScoreIndicatorProps) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (s >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getIntensity = (s: number) => {
    if (s >= 80) return "high";
    if (s >= 50) return "medium";
    return "low";
  };

  const intensity = getIntensity(score);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-tighter transition-all duration-500 group cursor-help",
          getScoreColor(score),
          intensity === "high" && "shadow-[0_0_10px_rgba(16,185,129,0.2)]",
          className
        )}>
          <Brain className={cn(
            "h-3 w-3",
            intensity === "high" && "animate-pulse"
          )} />
          <span>Score IA: {score}</span>
          {intensity === "high" && <Zap className="h-2.5 w-2.5 fill-current animate-bounce" />}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-64 p-3 glass border-primary/20 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border/10 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Análise Preditiva</span>
            <Target className="h-3 w-3 text-primary" />
          </div>
          <div className="space-y-1">
            {factors && factors.length > 0 ? (
              factors.map((f, i) => {
                const isPositive = !f.toLowerCase().includes('baixa') && !f.toLowerCase().includes('atraso');
                return (
                  <div key={i} className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">{f}</span>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-muted-foreground italic">Processando variáveis comportamentais...</p>
            )}
          </div>
          <div className="pt-2 border-t border-border/10">
            <p className="text-[9px] text-muted-foreground italic leading-tight">
              A probabilidade é recalculada em tempo real com base em interações, fit e velocidade.
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
