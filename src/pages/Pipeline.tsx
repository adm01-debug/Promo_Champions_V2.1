import { Helmet } from "react-helmet-async";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AtRiskDealsPanel } from "@/components/pipeline/AtRiskDealsPanel";
import { Kanban } from "lucide-react";
import { usePipelineDeals } from "@/hooks/usePipeline";
import { PipelineLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function Pipeline() {
  const { isLoading } = usePipelineDeals();

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
            <div>
              <h1 className="text-3xl font-bold gradient-text">Pipeline de Vendas</h1>
              <p className="text-muted-foreground">
                Arraste os deals entre as colunas para atualizar o status
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="grid grid-cols-1 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="xl:col-span-3">
              <PipelineBoard />
            </div>
            <motion.div 
              className="xl:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <AtRiskDealsPanel />
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}
