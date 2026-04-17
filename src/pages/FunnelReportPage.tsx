import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FunnelReportView } from "@/components/reporting/FunnelReportView";
import { Filter } from "lucide-react";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function FunnelReportPage() {
  return (
    <>
      <Helmet>
        <title>Relatório de Funil | Promo Champions</title>
        <meta name="description" content="Análise visual do funil de vendas com drop-off por etapa e comparação de períodos." />
        <link rel="canonical" href="/relatorios/funil" />
      </Helmet>
      <PageTransition>
        <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-page-title font-display">Relatório de Funil</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Drop-off por etapa, conversão e comparação de períodos
              </p>
            </div>
          </div>
          <FunnelReportView defaultTimeframe={30} />
        </div>
      </PageTransition>
    </>
  );
}
