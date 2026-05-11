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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <Card className={`border ${scenarioColor[scenario]} hover:shadow-md transition-shadow`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {scenarioLabel[scenario]}
              </span>
            </div>
            {goal > 0 && (
              <Badge variant="outline" className="text-[10px] h-5">
                {reachesGoal ? "Atinge meta" : `${delta.toFixed(0)}% vs meta`}
              </Badge>
            )}
          </div>
          <div className="font-display text-3xl font-semibold tracking-tight">
            {formatCompactBRL(value)}
          </div>
          {goal > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Meta: {formatCompactBRL(goal)}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
