import { Helmet } from "react-helmet-async";
import { ClosingTimeChart } from "@/components/analytics/ClosingTimeChart";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Timer, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClosingTime } from "@/hooks/useClosingTime";

export default function ClosingTimePage() {
  const { data } = useClosingTime();
  
  const benchmarks = [
    { label: "SDR/Lead", benchmark: 2, status: "success" },
    { label: "Qualificação", benchmark: 5, status: "warning" },
    { label: "Proposta", benchmark: 7, status: "success" },
    { label: "Negociação", benchmark: 10, status: "error" },
  ];

  return (
    <>
      <Helmet>
        <title>Tempo de Fechamento | Promo Champions</title>
        <meta name="description" content="Análise detalhada do ciclo de vendas e tempo por estágio" />
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
              <Timer className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-page-title gradient-text">Ciclo de Vendas</h1>
              <p className="text-sm text-muted-foreground/80">Monitoramento de gargalos e benchmarks de tempo por estágio</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ClosingTimeChart />
            </div>
            
            <div className="space-y-6">
              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Benchmarks da Indústria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benchmarks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <span className="text-xs font-medium">{b.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{b.benchmark} dias</span>
                        {b.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                        {b.status === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                        {b.status === 'error' && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2 text-primary">
                    <AlertTriangle className="h-4 w-4" />
                    Alerta de Gargalo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O estágio de <span className="text-foreground font-semibold">Negociação</span> está levando 40% a mais que a média histórica. Recomendamos revisar o processo de aprovação de descontos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
