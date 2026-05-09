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
import { QuotaPredictorAdvancedPanel } from "./quota/QuotaPredictorAdvancedPanel";
import { ForecastAccuracySummary } from "./forecast/ForecastAccuracySummary";
import { ForecastVsActualChart } from "./forecast/ForecastVsActualChart";
import { ForecastBiasChart } from "./forecast/ForecastBiasChart";
import { ConfidenceScoresTable } from "./forecast/ConfidenceScoresTable";
import { MapeBySegmentChart } from "./forecast/MapeBySegmentChart";
import { DealHealthHub } from "@/components/deal-intelligence/health/DealHealthHub";
import { WinLossHub } from "@/components/deal-intelligence/winloss/WinLossHub";
import { LeadRoutingHub } from "@/components/lead-routing/LeadRoutingHub";
import { ConversationHub } from "@/components/conversation-intelligence/ConversationHub";
import { PipelinePulseHub } from "@/components/pipeline-pulse/PipelinePulseHub";
import { BriefingHub } from "@/components/executive-briefing/BriefingHub";
import { PipelineStrategicReview } from "@/components/intelligence/PipelineStrategicReview";


export const RevenueIntelligenceHub: FC = () => {
  const [dimension, setDimension] = useState<"category" | "source" | "product">("category");
  const [activeTab, setActiveTab] = useState("briefing");
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="briefing">✨ Briefing</TabsTrigger>
          <TabsTrigger value="revisao-ai">🤖 Revisão AI</TabsTrigger>
          <TabsTrigger value="comando">⚡ Comando</TabsTrigger>
          <TabsTrigger value="forecast-accuracy">Precisão do Forecast</TabsTrigger>
          <TabsTrigger value="deal-health">Saúde dos Deals</TabsTrigger>
          <TabsTrigger value="win-loss">Win/Loss IA</TabsTrigger>
          <TabsTrigger value="lead-routing">Smart Routing</TabsTrigger>
          <TabsTrigger value="conversations">Conversas IA</TabsTrigger>
          <TabsTrigger value="ai-forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="coverage">Cobertura do Pipeline</TabsTrigger>
          <TabsTrigger value="winrate">Win Rate Drill-down</TabsTrigger>
          <TabsTrigger value="calibration">Win Calibration</TabsTrigger>
          <TabsTrigger value="calibrator">Calibrador (Bucket)</TabsTrigger>
          <TabsTrigger value="inspection">Pipeline Inspection</TabsTrigger>
          <TabsTrigger value="quota">Quota Predictor</TabsTrigger>
          <TabsTrigger value="quota-advanced">Quota Avançado</TabsTrigger>
          <TabsTrigger value="qbr">QBR Automático</TabsTrigger>
        </TabsList>
        <TabsContent value="briefing" className="mt-4">
          <BriefingHub />
        </TabsContent>
        <TabsContent value="comando" className="mt-4">
          <PipelinePulseHub onNavigateTab={setActiveTab} />
        </TabsContent>
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
        <TabsContent value="deal-health" className="mt-4">
          <DealHealthHub />
        </TabsContent>
        <TabsContent value="win-loss" className="mt-4">
          <WinLossHub />
        </TabsContent>
        <TabsContent value="lead-routing" className="mt-4">
          <LeadRoutingHub />
        </TabsContent>
        <TabsContent value="conversations" className="mt-4">
          <ConversationHub />
        </TabsContent>
        <TabsContent value="ai-forecast" className="mt-4">
          <AIForecastPanel />
        </TabsContent>
        <TabsContent value="coverage" className="mt-4">
          <CoverageRatioGauge
            ratio={data.coverage.ratio}
            target={data.coverage.target}
            weightedPipeline={data.coverage.weighted_pipeline}
            healthLabel={data.coverage.health_label}
          />
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
        <TabsContent value="quota-advanced" className="mt-4">
          <QuotaPredictorAdvancedPanel />
        </TabsContent>
        <TabsContent value="qbr" className="mt-4">
          <QBRGeneratorPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
