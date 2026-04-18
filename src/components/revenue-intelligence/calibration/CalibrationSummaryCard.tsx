import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown, TrendingUp, CheckCircle2, GaugeCircle } from "lucide-react";
import { useCalibrationSummary, useRunCalibration } from "@/hooks/revenue/useWinProbabilityCalibrator";
import { formatPct } from "./calibratorHelpers";

export const CalibrationSummaryCard: FC = () => {
  const summary = useCalibrationSummary();
  const run = useRunCalibration();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-display font-medium">Calibração de Win Probability</h2>
          <p className="text-sm text-muted-foreground">Compara probabilidade declarada vs taxa real histórica.</p>
        </div>
        <Button size="sm" onClick={() => run.mutate()} disabled={run.isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${run.isPending ? "animate-spin" : ""}`} />
          {run.isPending ? "Calibrando..." : "Recalibrar"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total calibrados</p>
              <p className="text-2xl font-display font-semibold">{summary?.total ?? 0}</p>
            </div>
            <GaugeCircle className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Super-otimistas</p>
              <p className="text-2xl font-display font-semibold text-destructive">{summary?.overconfident ?? 0}</p>
            </div>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Subestimados</p>
              <p className="text-2xl font-display font-semibold text-primary">{summary?.underconfident ?? 0}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Gap médio</p>
              <p className="text-2xl font-display font-semibold">{formatPct(summary?.avgGap ?? 0, 1)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{summary?.aligned ?? 0} alinhados</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
