import { Helmet } from "react-helmet-async";
import { EvolutionChart } from "@/components/competitive/EvolutionChart";
import { PageTransition } from "@/components/transitions/PageTransition";
import { TrendingUp, Users, Calendar, Filter, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EvolutionCurvesPage() {
  return (
    <>
      <Helmet>
        <title>Curvas de Evolução | Promo Champions</title>
        <meta name="description" content="Dashboard comparativo de evolução de receita e performance entre vendedores" />
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
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Curvas de Evolução</h1>
                <p className="text-sm text-muted-foreground/80">Análise histórica comparativa de performance acumulada</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass gap-2 border-border/50">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm" className="glass gap-2 border-border/50">
                <Filter className="h-4 w-4" />
                Filtrar Segmentos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <EvolutionChart />
              </div>
              
              <div className="space-y-6">
                <Card className="glass border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Líderes de Crescimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                      {[
                        { name: "Carlos Silva", growth: "+24%", trend: "up" },
                        { name: "Mariana Costa", growth: "+18%", trend: "up" },
                        { name: "Ana Beatriz", growth: "+12%", trend: "up" },
                      ].map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                          <span className="text-xs font-medium">{v.name}</span>
                          <span className="text-xs text-status-success font-bold">{v.growth}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-display flex items-center gap-2 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      Projeção de Fechamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mantendo a taxa de aceleração atual, a equipe atingirá a meta trimestral <span className="text-foreground font-semibold">12 dias</span> antes do previsto.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
