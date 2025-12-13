import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingRateGaugeProps {
  rate: number;
  change?: number;
  meetings: number;
  leads: number;
}

export function SchedulingRateGauge({ rate, change, meetings, leads }: SchedulingRateGaugeProps) {
  const isPositive = (change ?? 0) >= 0;
  
  const getRateColor = (rate: number) => {
    if (rate >= 20) return "text-green-500";
    if (rate >= 10) return "text-orange-500";
    return "text-red-500";
  };

  const getRateLabel = (rate: number) => {
    if (rate >= 20) return "Excelente";
    if (rate >= 10) return "Bom";
    if (rate >= 5) return "Regular";
    return "Baixo";
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Taxa de Agendamento
          </CardTitle>
          {change !== undefined && (
            <span className={cn(
              "flex items-center text-xs font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={cn("text-4xl font-bold", getRateColor(rate))}>
            {rate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getRateLabel(rate)}
          </p>
        </div>
        
        <Progress 
          value={Math.min(rate, 100)} 
          className="h-2"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{meetings} reuniões</span>
          <span>{leads} leads</span>
        </div>

        <div className="pt-2 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground text-center">
            Meta ideal: 15-20% dos leads convertidos em reuniões
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
