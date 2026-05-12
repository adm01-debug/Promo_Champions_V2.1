import { Helmet } from "react-helmet-async";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AtRiskDealsPanel } from "@/components/pipeline/AtRiskDealsPanel";
import { SLADashboard } from "@/components/pipeline/SLADashboard";
import { InactivityPanel } from "@/components/pipeline/InactivityPanel";
import { PipelineHealthScore } from "@/components/pipeline/PipelineHealthScore";
import { Kanban, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { usePipelineDeals } from "@/hooks/usePipeline";
import { PipelineLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pipeline() {
  const { isLoading } = usePipelineDeals();
  const [riskPanelOpen, setRiskPanelOpen] = useState(true);

  return (
    <>
    <Helmet>
      <title>Pipeline | Promo Champions</title>
      <meta name="description" content="Funil de vendas e gestão de deals" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<PipelineLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-3 rounded-xl gradient-primary">
              <Kanban className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-page-title gradient-text">Pipeline de Vendas</h1>
              <p className="text-muted-foreground">
                Arraste os deals entre as colunas para atualizar o status
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="flex gap-6 flex-col xl:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex-1 min-w-0">
              <PipelineBoard />
            </div>
            
            {/* Collapsible Side Panel — Desktop */}
            <div className="hidden xl:flex items-start gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRiskPanelOpen(!riskPanelOpen)}
                className="h-8 w-8 p-0 mt-2 shrink-0"
                aria-label={riskPanelOpen ? "Recolher painel lateral" : "Expandir painel lateral"}
              >
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${riskPanelOpen ? "rotate-0" : "rotate-180"}`} />
              </Button>
              <AnimatePresence initial={false}>
                {riskPanelOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="w-[340px]">
                      <Tabs defaultValue="risk" className="w-full">
                        <TabsList className="w-full mb-3">
                          <TabsTrigger value="risk" className="flex-1 text-xs">
                            <Kanban className="h-3 w-3 mr-1" />
                            Risco
                          </TabsTrigger>
                          <TabsTrigger value="sla" className="flex-1 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            SLA
                          </TabsTrigger>
                          <TabsTrigger value="inactive" className="flex-1 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inativos
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="risk">
                          <AtRiskDealsPanel />
                        </TabsContent>
                        <TabsContent value="sla">
                          <SLADashboard />
                        </TabsContent>
                        <TabsContent value="inactive">
                          <InactivityPanel />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile/Tablet: panels below */}
            <div className="xl:hidden space-y-4">
              <Tabs defaultValue="risk" className="w-full">
                <TabsList className="w-full mb-3">
                  <TabsTrigger value="risk" className="flex-1 text-xs">Risco</TabsTrigger>
                  <TabsTrigger value="sla" className="flex-1 text-xs">SLA</TabsTrigger>
                  <TabsTrigger value="inactive" className="flex-1 text-xs">Inativos</TabsTrigger>
                </TabsList>
                <TabsContent value="risk">
                  <AtRiskDealsPanel />
                </TabsContent>
                <TabsContent value="sla">
                  <SLADashboard />
                </TabsContent>
                <TabsContent value="inactive">
                  <InactivityPanel />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}