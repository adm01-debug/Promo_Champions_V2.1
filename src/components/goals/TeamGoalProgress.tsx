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
          
          <div className="relative pt-2">
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold mb-1 px-1">
              <span>Início</span>
              <span className="text-primary/70">Ideal: {idealProgress.toFixed(0)}%</span>
              <span>Meta: 100%</span>
            </div>
            <Progress value={progressCapped} className="h-4 shadow-inner" />
            
            {/* Ideal marker indicator */}
            <div 
              className="absolute top-[22px] bottom-0 w-0.5 bg-primary/40 z-10"
              style={{ left: `${idealProgress}%` }}
              title={`Tendência Ideal: ${formatCurrency(idealSales)}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>

            {progress >= 100 && (
              <div className="absolute inset-0 top-[22px] flex items-center justify-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-xs font-display font-bold text-primary-foreground animate-pulse">META BATIDA!</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Status vs Tendência</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${isAheadOfIdeal ? "text-status-success" : "text-status-warning"}`}>
                {isAheadOfIdeal ? (
                  <><TrendingUp className="h-3 w-3" /> +{formatCurrency(salesGap)}</>
                ) : (
                  <><TrendingDown className="h-3 w-3" /> {formatCurrency(salesGap)}</>
                )}
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Expectativa</span>
              <span className="text-sm font-bold text-foreground">
                {isAheadOfIdeal ? "Superando" : "Recuperar"}
              </span>
            </div>
          </div>
        </div>

        {/* Projection */}
        <div 
          className="p-5 rounded-2xl glass border border-border/30 space-y-4 hover-lift shadow-sm transition-all animate-fade-in bg-gradient-to-br from-background/50 to-muted/30"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 shadow-sm">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Forecast de Fechamento</span>
                <span className="text-[10px] text-muted-foreground uppercase">Projeção Baseada no Ritmo Atual</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-display font-black tracking-tight ${onTrack ? "text-status-success" : "text-status-warning"}`}>
                {formatCurrency(projection)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
              <div 
                className={`absolute h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--status-success),0.3)] ${onTrack 
                  ? "bg-gradient-to-r from-status-success via-status-success/80 to-status-success/60" 
                  : "bg-gradient-to-r from-status-warning via-status-warning/80 to-status-warning/60"
                }`}
                style={{ width: `${Math.min(projectionProgress, 100)}%` }}
              />
              {/* Goal marker */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-foreground/30 z-20"
                style={{ left: `100%`, transform: 'translateX(-100%)' }}
              />
            </div>
            
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-muted-foreground">0%</span>
              <span className="text-[10px] font-bold text-primary italic">Forecast: {projectionProgress.toFixed(1)}%</span>
              <span className="text-[10px] font-bold text-muted-foreground">100%</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg text-center font-bold text-xs border ${
            onTrack 
              ? "bg-status-success/5 border-status-success/20 text-status-success" 
              : "bg-status-warning/5 border-status-warning/20 text-status-warning"
          }`}>
            {onTrack 
              ? `🚀 EXCELENTE! Projeção de bater ${(projectionProgress - 100).toFixed(1)}% além da meta.`
              : `⚠️ ATENÇÃO: Faltam ${formatCurrency(totalGoal - projection)} no forecast para atingir o objetivo.`
            }
          </div>
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

        {/* Days Progress & Gap Analysis */}
        <div className="space-y-4">
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

          {!onTrack && (
            <div 
              className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/20 animate-pulse-subtle"
              style={{ animationDelay: '250ms' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-full bg-status-warning/20">
                  <TrendingDown className="h-3.5 w-3.5 text-status-warning" />
                </div>
                <span className="text-xs font-bold text-status-warning uppercase tracking-wider">Análise de GAP (Ponto de Inflexão)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para recuperar a meta em <span className="text-foreground font-bold">{daysRemaining} dias</span>, a equipe precisa aumentar o ritmo atual em <span className="text-status-warning font-bold">+{(((requiredDailyAverage / dailyAverage) - 1) * 100).toFixed(0)}%</span> por dia.
              </p>
            </div>
          )}
          
          {onTrack && progress < 100 && (
            <div 
              className="p-4 rounded-xl bg-status-success/10 border border-status-success/20"
              style={{ animationDelay: '250ms' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-full bg-status-success/20">
                  <TrendingUp className="h-3.5 w-3.5 text-status-success" />
                </div>
                <span className="text-xs font-bold text-status-success uppercase tracking-wider">Ponto de Manutenção</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mantendo o ritmo atual, a meta será atingida em aproximadamente <span className="text-foreground font-bold">{Math.ceil((totalGoal - totalSales) / dailyAverage)} dias</span>.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
