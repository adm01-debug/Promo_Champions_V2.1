import { Helmet } from "react-helmet-async";
import { DealVelocityChart } from "@/components/analytics/DealVelocityChart";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Clock, TrendingUp, Filter, Download, ArrowLeftRight, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDealVelocity } from "@/hooks/deal-intelligence/useDealVelocity";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DealVelocityPage() {
  const [timeframe, setTimeframe] = useState(90);
  const { data, isLoading } = useDealVelocity(undefined, timeframe);

  return (
    <>
      <Helmet>
        <title>Velocidade de Deals | Promo Champions</title>
        <meta name="description" content="Dashboard histórico de velocidade de pipeline e benchmarks" />
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Velocidade de Pipeline</h1>
                <p className="text-sm text-muted-foreground/80">Monitoramento histórico de fluidez e tempo de conversão</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Select value={String(timeframe)} onValueChange={(v) => setTimeframe(Number(v))}>
                <SelectTrigger className="w-[180px] glass border-border/50">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="180">Últimos 180 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="glass gap-2 border-border/50">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <DealVelocityChart />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass border-border/40 overflow-hidden group">
                <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-primary" />
                    Comparativo entre Vendedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {[
                      { name: "Carlos Silva", avg: 12.4, deals: 45, perf: "high" },
                      { name: "Ana Beatriz", avg: 15.2, deals: 38, perf: "mid" },
                      { name: "João Pereira", avg: 18.9, deals: 29, perf: "low" },
                      { name: "Mariana Costa", avg: 13.1, deals: 41, perf: "high" },
                    ].map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors cursor-pointer group/item">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            v.perf === 'high' ? 'bg-status-success shadow-[0_0_8px_rgba(var(--status-success-rgb),0.5)]' : 
                            v.perf === 'mid' ? 'bg-status-warning shadow-[0_0_8px_rgba(var(--status-warning-rgb),0.5)]' : 
                            'bg-status-error shadow-[0_0_8px_rgba(var(--status-error-rgb),0.5)]'
                          }`} />
                          <div>
                            <p className="text-sm font-medium group-hover/item:text-primary transition-colors">{v.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{v.deals} deals ativos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold font-display">{v.avg}d</p>
                          <p className="text-[10px] text-muted-foreground">Velocidade Média</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Insights de Aceleração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h5 className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Oportunidade de Ganho</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Reduzir o tempo na etapa de <span className="text-foreground font-medium">Qualificação</span> em apenas 1 dia pode aumentar o volume de fechamento em <span className="text-status-success font-bold">12%</span> no próximo trimestre.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20">
                    <h5 className="text-xs font-semibold text-status-warning mb-1 uppercase tracking-wider">Atenção Necessária</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Deals com mais de <span className="text-foreground font-medium">25 dias</span> sem movimentação têm <span className="text-status-error font-bold">75%</span> de chance de churn. Ativar cadência de reaquecimento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
