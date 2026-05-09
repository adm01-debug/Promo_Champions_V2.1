import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProspectingFunnel } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Filter, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

export function ProspectingFunnel() {
  const { data: funnel, isLoading } = useProspectingFunnel();

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <Filter className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Funil de Prospecção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${i * 75}ms` }}>
                <Skeleton className="h-4 w-1/3 animate-shimmer" />
                <Skeleton className="h-8 w-full rounded-lg animate-shimmer" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...(funnel?.map(s => s.count) || [1]));
  const totalLeads = funnel?.[0]?.count || 0;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Funil de Prospecção</span>
          </CardTitle>
          {totalLeads > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
              {totalLeads} leads
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel?.map((stage, index) => {
          const isFirst = index === 0;
          const conversionFromPrev = index > 0 && funnel[index - 1].count > 0
            ? ((stage.count / funnel[index - 1].count) * 100).toFixed(0)
            : null;
          
          return (
            <div 
              key={stage.stage} 
              className="space-y-1.5 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-display font-medium group-hover:text-primary transition-colors">
                    {stage.stage}
                  </span>
                  {conversionFromPrev && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span className="text-status-success font-medium">{conversionFromPrev}%</span>
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground font-medium group-hover:text-foreground/80 transition-colors">
                  {stage.count}{" "}
                  <span className={cn(
                    "transition-colors",
                    isFirst ? "text-primary" : "text-primary/70 group-hover:text-primary"
                  )}>
                    ({stage.percentage.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="h-8 bg-muted/20 rounded-lg overflow-hidden relative border border-border/30 shadow-inner group-hover:border-primary/30 transition-all">
                <div
                  className={cn(
                    "h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center group-hover:brightness-110",
                    stage.count === 0 && "opacity-30"
                  )}
                  style={{ 
                    width: `${(stage.count / maxCount) * 100}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.count > 0 ? "28px" : "0",
                    boxShadow: `0 0 20px ${stage.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                  }}
                >
                  <span className="text-[11px] font-bold text-primary-foreground drop-shadow-md font-display">
                    {stage.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Conversion summary */}
        {funnel && funnel.length > 1 && funnel[0].count > 0 && (
          <div className="pt-3 border-t border-border/30 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Conversão total</span>
              </div>
              <span className="font-display font-bold text-status-success">
                {((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
