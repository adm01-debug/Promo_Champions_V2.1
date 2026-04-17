import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { StalledDealsTable } from "@/components/deal-intelligence/StalledDealsTable";
import { Sparkles } from "lucide-react";

export default function DealIntelligence() {
  return (
    <>
      <Helmet>
        <title>Saúde dos Deals | Promo Champions</title>
        <meta name="description" content="Análise preditiva da saúde dos deals com IA" />
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
              <h1 className="text-page-title gradient-text">Saúde dos Deals</h1>
              <p className="text-muted-foreground">
                Score 0-100 com fatores explicáveis e ações recomendadas por IA
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StalledDealsTable />
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}
