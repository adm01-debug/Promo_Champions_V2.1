import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, TrendingUp, TrendingDown, Target } from "lucide-react";
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
    if (rate >= 20) return "text-status-success";
    if (rate >= 10) return "text-status-warning";
    return "text-status-error";
  };

  const getRateLabel = (rate: number) => {
    if (rate >= 20) return "Excelente";
    if (rate >= 10) return "Bom";
    if (rate >= 5) return "Regular";
    return "Baixo";
  };

  const getRateBgColor = (rate: number) => {
    if (rate >= 20) return "bg-status-success/10";
    if (rate >= 10) return "bg-status-warning/10";
    return "bg-status-error/10";
  };

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <CalendarCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Taxa de Agendamento</span>
          </CardTitle>
          {change !== undefined && (
            <span className={cn(
              "flex items-center text-xs font-medium px-2 py-1 rounded-full animate-fade-in",
              isPositive ? "text-status-success bg-status-success/10" : "text-status-error bg-status-error/10"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center animate-fade-in">
          <div className={cn(
            "text-4xl font-bold font-display transition-all",
            getRateColor(rate)
          )}>
            {rate.toFixed(1)}%
          </div>
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-2",
            getRateBgColor(rate),
            getRateColor(rate)
          )}>
            <Target className="h-3 w-3" />
            {getRateLabel(rate)}
          </div>
        </div>
        
        <Progress 
          value={Math.min(rate, 100)} 
          className="h-2.5"
        />
        
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-status-success/5 hover:bg-status-success/10 transition-colors">
            <CalendarCheck className="h-3 w-3 text-status-success" />
            <span className="text-muted-foreground">{meetings} reuniões</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">{leads} leads</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground text-center">
            Meta ideal: <span className="text-status-success font-medium">15-20%</span> dos leads convertidos em reuniões
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
