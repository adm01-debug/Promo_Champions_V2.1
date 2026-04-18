import { FC, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueIntelligenceHub, useRunPipelineInspection } from "@/hooks/revenue/useRevenueIntelligenceHub";
import { ForecastCategoriesPanel } from "./ForecastCategoriesPanel";
import { CoverageRatioGauge } from "./CoverageRatioGauge";
import { WinRateBreakdownChart } from "./WinRateBreakdownChart";
import { PipelineInspectionTable } from "./PipelineInspectionTable";
import { QBRGeneratorPanel } from "./QBRGeneratorPanel";
import { AIForecastPanel } from "./AIForecastPanel";
import { WinProbabilityCalibrationPanel } from "./calibration/WinProbabilityCalibrationPanel";
import { WinProbabilityCalibratorPanel } from "./calibration/WinProbabilityCalibratorPanel";
import { QuotaAttainmentPredictor } from "./quota/QuotaAttainmentPredictor";
import { ForecastAccuracySummary } from "./forecast/ForecastAccuracySummary";
import { ForecastVsActualChart } from "./forecast/ForecastVsActualChart";
import { ForecastBiasChart } from "./forecast/ForecastBiasChart";
import { ConfidenceScoresTable } from "./forecast/ConfidenceScoresTable";
import { MapeBySegmentChart } from "./forecast/MapeBySegmentChart";
import { PipelineCoveragePanel } from "./coverage/PipelineCoveragePanel";

export const RevenueIntelligenceHub: FC = () => {
  const [dimension, setDimension] = useState<"category" | "source" | "product">("category");
  const { data, isLoading } = useRevenueIntelligenceHub(90, dimension);
  const inspection = useRunPipelineInspection();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-page-title font-display">Revenue Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Forecast roll-up, win rate, coverage, comitê de compra, inspeção de pipeline e QBR automático.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ForecastCategoriesPanel rollup={data.forecast_rollup} variance={data.variance} />
        <CoverageRatioGauge
          ratio={data.coverage.ratio}
          target={data.coverage.target}
          weightedPipeline={data.coverage.weighted_pipeline}
          healthLabel={data.coverage.health_label}
        />
      </div>

      <Tabs defaultValue="forecast-accuracy">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="forecast-accuracy">Precisão do Forecast</TabsTrigger>
          <TabsTrigger value="ai-forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="coverage">Cobertura do Pipeline</TabsTrigger>
          <TabsTrigger value="winrate">Win Rate Drill-down</TabsTrigger>
          <TabsTrigger value="calibration">Win Calibration</TabsTrigger>
          <TabsTrigger value="calibrator">Calibrador (Bucket)</TabsTrigger>
          <TabsTrigger value="inspection">Pipeline Inspection</TabsTrigger>
          <TabsTrigger value="quota">Quota Predictor</TabsTrigger>
          <TabsTrigger value="qbr">QBR Automático</TabsTrigger>
        </TabsList>
        <TabsContent value="forecast-accuracy" className="mt-4 space-y-4">
          <ForecastAccuracySummary />
          <div className="grid gap-4 lg:grid-cols-2">
            <ForecastVsActualChart />
            <ForecastBiasChart />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <MapeBySegmentChart />
            <ConfidenceScoresTable />
          </div>
        </TabsContent>
        <TabsContent value="ai-forecast" className="mt-4">
          <AIForecastPanel />
        </TabsContent>
        <TabsContent value="coverage" className="mt-4">
          <PipelineCoveragePanel />
        </TabsContent>
        <TabsContent value="winrate" className="mt-4">
          <WinRateBreakdownChart
            data={data.win_rate_breakdown}
            dimension={dimension}
            onChangeDimension={setDimension}
          />
        </TabsContent>
        <TabsContent value="calibration" className="mt-4">
          <WinProbabilityCalibrationPanel />
        </TabsContent>
        <TabsContent value="calibrator" className="mt-4">
          <WinProbabilityCalibratorPanel />
        </TabsContent>
        <TabsContent value="inspection" className="mt-4">
          <PipelineInspectionTable
            data={data.pipeline_inspection.deals}
            flagCounts={data.pipeline_inspection.flag_counts}
            onRunInspection={() => inspection.mutate()}
            isRunning={inspection.isPending}
          />
        </TabsContent>
        <TabsContent value="quota" className="mt-4">
          <QuotaAttainmentPredictor />
        </TabsContent>
        <TabsContent value="qbr" className="mt-4">
          <QBRGeneratorPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
