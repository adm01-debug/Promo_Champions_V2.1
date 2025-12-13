import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar, Zap } from "lucide-react";
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
  const projectionProgress = totalGoal > 0 ? Math.min((projection / totalGoal) * 100, 150) : 0;

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <div className={`h-1 ${onTrack ? "bg-green-500" : "bg-orange-500"}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meta da Equipe
          </CardTitle>
          <Badge 
            variant="outline" 
            className={onTrack 
              ? "bg-green-500/10 text-green-500 border-green-500/30" 
              : "bg-orange-500/10 text-orange-500 border-orange-500/30"
            }
          >
            {onTrack ? (
              <><TrendingUp className="h-3 w-3 mr-1" /> No caminho</>
            ) : (
              <><TrendingDown className="h-3 w-3 mr-1" /> Atenção</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold gradient-text">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-muted-foreground">
                de {formatCurrency(totalGoal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">atingido</p>
            </div>
          </div>
          
          <div className="relative">
            <Progress value={progressCapped} className="h-4" />
            {progress >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">META BATIDA! 🎉</span>
              </div>
            )}
          </div>
        </div>

        {/* Projection */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Projeção de Fechamento
            </span>
            <span className={`text-lg font-bold ${onTrack ? "text-green-500" : "text-orange-500"}`}>
              {formatCurrency(projection)}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`absolute h-full transition-all ${onTrack ? "bg-green-500" : "bg-orange-500"}`}
              style={{ width: `${Math.min(projectionProgress, 100)}%` }}
            />
            {/* Goal marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
              style={{ left: `${Math.min((100 / (projectionProgress || 1)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {onTrack 
              ? `Projeção ${((projection / totalGoal) * 100 - 100).toFixed(0)}% acima da meta`
              : `Faltam ${formatCurrency(totalGoal - projection)} para bater a meta`
            }
          </p>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{formatCurrency(dailyAverage)}</p>
            <p className="text-[10px] text-muted-foreground">Média diária atual</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className={`text-lg font-bold ${requiredDailyAverage > dailyAverage ? "text-orange-500" : "text-green-500"}`}>
              {formatCurrency(requiredDailyAverage)}
            </p>
            <p className="text-[10px] text-muted-foreground">Necessário/dia</p>
          </div>
        </div>

        {/* Days Progress */}
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{daysElapsed} dias</span>
              <span>{daysRemaining} restantes</span>
            </div>
            <Progress value={(daysElapsed / (daysElapsed + daysRemaining)) * 100} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
