import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, AlertCircle, Info, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const PipelineHealthScore = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["pipeline-health"],
    queryFn: async () => {
      // Usamos a view de forecast para pegar dados de pipeline aberto e meta
      const { data, error } = await supabase.from("revenue_forecast_view").select("*");
      if (error) throw error;
      
      const agg = data.reduce((acc, r) => {
        acc.total_pipeline += Number(r.total_open_pipeline) || 0;
        acc.weighted_forecast += Number(r.weighted_forecast) || 0;
        acc.monthly_goal += Number(r.monthly_goal) || 0;
        return acc;
      }, { total_pipeline: 0, weighted_forecast: 0, monthly_goal: 0 });

      // Pipeline Coverage (Standard target is 3x or 4x)
      const coverage = agg.monthly_goal > 0 ? agg.total_pipeline / agg.monthly_goal : 0;
      const weightedCoverage = agg.monthly_goal > 0 ? agg.weighted_forecast / agg.monthly_goal : 0;
      
      return {
        ...agg,
        coverage,
        weightedCoverage,
        health: coverage >= 3 ? "Excellent" : coverage >= 2 ? "Healthy" : "At Risk"
      };
    }
  });

  if (isLoading) return null;

  const healthColors = {
    "Excellent": "text-success border-success/20 bg-success/5",
    "Healthy": "text-warning border-warning/20 bg-warning/5",
    "At Risk": "text-danger border-danger/20 bg-danger/5"
  };

  const coveragePercent = Math.min(100, (metrics?.coverage || 0) / 4 * 100);

  return (
    <Card className={cn("border-none shadow-none bg-transparent mb-6", healthColors[metrics?.health || "Healthy"])}>
      <CardContent className="p-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl bg-current/10 shadow-inner")}>
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-widest leading-none">Pipeline Health: {metrics?.health}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 opacity-50" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px] font-bold">
                    Pipeline ideal deve ser 3x a 4x o valor da meta. Seu atual é {metrics?.coverage.toFixed(1)}x.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter">
                {metrics?.coverage.toFixed(1)}x
              </span>
              <span className="text-[10px] font-bold opacity-70 uppercase">Coverage Ratio</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider opacity-70">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Weighted: {Math.round((metrics?.weightedCoverage || 0) * 100)}% of goal</span>
            <span>Target: 3.0x</span>
          </div>
          <Progress value={coveragePercent} className="h-2 bg-current/10" />
        </div>

        <div className="hidden md:flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
             <Zap className="h-3 w-3 text-primary animate-pulse" />
             Pipeline Ponderado
          </div>
          <p className="text-xl font-black tracking-tighter text-foreground">
            R$ {metrics?.weighted_forecast.toLocaleString("pt-BR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};