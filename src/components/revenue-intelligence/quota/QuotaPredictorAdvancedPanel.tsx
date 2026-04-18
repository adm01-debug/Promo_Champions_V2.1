import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";
import { useRunQuotaPrediction } from "@/hooks/revenue/useQuotaAttainment";
import { useQuotaForecasts } from "@/hooks/revenue/useQuotaAttainmentPredictor";
import { QuotaForecastSummary } from "./QuotaForecastSummary";
import { QuotaProbabilityChart } from "./QuotaProbabilityChart";
import { QuotaRiskHeatmap } from "./QuotaRiskHeatmap";
import { QuotaActionsPanel } from "./QuotaActionsPanel";
import { QuotaAttainmentAlertsPanel } from "./QuotaAttainmentAlertsPanel";

export const QuotaPredictorAdvancedPanel: FC = () => {
  const [period, setPeriod] = useState<"month" | "quarter">("month");
  const { isLoading } = useQuotaForecasts();
  const runMut = useRunQuotaPrediction();

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quota Predictor Avançado
            </h3>
            <p className="text-xs text-muted-foreground">
              Monte Carlo (1000 simulações) + bandas P10–P90 + ações IA por vendedor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "month" | "quarter")}>
              <TabsList>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="quarter">Trimestre</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" onClick={() => runMut.mutate({ period })} disabled={runMut.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${runMut.isPending ? "animate-spin" : ""}`} />
              Recalcular
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <QuotaForecastSummary />
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {isLoading ? <Skeleton className="h-[400px]" /> : <QuotaProbabilityChart />}
        <QuotaAttainmentAlertsPanel />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? <Skeleton className="h-64" /> : <QuotaRiskHeatmap />}
        {isLoading ? <Skeleton className="h-64" /> : <QuotaActionsPanel />}
      </div>
    </div>
  );
};
