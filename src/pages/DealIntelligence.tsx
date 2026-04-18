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
import { Sparkles, Heart, Users, Gauge, TrendingDown } from "lucide-react";

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
            </Tabs>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}
