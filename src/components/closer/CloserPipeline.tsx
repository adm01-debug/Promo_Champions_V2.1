import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCloserPipeline } from "@/hooks/useCloserMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, BarChart3, ArrowRight, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CloserPipeline() {
  const { data: pipeline, isLoading } = useCloserPipeline();

  if (isLoading) {
    return (
      <Card className="glass border-border/40 h-[400px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
           <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Scanning Pipeline Stages...</span>
         </div>
      </Card>
    );
  }

  const totalValue = pipeline?.reduce((sum, p) => sum + p.value, 0) || 1;
  const totalDeals = pipeline?.reduce((sum, p) => sum + p.count, 0) || 0;

  return (
    <Card className="glass border-primary/20 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="h-3.5 w-3.5" />
            </div>
            Pipeline Saturation
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[9px] font-black uppercase tracking-widest bg-primary/10 border-primary/30 text-primary">
            {totalDeals} UNITS
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6 relative z-10">
        {pipeline?.map((stage, index) => {
          const percentage = (stage.value / totalValue) * 100;
          const isLargestValue = stage.value === Math.max(...(pipeline?.map(p => p.value) || [0]));
          
          return (
            <div 
              key={stage.stage} 
              className={cn(
                "space-y-3 group cursor-default transition-all p-2 rounded-xl border border-transparent",
                isLargestValue && "bg-white/[0.03] border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: stage.color }} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors">
                    {stage.stage}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-black text-foreground">R$ {stage.value.toLocaleString("pt-BR")}</p>
                    <p className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{stage.count} DEALS</p>
                  </div>
                  {isLargestValue && <Zap className="h-3 w-3 text-primary animate-pulse" />}
                </div>
              </div>

              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                  className="h-full relative overflow-hidden"
                  style={{ 
                    backgroundColor: stage.color,
                    boxShadow: `0 0 10px ${stage.color}60`
                  }}
                >
                   <motion.div 
                    className="absolute inset-0 bg-white/20"
                    animate={{ left: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
        
        {/* Total summary */}
        <div className="pt-6 border-t border-white/5 mt-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Active Exposure</p>
                <p className="text-lg font-mono font-black italic tracking-tighter text-foreground">
                  R$ {totalValue.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-[9px] font-mono font-black border-success/30 text-success bg-success/10 uppercase tracking-widest">
                OPTIMIZED
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
