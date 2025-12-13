import { useSalesForecast } from "@/hooks/useSalesForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, Calendar, Zap, PieChart, Scale, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
  const trendColor = data.trend === "up" ? "text-status-success" : data.trend === "down" ? "text-status-error" : "text-muted-foreground";

  return (
    <Card className="glass border border-border/40 dark:border-glow overflow-hidden card-elevated">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Forecast Ponderado</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-full border border-border/40">
            <span className="text-muted-foreground">Confiança:</span>
            <span className="font-semibold gradient-text">{data.confidence}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Main Projection */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Projeção Ponderada</p>
              <p className="text-3xl font-bold gradient-text font-display">
                {formatCurrency(data.projectedRevenue)}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              data.trend === "up" ? "bg-status-success/20 text-status-success" : 
              data.trend === "down" ? "bg-status-error/20 text-status-error" : 
              "bg-muted/50 text-muted-foreground"
            }`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {data.trend === "up" ? "Alta" : data.trend === "down" ? "Baixa" : "Estável"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso vs Meta</span>
              <span className={`font-semibold ${isOnTrack ? "text-status-success" : "text-warning"}`}>
                {goalProgress.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(goalProgress, 100)} 
              className="h-2.5 bg-muted/50" 
            />
            <p className="text-xs text-muted-foreground text-right">
              Meta: <span className="font-medium text-foreground">{formatCurrency(data.goalAmount)}</span>
            </p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3.5 space-y-1.5 border border-status-success/30 hover-lift cursor-pointer">
            <div className="flex items-center gap-1.5 text-status-success">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Fechado</span>
            </div>
            <p className="text-base font-bold text-status-success">{formatCurrency(data.currentRevenue)}</p>
          </div>
          
          <div className="glass rounded-xl p-3.5 space-y-1.5 border border-primary/30 hover-lift cursor-pointer">
            <div className="flex items-center gap-1.5 text-primary">
              <Scale className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Pipeline Pond.</span>
            </div>
            <p className="text-base font-bold gradient-text">{formatCurrency(data.weightedPipelineValue)}</p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-3.5 space-y-1.5 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <PieChart className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Pipeline Total</span>
            </div>
            <p className="text-base font-bold">{formatCurrency(data.pipelineValue)}</p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-3.5 space-y-1.5 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Dias Restantes</span>
            </div>
            <p className="text-base font-bold">{data.daysRemaining} dias</p>
          </div>
        </div>

        {/* Pipeline Breakdown by Stage */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline por Estágio (Prob. × Valor)</p>
          <div className="space-y-2">
            {data.pipelineBreakdown.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium">
                      {stage.label}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                        {stage.deals} deals
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(stage.weightedValue)} 
                      <span className="gradient-text ml-1 font-semibold">({(stage.probability * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={100} 
                      className="h-1.5 bg-muted/50" 
                    />
                    <div 
                      className="absolute top-0 left-0 h-1.5 gradient-primary rounded-full transition-all"
                      style={{ width: `${stage.probability * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deals */}
        {data.topDeals.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Oportunidades</p>
            <div className="space-y-2">
              {data.topDeals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between text-xs glass rounded-lg px-3 py-2 border border-border/40 hover-lift cursor-pointer">
                  <span className="truncate flex-1 font-medium">{deal.client_name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-muted-foreground">
                      {formatCurrency(deal.amount)} × {(deal.probability * 100).toFixed(0)}%
                    </span>
                    <span className="font-bold gradient-text">
                      = {formatCurrency(deal.weighted_value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Required */}
        <div className="glass rounded-xl p-4 border border-warning/30 bg-gradient-to-r from-warning/10 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning">
              <div className="p-1.5 rounded-lg bg-warning/20">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs uppercase tracking-wider font-medium">Média/Dia Necessária</span>
            </div>
            <p className="text-base font-bold text-warning">{formatCurrency(data.dailyRequired)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
