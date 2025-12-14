import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCloserPipeline } from "@/hooks/useCloserMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CloserPipeline() {
  const { data: pipeline, isLoading } = useCloserPipeline();

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Pipeline de Fechamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 75}ms` }}>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4 animate-shimmer" />
                  <Skeleton className="h-4 w-1/3 animate-shimmer" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg animate-shimmer" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = pipeline?.reduce((sum, p) => sum + p.value, 0) || 1;
  const totalDeals = pipeline?.reduce((sum, p) => sum + p.count, 0) || 0;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Pipeline de Fechamento</span>
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
            {totalDeals} deals
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipeline?.map((stage, index) => {
          const percentage = (stage.value / totalValue) * 100;
          const isLargestValue = stage.value === Math.max(...(pipeline?.map(p => p.value) || [0]));
          
          return (
            <div 
              key={stage.stage} 
              className={cn(
                "space-y-2 group cursor-default animate-fade-in p-2 rounded-lg transition-all",
                isLargestValue && "bg-primary/5 ring-1 ring-primary/20"
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-display font-medium group-hover:text-primary transition-colors">
                    {stage.stage}
                  </span>
                  {index < (pipeline?.length || 0) - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {stage.count} deals
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className={cn(
                    "font-bold font-display flex items-center gap-0.5",
                    isLargestValue ? "gradient-text" : "text-primary"
                  )}>
                    <DollarSign className="h-3 w-3" />
                    {stage.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
              <div className="h-8 bg-muted/20 rounded-lg overflow-hidden relative border border-border/30 shadow-inner group-hover:border-primary/30 transition-all">
                <div
                  className={cn(
                    "h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center group-hover:brightness-110",
                    stage.count === 0 && "opacity-30"
                  )}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.count > 0 ? "44px" : "0",
                    boxShadow: `0 0 16px ${stage.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                  }}
                >
                  <span className="text-[11px] font-bold text-primary-foreground drop-shadow-md font-display">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Total summary */}
        {pipeline && pipeline.length > 0 && (
          <div className="pt-3 border-t border-border/40 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 text-status-success" />
                <span>Valor total em pipeline</span>
              </div>
              <span className="font-display font-bold text-status-success text-sm">
                R$ {totalValue.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
