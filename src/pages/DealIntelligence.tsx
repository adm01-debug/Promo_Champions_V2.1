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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Heart, Users, Gauge, TrendingDown, Trophy, AlertTriangle } from "lucide-react";
import { RiskAssessmentPanel } from "@/components/deal-intelligence/RiskAssessmentPanel";
import { RelationshipHealthGraph } from "@/components/deal-intelligence/committee/RelationshipHealthGraph";
import { NextBestActionPanel } from "@/components/deal-intelligence/NextBestActionPanel";
import { useState } from "react";
import { useWeakCoverageDeals } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import WinLossIntelligence from "./WinLossIntelligence";

export default function DealIntelligence() {
  const { data: weakDeals } = useWeakCoverageDeals();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  
  // Use first weak deal as default for the graph if none selected
  const displaySaleId = selectedSaleId || weakDeals?.[0]?.sale_id;

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
                <TabsTrigger value="risk" className="gap-2">
                  <AlertTriangle className="h-4 w-4" /> Análise de Risco
                </TabsTrigger>
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
              <TabsContent value="risk" className="mt-4 space-y-4">
                <RiskAssessmentPanel />
              </TabsContent>
              <TabsContent value="health" className="mt-4">
                <StalledDealsTable />
              </TabsContent>
              <TabsContent value="committee" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <CommitteeInsightsPanel />
                  </div>
                  <div className="lg:col-span-2">
                    <RelationshipHealthGraph saleId={displaySaleId} />
                  </div>
                </div>
                <WeakCoverageDealsTable onSelectDeal={(id) => setSelectedSaleId(id)} />
              </TabsContent>
              <TabsContent value="velocity" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <StuckDealsPanel />
                  <NextBestActionPanel saleId={displaySaleId} />
                </div>
                <div className="mt-4">
                  <StageBottlenecksChart />
                </div>
                <StageBaselinesPanel />
              </TabsContent>
              <TabsContent value="conversion" className="mt-4">
                <ConversionOptimizerPanel />
              </TabsContent>
              <TabsContent value="winloss" className="mt-4">
                <WinLossIntelligence />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}
