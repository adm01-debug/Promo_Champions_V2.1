import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles, Target, BarChart3 } from "lucide-react";
import { useWinProbabilityCalibration, useRunWinCalibration } from "@/hooks/revenue/useWinProbabilityCalibration";
import { CalibrationCurveChart } from "./CalibrationCurveChart";
import { CalibrationVarianceTable } from "./CalibrationVarianceTable";
import { RecalibratedDealsList } from "./RecalibratedDealsList";
import { formatPercent } from "./calibrationHelpers";

export const WinProbabilityCalibrationPanel: FC = () => {
  const { data: calibrations, isLoading } = useWinProbabilityCalibration();
  const runCalibration = useRunWinCalibration();

  const summary = (() => {
    if (!calibrations || calibrations.length === 0) return null;
    const globals = calibrations.filter((c) => c.scope === "global");
    const totalSample = globals.reduce((s, c) => s + c.sample_size, 0);
    const avgConfidence = globals.length > 0
      ? globals.reduce((s, c) => s + c.confidence, 0) / globals.length
      : 0;
    const avgShift = globals.length > 0
      ? globals.reduce((s, c) => s + Math.abs(c.calibrated_probability - c.baseline_probability), 0) / globals.length
      : 0;
    return { totalSample, avgConfidence, avgShift, scopes: calibrations.length };
  })();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-display font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Win Probability Calibration
          </h2>
          <p className="text-sm text-muted-foreground">
            Probabilidade calibrada com histórico real por owner, segmento e fonte.
          </p>
        </div>
        <Button
          onClick={() => runCalibration.mutate({ lookback_days: 180, min_sample: 5 })}
          disabled={runCalibration.isPending}
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${runCalibration.isPending ? "animate-spin" : ""}`} />
          {runCalibration.isPending ? "Recalibrando..." : "Recalibrar agora"}
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : summary ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Amostra histórica</p>
                  <p className="text-2xl font-display font-semibold">{summary.totalSample}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">deals fechados (180d)</p>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Confiança média</p>
                  <p className="text-2xl font-display font-semibold">{formatPercent(summary.avgConfidence * 100, 0)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{summary.scopes} curvas</p>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Shift médio</p>
                  <p className="text-2xl font-display font-semibold">{summary.avgShift.toFixed(1)}pp</p>
                  <p className="text-xs text-muted-foreground mt-0.5">vs baseline estático</p>
                </div>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma calibração ainda. Clique em <strong>Recalibrar agora</strong> para começar.
          </CardContent>
        </Card>
      )}

      {calibrations && calibrations.length > 0 && (
        <>
          <CalibrationCurveChart data={calibrations} />
          <div className="grid gap-4 lg:grid-cols-2">
            <CalibrationVarianceTable data={calibrations} />
            <RecalibratedDealsList />
          </div>
        </>
      )}
    </div>
  );
};
