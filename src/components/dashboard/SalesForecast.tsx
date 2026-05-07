import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const STAGE_WEIGHTS: Record<string, number> = {
  pending: 0.05,
  qualified: 0.2,
  proposal: 0.5,
  negotiation: 0.7,
  completed: 1.0,
};

const getConfidenceConfig = (confidence: number) => {
  if (confidence >= 80) return { color: "bg-status-success", textColor: "text-status-success", label: "Alta", description: "Dados consistentes com tendência positiva." };
  if (confidence >= 60) return { color: "bg-status-warning", textColor: "text-status-warning", label: "Média", description: "Alguns indicadores variaram. Continue alimentando o pipeline." };
  return { color: "bg-destructive", textColor: "text-destructive", label: "Baixa", description: "Poucos dados disponíveis. Registre mais atividades para maior precisão." };
};

export const SalesForecast = React.memo(() => {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-forecast-weighted"],
    queryFn: async () => {
      const { data: openDeals, error } = await supabase
        .from("sales")
        .select("amount, status")
        .not("status", "in", "(completed,lost)");
      if (error) throw error;

      const { data: closedDeals } = await supabase
        .from("sales")
        .select("amount")
        .eq("status", "completed");

      const weightedTotal = (openDeals || []).reduce((sum, d) => {
        const w = STAGE_WEIGHTS[d.status || "pending"] || 0.1;
        return sum + (d.amount || 0) * w;
      }, 0);

      const closedTotal = (closedDeals || []).reduce((sum, d) => sum + (d.amount || 0), 0);
      const totalDeals = (openDeals?.length || 0) + (closedDeals?.length || 0);
      const confidence = Math.min(95, Math.max(30, 40 + totalDeals * 0.5));

      return {
        forecast: Math.round(weightedTotal + closedTotal * 0.15),
        confidence: Math.round(confidence),
      };
    },
    staleTime: 120_000,
  });

  const config = useMemo(() => getConfidenceConfig(data?.confidence ?? 50), [data?.confidence]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Previsão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  const forecast = data?.forecast ?? 0;
  const confidence = data?.confidence ?? 50;

  return (
    <Card className="h-full border-none bg-gradient-to-br from-card/30 to-background shadow-lg shadow-black/5 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Projeção de Fechamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-2xl font-black tracking-tight text-foreground">
            R$ {forecast.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center justify-center gap-1">
            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 border-primary/20">Estimativa</Badge>
            <span className="text-[10px] text-muted-foreground font-medium italic">Weighted Forecast</span>
          </div>
        </div>
        
        <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/10">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
            <span className="text-muted-foreground flex items-center gap-1">
              Neural Confidence
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <p className="text-xs font-bold mb-1">{config.label} Precisão</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className={cn("font-black", config.textColor)}>
              {confidence}%
            </span>
          </div>
          
          <div className="relative h-2.5 bg-background/50 rounded-full overflow-hidden border border-border/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className={cn("h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]", config.color)}
            />
          </div>
          
          <p className={cn("text-[9px] font-black uppercase text-center tracking-[0.2em]", config.textColor)}>
            STATUS: {config.label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

SalesForecast.displayName = "SalesForecast";
