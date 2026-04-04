import React from "react";
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface BIProjectionCardProps {
  title: string;
  currentValue: number;
  projectedValue: number;
  goalValue: number;
  daysRemaining: number;
  dailyRequired: number;
  format?: "currency" | "number";
  className?: string;
}

const formatValue = (value: number, format: "currency" | "number" = "currency"): string => {
  if (format === "currency") {
    return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
};

export const BIProjectionCard: FC<BIProjectionCardProps> = ({
  title,
  currentValue,
  projectedValue,
  goalValue,
  daysRemaining,
  dailyRequired,
  format = "currency",
  className
}) => {
  const progress = goalValue > 0 ? (currentValue / goalValue) * 100 : 0;
  const projectedProgress = goalValue > 0 ? (projectedValue / goalValue) * 100 : 0;
  const willMeetGoal = projectedValue >= goalValue;
  const gap = goalValue - projectedValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "glass-card relative overflow-hidden",
        willMeetGoal ? "border-success/30" : "border-warning/30",
        className
      )}>
        {/* Gradient background */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          willMeetGoal 
            ? "bg-gradient-to-br from-success/5 via-transparent to-transparent" 
            : "bg-gradient-to-br from-warning/5 via-transparent to-transparent"
        )} />

        <CardHeader className="pb-2 relative">
          <CardTitle className="text-lg font-display flex items-center justify-between">
            <span>{title}</span>
            <Badge 
              variant="secondary" 
              className={cn(
                willMeetGoal 
                  ? "bg-success/10 text-success border-success/20" 
                  : "bg-warning/10 text-warning border-warning/20"
              )}
            >
              {willMeetGoal ? (
                <><TrendingUp className="h-3 w-3 mr-1" /> No caminho</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" /> Atenção</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Current vs Goal */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Realizado</p>
              <p className="text-2xl font-bold gradient-text">{formatValue(currentValue, format)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-lg font-semibold">{formatValue(goalValue, format)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{progress.toFixed(0)}% alcançado</span>
              <span className="font-medium">{formatValue(goalValue - currentValue, format)} restante</span>
            </div>
            <div className="relative">
              <Progress value={Math.min(progress, 100)} className="h-3" />
              {/* Projection marker */}
              {projectedProgress <= 120 && (
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-primary"
                  style={{ left: `${Math.min(projectedProgress, 100)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary whitespace-nowrap font-medium">
                    Projeção
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projection */}
          <div className={cn(
            "p-3 rounded-lg",
            willMeetGoal ? "bg-success/10" : "bg-warning/10"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={cn("h-4 w-4", willMeetGoal ? "text-success" : "text-warning")} />
              <span className="text-sm font-medium">Projeção de Fechamento</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              willMeetGoal ? "text-success" : "text-warning"
            )}>
              {formatValue(projectedValue, format)}
            </p>
            {!willMeetGoal && (
              <p className="text-xs text-muted-foreground mt-1">
                Gap de {formatValue(gap, format)} para a meta
              </p>
            )}
          </div>

          {/* Daily Required */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Dias restantes</p>
                <p className="font-semibold">{daysRemaining}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Necessário/dia</p>
              <p className="font-semibold">{formatValue(dailyRequired, format)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Comparison Period Card
interface BIComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  lastYearValue: number;
  format?: "currency" | "percent" | "number";
  className?: string;
}

export const BIComparisonCard: FC<BIComparisonCardProps> = ({
  title,
  currentValue,
  previousValue,
  lastYearValue,
  format = "currency",
  className
}) => {
  const formatVal = (v: number) => {
    if (format === "currency") return `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
    if (format === "percent") return `${v.toFixed(1)}%`;
    return v.toLocaleString("pt-BR");
  };

  const previousChange = previousValue > 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  const yearChange = lastYearValue > 0 
    ? ((currentValue - lastYearValue) / lastYearValue) * 100 
    : 0;

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-2xl font-bold gradient-text">{formatVal(currentValue)}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {/* vs Previous Period */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">vs Período Anterior</p>
            <div className="flex items-center gap-2">
              {previousChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "font-medium",
                previousChange >= 0 ? "text-success" : "text-destructive"
              )}>
                {previousChange >= 0 ? "+" : ""}{previousChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{formatVal(previousValue)}</p>
          </div>

          {/* vs Same Period Last Year */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">vs Ano Anterior</p>
            <div className="flex items-center gap-2">
              {yearChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "font-medium",
                yearChange >= 0 ? "text-success" : "text-destructive"
              )}>
                {yearChange >= 0 ? "+" : ""}{yearChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{formatVal(lastYearValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
