import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProspectingFunnel } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";

export function ProspectingFunnel() {
  const { data: funnel, isLoading } = useProspectingFunnel();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 animate-pulse">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Funil de Prospecção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1 animate-fade-in" style={{ animationDelay: `${i * 75}ms` }}>
                <Skeleton className="h-4 w-1/3 animate-shimmer" />
                <Skeleton className="h-7 w-full animate-shimmer" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...(funnel?.map(s => s.count) || [1]));

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Funil de Prospecção</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel?.map((stage, index) => (
          <div 
            key={stage.stage} 
            className="space-y-1.5 group cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-medium group-hover:text-primary transition-colors duration-300">{stage.stage}</span>
              <span className="text-muted-foreground font-medium transition-colors group-hover:text-foreground/80">
                {stage.count} <span className="text-primary/70 group-hover:text-primary transition-colors">({stage.percentage.toFixed(0)}%)</span>
              </span>
            </div>
            <div className="h-7 bg-muted/30 rounded-lg overflow-hidden relative border border-border/30 shadow-inner group-hover:border-primary/30 transition-all duration-300">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center group-hover:brightness-110"
                style={{ 
                  width: `${(stage.count / maxCount) * 100}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? "24px" : "0",
                  boxShadow: `0 0 16px ${stage.color}50`
                }}
              >
                <span className="text-[10px] font-bold text-primary-foreground drop-shadow-md font-display">
                  {stage.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
