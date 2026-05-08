import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info, Radio, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const STAGE_WEIGHTS: Record<string, number> = {
  pending: 0.05,
  qualified: 0.2,
  proposal: 0.5,
  negotiation: 0.7,
  completed: 1.0,
};

const getConfidenceConfig = (confidence: number) => {
  if (confidence >= 80) return { color: "bg-success", textColor: "text-success", label: "OPTIMAL", description: "Consistently strong data streams detected." };
  if (confidence >= 60) return { color: "bg-warning", textColor: "text-warning", label: "STABLE", description: "Indicator variance within acceptable limits." };
  return { color: "bg-destructive", textColor: "text-destructive", label: "LOW-SIG", description: "Insufficient telemetry for precise projection." };
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
      <Card className="h-full bg-black/40 border-white/5 backdrop-blur-md">
        <div className="p-10 flex flex-col items-center justify-center gap-4">
           <Radio className="h-8 w-8 text-primary/40 animate-pulse" />
           <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-primary/40 animate-pulse">Running Neural Forecast</span>
        </div>
      </Card>
    );
  }

  const forecast = data?.forecast ?? 0;
  const confidence = data?.confidence ?? 50;

  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          Closure Projection
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 relative z-10">
        <div className="text-center py-2">
          <motion.p 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-mono font-black tracking-tighter text-foreground tabular-nums"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
          >
            R$ {forecast.toLocaleString("pt-BR")}
          </motion.p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Weighted Telemetry Projection</p>
          </div>
        </div>
        
        <div className="space-y-4 p-5 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/80">Neural Conf.</span>
               <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black/90 backdrop-blur-xl border border-white/10 max-w-[220px]">
                    <p className="text-[10px] font-mono font-black uppercase mb-1 text-primary">{config.label} ACCURACY</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className={cn("text-xs font-mono font-black tabular-nums", config.textColor)}>
              {confidence}%
            </span>
          </div>
          
          <div className="relative h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.8, ease: "circOut" }}
              className={cn("h-full rounded-full transition-all duration-700 ease-out", config.color)}
              style={{ boxShadow: `0 0 10px ${config.textColor.replace('text-', '') === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}` }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2">
             <Zap className={cn("h-3 w-3", config.textColor)} />
             <p className={cn("text-[9px] font-mono font-black uppercase tracking-[0.3em]", config.textColor)}>
               STATUS: {config.label}
             </p>
          </div>
        </div>
      </CardContent>

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </Card>
  );
});

SalesForecast.displayName = "SalesForecast";