import { useSalesForecast } from "@/hooks/useSalesForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, Calendar, Zap, PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SalesForecast() {
  const { data, isLoading, error } = useSalesForecast();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Previsão de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Erro ao carregar previsão</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const goalProgress = data.goalAmount > 0 ? (data.projectedRevenue / data.goalAmount) * 100 : 0;
  const isOnTrack = goalProgress >= 100;

  const TrendIcon = data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;
  const trendColor = data.trend === "up" ? "text-emerald-400" : data.trend === "down" ? "text-red-400" : "text-muted-foreground";

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Previsão de Vendas
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-full">
            <span className="text-muted-foreground">Confiança:</span>
            <span className="font-semibold text-foreground">{data.confidence}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Main Projection */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Projeção do Mês</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatCurrency(data.projectedRevenue)}
              </p>
            </div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {data.trend === "up" ? "Alta" : data.trend === "down" ? "Baixa" : "Estável"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso vs Meta</span>
              <span className={isOnTrack ? "text-emerald-400" : "text-amber-400"}>
                {goalProgress.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(goalProgress, 100)} 
              className="h-2 bg-muted/50" 
            />
            <p className="text-xs text-muted-foreground text-right">
              Meta: {formatCurrency(data.goalAmount)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <PieChart className="h-3.5 w-3.5" />
              <span className="text-xs">Pipeline</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(data.pipelineValue)}</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Dias Restantes</span>
            </div>
            <p className="text-sm font-semibold">{data.daysRemaining} dias</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-xs">Média/Dia Necessária</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(data.dailyRequired)}</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">Média Histórica</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(data.historicalAvg)}</p>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Pipeline por Estágio</p>
          <div className="space-y-2">
            {data.pipelineBreakdown.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(stage.value)} ({(stage.probability * 100).toFixed(0)}% prob.)
                    </span>
                  </div>
                  <Progress 
                    value={stage.probability * 100} 
                    className="h-1.5 bg-muted/50" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
