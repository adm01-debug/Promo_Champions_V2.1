import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { StalledDealsTable } from "@/components/deal-intelligence/StalledDealsTable";
import { WeakCoverageDealsTable } from "@/components/deal-intelligence/WeakCoverageDealsTable";
import { CommitteeInsightsPanel } from "@/components/deal-intelligence/committee/CommitteeInsightsPanel";
import { StageBaselinesPanel } from "@/components/deal-intelligence/StageBaselinesPanel";
import { StuckDealsPanel } from "@/components/deal-intelligence/velocity/StuckDealsPanel";
import { StageBottlenecksChart } from "@/components/deal-intelligence/velocity/StageBottlenecksChart";
import { ConversionOptimizerPanel } from "@/components/deal-intelligence/ConversionOptimizerPanel";
import { WinLossSummaryCard } from "@/components/deal-intelligence/winloss/WinLossSummaryCard";
import { WinFactorsChart } from "@/components/deal-intelligence/winloss/WinFactorsChart";
import { LossFactorsChart } from "@/components/deal-intelligence/winloss/LossFactorsChart";
import { LostStageBreakdown } from "@/components/deal-intelligence/winloss/LostStageBreakdown";
import { CompetitorAnalysisTable } from "@/components/deal-intelligence/winloss/CompetitorAnalysisTable";
import { WinLossInsightsPanel } from "@/components/deal-intelligence/winloss/WinLossInsightsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Heart, Users, Gauge, TrendingDown, Trophy } from "lucide-react";

export default function DealIntelligence() {
  return (
    <>
      <Helmet>
        <title>Inteligência de Deals | Promo Champions</title>
        <meta name="description" content="Saúde dos deals e mapeamento do comitê de compra com IA" />
      </Helmet>
      <PageTransition>
        <div className="space-y-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-3 rounded-xl gradient-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-page-title gradient-text">Inteligência de Deals</h1>
              <p className="text-muted-foreground">
                Saúde, comitê de compra e ações recomendadas por IA
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="health" className="w-full">
              <TabsList>
                <TabsTrigger value="health" className="gap-2">
                  <Heart className="h-4 w-4" /> Saúde dos Deals
                </TabsTrigger>
                <TabsTrigger value="committee" className="gap-2">
                  <Users className="h-4 w-4" /> Comitê de Compra
                </TabsTrigger>
                <TabsTrigger value="velocity" className="gap-2">
                  <Gauge className="h-4 w-4" /> Velocidade & Forecast
                </TabsTrigger>
                <TabsTrigger value="conversion" className="gap-2">
                  <TrendingDown className="h-4 w-4" /> Otimizador de Conversão
                </TabsTrigger>
                <TabsTrigger value="winloss" className="gap-2">
                  <Trophy className="h-4 w-4" /> Win/Loss
                </TabsTrigger>
              </TabsList>
              <TabsContent value="health" className="mt-4">
                <StalledDealsTable />
              </TabsContent>
              <TabsContent value="committee" className="mt-4 space-y-4">
                <CommitteeInsightsPanel />
                <WeakCoverageDealsTable />
              </TabsContent>
              <TabsContent value="velocity" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <StuckDealsPanel />
                  <StageBottlenecksChart />
                </div>
                <StageBaselinesPanel />
              </TabsContent>
              <TabsContent value="conversion" className="mt-4">
                <ConversionOptimizerPanel />
              </TabsContent>
              <TabsContent value="winloss" className="mt-4">
                <div className="rounded-xl border border-border/50 p-8 text-center bg-card">
                  <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-display font-semibold mb-1">Win/Loss agora é um módulo dedicado</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Filtros avançados, tendências, matriz de motivos, comparativo por vendedor e battle cards de concorrentes.
                  </p>
                  <a
                    href="/win-loss-intelligence"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                  >
                    Abrir módulo completo →
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}
