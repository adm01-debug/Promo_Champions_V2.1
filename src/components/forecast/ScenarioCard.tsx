import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Target, Sparkles } from "lucide-react";
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

const ICONS: Record<ScenarioKey, typeof TrendingUp> = {
  pessimistic: TrendingDown,
  realistic: Target,
  optimistic: TrendingUp,
};

const SCENARIO_THEME: Record<ScenarioKey, string> = {
  pessimistic: "border-warning/20 bg-warning/5 text-warning shadow-warning/5",
  realistic: "border-primary/20 bg-primary/5 text-primary shadow-primary/5",
  optimistic: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500 shadow-emerald-500/5",
};

export const ScenarioCard: FC<Props> = ({ scenario, value, goal, index }) => {
  const Icon = ICONS[scenario];
  const delta = deltaPct(value, goal);
  const reachesGoal = value >= goal && goal > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={cn("glass relative overflow-hidden group border-2", SCENARIO_THEME[scenario])}>
        <div className={cn("absolute -right-6 -top-6 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full", SCENARIO_THEME[scenario].split(' ')[1].replace('/5', ''))} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={cn("p-1.5 rounded-lg bg-background/50 border border-white/10", SCENARIO_THEME[scenario].split(' ')[2])}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                {scenarioLabel[scenario]}
              </span>
            </div>
            {goal > 0 && (
              <Badge variant="outline" className={cn("text-[10px] h-5 border-white/10 font-bold", reachesGoal ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5")}>
                {reachesGoal ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    BATE META
                  </span>
                ) : `${delta.toFixed(0)}% VS META`}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold opacity-60">R$</span>
            <CountUp value={value} className="text-4xl font-black font-display tracking-tighter" />
          </div>
          {goal > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter opacity-60">
              <span>Alvo Recomendado</span>
              <span>{formatCompactBRL(goal)}</span>
            </div>
          )}
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
    const duration = 2000;
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
