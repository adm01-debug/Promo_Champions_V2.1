import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Target, Sparkles, Brain, Cpu, Zap } from "lucide-react";
import {
  formatCompactBRL,
  scenarioColor,
  scenarioLabel,
  type ScenarioKey,
  deltaPct,
} from "./forecastHelpers";
import { cn } from "@/lib/utils";

interface Props {
  scenario: ScenarioKey;
  value: number;
  goal: number;
  index: number;
}

const ICONS: Record<ScenarioKey, any> = {
  pessimistic: TrendingDown,
  realistic: Zap,
  optimistic: Sparkles,
};

const THEMES: Record<ScenarioKey, { 
  border: string, 
  bg: string, 
  text: string, 
  accent: string,
  glow: string 
}> = {
  pessimistic: {
    border: "border-orange-500/20",
    bg: "bg-orange-500/5",
    text: "text-orange-500",
    accent: "bg-orange-500",
    glow: "shadow-orange-500/20"
  },
  realistic: {
    border: "border-primary/20",
    bg: "bg-primary/5",
    text: "text-primary",
    accent: "bg-primary",
    glow: "shadow-primary/20"
  },
  optimistic: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    text: "text-emerald-500",
    accent: "bg-emerald-500",
    glow: "shadow-emerald-500/20"
  },
};

export const ScenarioCard: FC<Props> = ({ scenario, value, goal, index }) => {
  const Icon = ICONS[scenario];
  const delta = deltaPct(value, goal);
  const reachesGoal = value >= goal && goal > 0;
  const theme = THEMES[scenario];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={cn(
        "glass relative overflow-hidden group border-2 transition-all duration-500", 
        theme.border,
        theme.bg,
        "hover:shadow-2xl",
        theme.glow
      )}>
        {/* Abstract Neural Patterns */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className={theme.text} />
            <path d="M0,30 Q25,80 50,30 T100,30" fill="none" stroke="currentColor" strokeWidth="0.5" className={theme.text} />
          </svg>
        </div>
        
        <div className={cn(
          "absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full", 
          theme.accent
        )} />
        
        <CardContent className="p-7 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl bg-background/60 border border-white/10 shadow-lg flex items-center justify-center", 
                theme.text
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">
                  Cenário IA
                </span>
                <span className={cn("text-sm font-black uppercase tracking-tight", theme.text)}>
                  {scenarioLabel[scenario]}
                </span>
              </div>
            </div>
            {goal > 0 && (
              <Badge variant="outline" className={cn(
                "text-[10px] h-6 px-3 border-white/10 font-black tracking-wider uppercase", 
                reachesGoal ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-white/5 text-muted-foreground"
              )}>
                {reachesGoal ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    Target OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(delta).toFixed(0)}% GAP
                  </span>
                )}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black opacity-20">R$</span>
              <CountUp value={value} className="text-5xl font-black font-display tracking-tighter leading-none" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: goal > 0 ? `${Math.min(100, (value/goal)*100)}%` : "0%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", theme.accent)} 
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
              <div className="flex items-center gap-1.5">
                <Target className="h-3 w-3" />
                <span>Meta Horizonte</span>
              </div>
              <span className="font-mono">{formatCompactBRL(goal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = easeOutExpo * (end - start) + start;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = formatCompactBRL(displayValue).replace('R$', '').trim();

  return (
    <span className={className}>
      {formatted}
    </span>
  );
};
