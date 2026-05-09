import { Helmet } from "react-helmet-async";
import { WinLossAnalysis } from "@/components/analytics/WinLossAnalysis";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Trophy, ShieldCheck, Filter, Download, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WinLossAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>Win/Loss Analysis | Promo Champions</title>
        <meta name="description" content="Análise profunda de vitórias e perdas com drill-down por vendedor e produto" />
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
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Win/Loss Analysis</h1>
                <p className="text-sm text-muted-foreground/80">Inteligência competitiva baseada em desfechos de deals</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass gap-2 border-border/50">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
              <Button variant="outline" size="sm" className="glass gap-2 border-border/50">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <WinLossAnalysis />
              </div>
              
              <div className="space-y-6">
                <Card className="glass border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Estratégia de Defesa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-semibold text-primary uppercase mb-1">Destaque de Ganho</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A "Rapidez na Resposta" foi citada em 70% das vitórias deste mês. Mantenha os SLAs agressivos.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive uppercase mb-1">Vulnerabilidade</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        "Falta de Integração" é a principal razão de perda contra o Player Y (30% dos casos).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-display flex items-center gap-2 text-primary">
                      <LineChart className="h-4 w-4" />
                      Projeção de Melhoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Se reduzirmos as perdas por "Preço" em 10% via novos bundles, o Win Rate geral subirá para <span className="text-foreground font-semibold">68%</span>.
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
