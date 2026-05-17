import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { useNextBestActionQuery } from "@/hooks/useNextBestAction";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AISalesCoachWidget() {
  const { salesperson } = useAuth();
  const { data: nbaData, isLoading } = useNextBestActionQuery(salesperson?.id);

  return (
    <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 backdrop-blur-sm group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <BrainCircuit className="h-16 w-16 text-primary" />
      </div>

      <CardHeader className="p-4 pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-tighter italic flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
            AI Sales Coach
          </CardTitle>
          <Sparkles className="h-3.5 w-3.5 text-primary/50" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 relative z-10">
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl bg-muted/20" />
              <Skeleton className="h-16 w-full rounded-xl bg-muted/20" />
            </div>
          ) : nbaData?.suggestions && nbaData.suggestions.length > 0 ? (
            nbaData.suggestions.slice(0, 2).map((suggestion, i) => {
              const isUrgent = suggestion.priority === 'high' || suggestion.actionType === 'call_now';
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] duration-300",
                    isUrgent 
                      ? "bg-status-error/5 border-status-error/20 hover:border-status-error/40" 
                      : "bg-background/40 border-border/10 hover:border-primary/20"
                  )}
                >
                  <div className="mt-0.5">
                    {isUrgent ? (
                      <AlertCircle className="h-4 w-4 text-status-error" />
                    ) : (
                      <Lightbulb className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest truncate",
                        isUrgent ? "text-status-error" : "text-primary/80"
                      )}>
                        {suggestion.title}
                      </p>
                      {isUrgent && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-status-error animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <TrendingUp className="h-8 w-8 text-muted/30 mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Pipeline saudável. Nenhuma ação crítica detectada agora.</p>
            </div>
          )}
        </div>

        {nbaData?.insight && !isLoading && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <p className="text-[10px] text-primary/60 italic leading-relaxed text-center">
              "{nbaData.insight}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
