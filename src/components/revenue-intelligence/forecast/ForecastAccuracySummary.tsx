import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Calculator, Target, TrendingUp, Activity } from "lucide-react";
import {
  useForecastSummary,
  useSnapshotForecast,
  useComputeAccuracy,
} from "@/hooks/revenue-intelligence/useForecastAccuracy";
import {
  biasLabel,
  biasColor,
  formatMape,
  mapeHealth,
  sourceLabel,
} from "./forecastHelpers";

export const ForecastAccuracySummary: FC = () => {
  const { isLoading, summary } = useForecastSummary();
  const snapshot = useSnapshotForecast();
  const compute = useComputeAccuracy();

  if (isLoading) return <Skeleton className="h-44" />;

  const health = mapeHealth(summary.avg_mape);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Precisão do Forecast
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Compara forecast vs realizado por período. {summary.sample_size} amostras.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => snapshot.mutate()}
            disabled={snapshot.isPending}
          >
            <Camera className="h-4 w-4 mr-2" />
            Snapshot
          </Button>
          <Button
            size="sm"
            onClick={() => compute.mutate()}
            disabled={compute.isPending}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">MAPE médio</p>
          <p className={`text-2xl font-semibold ${health.color}`}>
            {formatMape(summary.avg_mape)}
          </p>
          <p className="text-xs text-muted-foreground">{health.label}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Viés dominante</p>
          <Badge variant="outline" className={biasColor[summary.bias]}>
            {biasLabel[summary.bias]}
          </Badge>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" /> tendência geral
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Accuracy trend</p>
          <p className="text-2xl font-semibold flex items-center gap-1">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            {summary.accuracy_trend.toFixed(1)}%
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Melhor source</p>
          {summary.best_source ? (
            <>
              <p className="text-lg font-semibold">
                {sourceLabel[summary.best_source.source] ?? summary.best_source.source}
              </p>
              <p className="text-xs text-muted-foreground">
                Confiança {Number(summary.best_source.confidence_score).toFixed(0)}/100
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados ainda</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
