import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, TrendingUp, TrendingDown, Sparkles, Users, ArrowRight, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SchedulingRateGaugeProps {
  rate: number;
  change?: number;
  meetings: number;
  leads: number;
}

export function SchedulingRateGauge({ rate, change, meetings, leads }: SchedulingRateGaugeProps) {
  const isPositive = (change ?? 0) >= 0;
  
  const getRateColor = (rate: number) => {
    if (rate >= 20) return "text-status-success";
    if (rate >= 10) return "text-streak";
    return "text-status-error";
  };

  const getRateLabel = (rate: number) => {
    if (rate >= 25) return "Excepcional";
    if (rate >= 20) return "Excelente";
    if (rate >= 15) return "Muito Bom";
    if (rate >= 10) return "Bom";
    if (rate >= 5) return "Regular";
    return "Crítico";
  };

  const getRateBgColor = (rate: number) => {
    if (rate >= 20) return "bg-status-success/15 border-status-success/30";
    if (rate >= 10) return "bg-streak/15 border-streak/30";
    return "bg-status-error/15 border-status-error/30";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 20) return "[&>div]:bg-gradient-to-r [&>div]:from-status-success [&>div]:to-status-success/70";
    if (rate >= 10) return "[&>div]:bg-gradient-to-r [&>div]:from-streak [&>div]:to-streak/70";
    return "[&>div]:bg-gradient-to-r [&>div]:from-status-error [&>div]:to-status-error/70";
  };

  // Calculate circular progress for gauge
  const gaugePercentage = Math.min(rate / 30 * 100, 100); // 30% is max for visual
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (gaugePercentage / 100) * circumference;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Animated sparkles for high rates */}
      {rate >= 20 && (
        <>
          <Sparkles className="absolute top-4 right-4 h-5 w-5 text-primary/40 animate-pulse" />
          <Sparkles className="absolute top-8 right-12 h-3 w-3 text-accent/40 animate-pulse" style={{ animationDelay: '300ms' }} />
        </>
      )}

      <CardContent className="p-6">
        {/* Header with label */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <CalendarCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              {rate >= 20 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-status-success flex items-center justify-center animate-bounce">
                  <Trophy className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display gradient-text">Taxa de Agendamento</h2>
              <p className="text-xs text-muted-foreground">KPI Principal SDR</p>
            </div>
          </div>
          
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm border-primary/30 bg-primary/5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Principal
          </Badge>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center justify-center md:col-span-1">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn(
                  "text-3xl font-bold font-display transition-colors",
                  getRateColor(rate)
                )}>
                  {rate.toFixed(1)}%
                </span>
                {change !== undefined && (
                  <span className={cn(
                    "flex items-center text-xs font-medium mt-1",
                    isPositive ? "text-status-success" : "text-status-error"
                  )}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Status badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "mt-3 gap-1.5 border font-medium",
                getRateBgColor(rate),
                getRateColor(rate)
              )}
            >
              {rate >= 20 && <Trophy className="h-3 w-3" />}
              {getRateLabel(rate)}
            </Badge>
          </div>

          {/* Stats breakdown */}
          <div className="md:col-span-2 space-y-4">
            {/* Conversion flow */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
              <div className="flex flex-col items-center">
                <div className="p-2.5 rounded-lg bg-primary/10 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-metric">{leads}</span>
                <span className="text-xs text-muted-foreground">Leads</span>
              </div>
              
              <div className="flex flex-col items-center px-4">
                <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-status-success/50 mt-1" />
              </div>
              
              <div className="flex flex-col items-center">
                <div className="p-2.5 rounded-lg bg-status-success/10 mb-2">
                  <CalendarCheck className="h-5 w-5 text-status-success" />
                </div>
                <span className="text-2xl font-bold font-display text-status-success">{meetings}</span>
                <span className="text-xs text-muted-foreground">Reuniões</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso vs Meta (15%)</span>
                <span className={cn("font-medium", getRateColor(rate))}>
                  {rate >= 15 ? `+${(rate - 15).toFixed(1)}% acima` : `${(15 - rate).toFixed(1)}% faltando`}
                </span>
              </div>
              <Progress 
                value={Math.min((rate / 15) * 100, 100)} 
                className={cn("h-3", getProgressColor(rate))}
              />
            </div>

            {/* Benchmark info */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-status-error/5 border border-status-error/20">
                <span className="text-xs text-status-error font-medium">{"<10%"}</span>
                <p className="text-[10px] text-muted-foreground">Crítico</p>
              </div>
              <div className="p-2 rounded-lg bg-streak/5 border border-streak/20">
                <span className="text-xs text-streak font-medium">10-15%</span>
                <p className="text-[10px] text-muted-foreground">Bom</p>
              </div>
              <div className="p-2 rounded-lg bg-status-success/5 border border-status-success/20">
                <span className="text-xs text-status-success font-medium">{">15%"}</span>
                <p className="text-[10px] text-muted-foreground">Excelente</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
