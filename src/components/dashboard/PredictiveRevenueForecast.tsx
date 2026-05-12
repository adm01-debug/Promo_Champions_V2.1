import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Target, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const PredictiveRevenueForecast = () => {
  const [horizon, setHorizon] = useState(30);

  const { data: forecast, isLoading } = useQuery({
    queryKey: ["revenue-forecast-ai", horizon],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("revenue-forecast-ai", {
        body: { horizon_days: horizon, include_ai: true },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  if (isLoading) {
    return (
      <div className="h-[350px] w-full rounded-xl bg-card border border-border/40 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const confidenceColor = forecast?.confidence >= 80 ? "text-success" : forecast?.confidence >= 50 ? "text-warning" : "text-danger";

  return (
    <Card className="h-full bg-gradient-to-br from-card via-card to-primary/[0.03] border-primary/20 shadow-lg overflow-hidden group hover:border-primary/40 transition-all duration-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
              <Brain className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-mono uppercase tracking-widest">
              Forecast Preditivo AI
            </CardTitle>
          </div>
          <div className="flex gap-1">
            {[7, 30, 90].map((h) => (
              <Button
                key={h}
                variant="ghost"
                size="sm"
                onClick={() => setHorizon(h)}
                className={cn(
                  "h-6 px-2 text-[10px] font-mono transition-all",
                  horizon === h ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                )}
              >
                {h}D
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>REALISTA ({horizon}d)</span>
            <span className={cn("font-bold", confidenceColor)}>
              {forecast?.confidence}% CONFIANÇA
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {formatCurrency(forecast?.scenarios.realistic)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Progresso Meta</span>
              <span>{Math.round((forecast?.scenarios.realistic / forecast?.metrics.goal_for_horizon) * 100)}%</span>
            </div>
            <Progress 
              value={(forecast?.scenarios.realistic / forecast?.metrics.goal_for_horizon) * 100} 
              className="h-1.5 bg-primary/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-primary/5">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Pessimista</span>
            <div className="text-xs font-bold text-danger/80">{formatCurrency(forecast?.scenarios.pessimistic)}</div>
          </div>
          <div className="space-y-1 text-center border-x border-primary/5">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Otimista</span>
            <div className="text-xs font-bold text-success/80">{formatCurrency(forecast?.scenarios.optimistic)}</div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Meta ({horizon}d)</span>
            <div className="text-xs font-bold text-primary">{formatCurrency(forecast?.metrics.goal_for_horizon)}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={horizon}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-primary/[0.03] border border-primary/10 space-y-3"
          >
            <div className="flex gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-muted-foreground italic">
                {forecast?.narrative || "Analisando tendências de pipeline e histórico de conversão..."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-danger/70">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Riscos</span>
                </div>
                <ul className="space-y-1.5">
                  {forecast?.risks?.map((risk: string, i: number) => (
                    <li key={i} className="text-[10px] leading-tight text-muted-foreground flex gap-1 items-start">
                      <span className="text-danger mt-0.5">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 border-l border-primary/5 pl-3">
                <div className="flex items-center gap-1.5 text-success/70">
                  <Lightbulb className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Oportunidades</span>
                </div>
                <ul className="space-y-1.5">
                  {forecast?.opportunities?.map((opp: string, i: number) => (
                    <li key={i} className="text-[10px] leading-tight text-muted-foreground flex gap-1 items-start">
                      <span className="text-success mt-0.5">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};