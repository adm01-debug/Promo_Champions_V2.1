import { Helmet } from "react-helmet-async";
import { ABCAnalysis } from "@/components/analytics/ABCAnalysis";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function ABCAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>Análise ABC | Promo Champions</title>
        <meta name="description" content="Análise Pareto 80/20 de produtos e clientes" />
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Layers className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-page-title gradient-text">Análise ABC</h1>
              <p className="text-sm text-muted-foreground/80">Classificação Pareto 80/20 de produtos e clientes por receita</p>
            </div>
          </motion.div>

          <ABCAnalysis />
        </div>
      </PageTransition>
    </>
  );
}
