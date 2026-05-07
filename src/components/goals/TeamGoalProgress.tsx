import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar, Zap, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamGoalProgressProps {
  totalGoal: number;
  totalSales: number;
  progress: number;
  projection: number;
  onTrack: boolean;
  daysElapsed: number;
  daysRemaining: number;
  dailyAverage: number;
  requiredDailyAverage: number;
}

export function TeamGoalProgress({
  totalGoal,
  totalSales,
  progress,
  projection,
  onTrack,
  daysElapsed,
  daysRemaining,
  dailyAverage,
  requiredDailyAverage,
}: TeamGoalProgressProps) {
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const progressCapped = Math.min(progress, 100);
  const projectionProgress = totalGoal > 0 ? (projection / totalGoal) * 100 : 0;
  
  const totalDays = daysElapsed + daysRemaining;
  const idealProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
  const idealSales = totalGoal * (idealProgress / 100);
  const salesGap = totalSales - idealSales;
  const isAheadOfIdeal = salesGap >= 0;

  return (
    <Card className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden">
      <div className={`h-1.5 ${onTrack 
        ? "bg-gradient-to-r from-status-success via-status-success/80 to-status-success/50" 
        : "bg-gradient-to-r from-status-warning via-status-warning/80 to-status-warning/50"
      }`} />
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-md group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text">Meta da Equipe</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`shadow-sm animate-fade-in ${onTrack 
              ? "bg-status-success/10 text-status-success border-status-success/30" 
              : "bg-status-warning/10 text-status-warning border-status-warning/30"
            }`}
          >
            {onTrack ? (
              <><TrendingUp className="h-3 w-3 mr-1" /> No caminho</>
            ) : (
              <><TrendingDown className="h-3 w-3 mr-1" /> Atenção</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Main Progress */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-display font-bold gradient-text">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                de <span className="font-display font-medium text-foreground">{formatCurrency(totalGoal)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-display font-bold gradient-text">{progress.toFixed(1)}%</p>
              <p className="text-overline font-medium">atingido</p>
            </div>
          </div>
          
          <div className="relative">
            <Progress value={progressCapped} className="h-5" />
            {progress >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-xs font-display font-bold text-primary-foreground animate-pulse">META BATIDA!</span>
              </div>
            )}
          </div>
        </div>

        {/* Projection */}
        <div 
          className="p-4 rounded-xl glass border border-border/30 space-y-3 hover-lift transition-all animate-fade-in"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">Projeção de Fechamento</span>
            </span>
            <span className={`text-xl font-display font-bold ${onTrack ? "text-status-success" : "text-status-warning"}`}>
              {formatCurrency(projection)}
            </span>
          </div>
          <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/30">
            <div 
              className={`absolute h-full transition-all duration-500 ${onTrack 
                ? "bg-gradient-to-r from-status-success to-status-success/70" 
                : "bg-gradient-to-r from-status-warning to-status-warning/70"
              }`}
              style={{ width: `${Math.min(projectionProgress, 100)}%` }}
            />
            {/* Goal marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
              style={{ left: `${Math.min((100 / (projectionProgress || 1)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center font-medium">
            {onTrack 
              ? <span className="text-status-success">Projeção {((projection / totalGoal) * 100 - 100).toFixed(0)}% acima da meta 🚀</span>
              : <span className="text-status-warning">Faltam {formatCurrency(totalGoal - projection)} para bater a meta</span>
            }
          </p>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-4 rounded-xl glass border border-border/30 text-center hover-lift cursor-pointer transition-all group animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-display font-bold gradient-text">{formatCurrency(dailyAverage)}</p>
            <p className="text-overline font-medium mt-1">Média diária atual</p>
          </div>
          <div 
            className="p-4 rounded-xl glass border border-border/30 text-center hover-lift cursor-pointer transition-all group animate-fade-in"
            style={{ animationDelay: '150ms' }}
          >
            <div className={`p-2 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform ${
              requiredDailyAverage > dailyAverage ? "bg-status-warning/10" : "bg-status-success/10"
            }`}>
              <Target className={`h-4 w-4 ${requiredDailyAverage > dailyAverage ? "text-status-warning" : "text-status-success"}`} />
            </div>
            <p className={`text-xl font-display font-bold ${requiredDailyAverage > dailyAverage ? "text-status-warning" : "text-status-success"}`}>
              {formatCurrency(requiredDailyAverage)}
            </p>
            <p className="text-overline font-medium mt-1">Necessário/dia</p>
          </div>
        </div>

        {/* Days Progress */}
        <div 
          className="flex items-center gap-3 text-sm p-3 rounded-xl glass border border-border/30 hover-lift transition-all animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="p-2 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-medium">{daysElapsed} dias passados</span>
              <span className="font-medium">{daysRemaining} restantes</span>
            </div>
            <Progress value={(daysElapsed / (daysElapsed + daysRemaining)) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
