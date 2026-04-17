import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import { CohortHeatmap } from "@/components/reporting/CohortHeatmap";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function CohortReportPage() {
  return (
    <>
      <Helmet>
        <title>Cohort Heatmap | Promo Champions</title>
        <meta
          name="description"
          content="Análise de retenção por cohort com heatmap visual: % de clientes ativos por mês após a aquisição."
        />
        <link rel="canonical" href="/relatorios/cohort" />
      </Helmet>
      <PageTransition>
        <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Grid3x3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-page-title font-display">Cohort Heatmap</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Retenção por mês de aquisição — pedidos ou receita
              </p>
            </div>
          </div>
          <CohortHeatmap defaultPeriods={12} defaultMetric="orders" />
        </div>
      </PageTransition>
    </>
  );
}
