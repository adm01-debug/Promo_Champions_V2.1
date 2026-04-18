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
import { PipelineCoverageAnalyzer } from "./coverage/PipelineCoverageAnalyzer";

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

      <Tabs defaultValue="ai-forecast">
        <TabsList>
          <TabsTrigger value="ai-forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="winrate">Win Rate Drill-down</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analyzer</TabsTrigger>
          <TabsTrigger value="inspection">Pipeline Inspection</TabsTrigger>
          <TabsTrigger value="qbr">QBR Automático</TabsTrigger>
        </TabsList>
        <TabsContent value="ai-forecast" className="mt-4">
          <AIForecastPanel />
        </TabsContent>
        <TabsContent value="winrate" className="mt-4">
          <WinRateBreakdownChart
            data={data.win_rate_breakdown}
            dimension={dimension}
            onChangeDimension={setDimension}
          />
        </TabsContent>
        <TabsContent value="coverage" className="mt-4">
          <PipelineCoverageAnalyzer />
        </TabsContent>
        <TabsContent value="inspection" className="mt-4">
          <PipelineInspectionTable
            data={data.pipeline_inspection.deals}
            flagCounts={data.pipeline_inspection.flag_counts}
            onRunInspection={() => inspection.mutate()}
            isRunning={inspection.isPending}
          />
        </TabsContent>
        <TabsContent value="qbr" className="mt-4">
          <QBRGeneratorPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
