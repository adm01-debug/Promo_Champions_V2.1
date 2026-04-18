import { motion } from "framer-motion";
import { WinLossSummaryCard } from "./WinLossSummaryCard";
import { WinFactorsChart } from "./WinFactorsChart";
import { LossFactorsChart } from "./LossFactorsChart";
import { LostStageBreakdown } from "./LostStageBreakdown";
import { CompetitorAnalysisTable } from "./CompetitorAnalysisTable";
import { WinLossInsightsPanel } from "./WinLossInsightsPanel";

export function WinLossHub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl font-display font-semibold">Win/Loss Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Análise de padrões de vitória e derrota com IA — descubra o que está funcionando e onde você perde deals.
        </p>
      </div>

      <WinLossSummaryCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WinFactorsChart />
        <LossFactorsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LostStageBreakdown />
        <CompetitorAnalysisTable />
      </div>

      <WinLossInsightsPanel />
    </motion.div>
  );
}
