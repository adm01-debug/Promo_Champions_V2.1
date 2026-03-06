import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export const SalesForecast = () => {
  const forecast = 85000;
  const previousMonth = 72000;
  const confidence = 78;
  
  const changePercent = ((forecast - previousMonth) / previousMonth) * 100;
  const isPositive = changePercent >= 0;
  
  const animatedForecast = useCountUp(forecast, { duration: 1400, decimals: 0 });
  const animatedConfidence = useCountUp(confidence, { duration: 1200, decimals: 0 });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Previsão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-xl font-bold font-display tabular-nums">
            R$ {animatedForecast.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground">próximo mês</p>
        </div>
        
        {/* vs mês anterior */}
        <div className="flex items-center justify-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">
            vs R$ {previousMonth.toLocaleString("pt-BR")}
          </span>
        </div>

        {/* Confidence gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confiança</span>
            <span className="font-semibold tabular-nums">{animatedConfidence}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                confidence >= 70 ? "bg-success" : confidence >= 40 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {confidence >= 70 ? "Alta confiança" : confidence >= 40 ? "Confiança moderada" : "Baixa confiança"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
