import { FC, lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueIntelligenceHub, useRunPipelineInspection } from "@/hooks/revenue/useRevenueIntelligenceHub";
import { ForecastCategoriesPanel } from "./ForecastCategoriesPanel";
import { CoverageRatioGauge } from "./CoverageRatioGauge";

// Lazy-loaded tab hubs — cada aba só baixa seu módulo quando ativada.
// Reduz o bundle inicial da rota /revenue-intelligence em ~70%.
const WinRateBreakdownChart = lazy(() => import("./WinRateBreakdownChart").then(m => ({ default: m.WinRateBreakdownChart })));
const PipelineInspectionTable = lazy(() => import("./PipelineInspectionTable").then(m => ({ default: m.PipelineInspectionTable })));
const QBRGeneratorPanel = lazy(() => import("./QBRGeneratorPanel").then(m => ({ default: m.QBRGeneratorPanel })));
const BuyingCommitteeMap = lazy(() => import("./BuyingCommitteeMap").then(m => ({ default: m.BuyingCommitteeMap })));
const AIForecastPanel = lazy(() => import("./AIForecastPanel").then(m => ({ default: m.AIForecastPanel })));
const WinProbabilityCalibrationPanel = lazy(() => import("./calibration/WinProbabilityCalibrationPanel").then(m => ({ default: m.WinProbabilityCalibrationPanel })));
const WinProbabilityCalibratorPanel = lazy(() => import("./calibration/WinProbabilityCalibratorPanel").then(m => ({ default: m.WinProbabilityCalibratorPanel })));
const QuotaAttainmentPredictor = lazy(() => import("./quota/QuotaAttainmentPredictor").then(m => ({ default: m.QuotaAttainmentPredictor })));
const QuotaPredictorAdvancedPanel = lazy(() => import("./quota/QuotaPredictorAdvancedPanel").then(m => ({ default: m.QuotaPredictorAdvancedPanel })));
const ForecastAccuracySummary = lazy(() => import("./forecast/ForecastAccuracySummary").then(m => ({ default: m.ForecastAccuracySummary })));
const ForecastVsActualChart = lazy(() => import("./forecast/ForecastVsActualChart").then(m => ({ default: m.ForecastVsActualChart })));
const ForecastBiasChart = lazy(() => import("./forecast/ForecastBiasChart").then(m => ({ default: m.ForecastBiasChart })));
const ConfidenceScoresTable = lazy(() => import("./forecast/ConfidenceScoresTable").then(m => ({ default: m.ConfidenceScoresTable })));
const MapeBySegmentChart = lazy(() => import("./forecast/MapeBySegmentChart").then(m => ({ default: m.MapeBySegmentChart })));
const DealHealthHub = lazy(() => import("@/components/deal-intelligence/health/DealHealthHub").then(m => ({ default: m.DealHealthHub })));
const WinLossHub = lazy(() => import("@/components/deal-intelligence/winloss/WinLossHub").then(m => ({ default: m.WinLossHub })));
const LeadRoutingHub = lazy(() => import("@/components/lead-routing/LeadRoutingHub").then(m => ({ default: m.LeadRoutingHub })));
const ConversationHub = lazy(() => import("@/components/conversation-intelligence/ConversationHub").then(m => ({ default: m.ConversationHub })));
const PipelinePulseHub = lazy(() => import("@/components/pipeline-pulse/PipelinePulseHub").then(m => ({ default: m.PipelinePulseHub })));
const BriefingHub = lazy(() => import("@/components/executive-briefing/BriefingHub").then(m => ({ default: m.BriefingHub })));
const PipelineStrategicReview = lazy(() => import("@/components/intelligence/PipelineStrategicReview").then(m => ({ default: m.PipelineStrategicReview })));

const TabFallback: FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

export const RevenueIntelligenceHub: FC = () => {
  const [dimension, setDimension] = useState<"category" | "source" | "product">("category");
  const [activeTab, setActiveTab] = useState("briefing");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
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
          <TabsTrigger value="buying-committee">Buying Committee</TabsTrigger>
        </TabsList>

        <Suspense fallback={<TabFallback />}>
          <TabsContent value="briefing" className="mt-4">
            <BriefingHub />
          </TabsContent>
          <TabsContent value="revisao-ai" className="mt-4">
            <PipelineStrategicReview />
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
              onSelectSale={(id) => {
                setSelectedSaleId(id);
                setActiveTab("buying-committee");
              }}
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
          <TabsContent value="buying-committee" className="mt-4">
            {selectedSaleId ? (
              <BuyingCommitteeMap saleId={selectedSaleId} />
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
                Selecione um deal na aba "Pipeline Inspection" para visualizar o comitê de compra.
              </div>
            )}
          </TabsContent>
        </Suspense>
      </Tabs>
    </motion.div>
  );
};
