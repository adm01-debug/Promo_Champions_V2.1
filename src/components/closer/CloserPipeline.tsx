import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloserPipeline } from "@/hooks/useCloserMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export function CloserPipeline() {
  const { data: pipeline, isLoading } = useCloserPipeline();

  if (isLoading) {
    return (
      <Card className="glass border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md animate-pulse">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Pipeline de Fechamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = pipeline?.reduce((sum, p) => sum + p.value, 0) || 1;

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Pipeline de Fechamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipeline?.map((stage, index) => (
          <div 
            key={stage.stage} 
            className="space-y-2 group animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-medium group-hover:text-primary transition-colors">{stage.stage}</span>
              <div className="text-right">
                <span className="text-muted-foreground">{stage.count} deals • </span>
                <span className="font-bold font-display text-primary">R$ {stage.value.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <div className="h-7 bg-muted/30 rounded-lg overflow-hidden relative border border-border/30 shadow-inner">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center group-hover:brightness-110"
                style={{ 
                  width: `${(stage.value / totalValue) * 100}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? "40px" : "0",
                  boxShadow: `0 0 12px ${stage.color}40`
                }}
              >
                <span className="text-[10px] font-bold text-primary-foreground drop-shadow-md">
                  {((stage.value / totalValue) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
