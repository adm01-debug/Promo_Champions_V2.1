import { Helmet } from "react-helmet-async";
import { ObjectionsLibrary } from "@/components/analytics/ObjectionsLibrary";
import { PageTransition } from "@/components/transitions/PageTransition";
import { BookOpen, Sparkles, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ObjectionsLibraryPage() {
  return (
    <>
      <Helmet>
        <title>Biblioteca de Objeções | Promo Champions</title>
        <meta name="description" content="Gestão inteligente de objeções e respostas recomendadas" />
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
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Gestão de Objeções</h1>
                <p className="text-sm text-muted-foreground/80">Repositório central de argumentos e contornos táticos</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ObjectionsLibrary />
            </div>
            
            <div className="space-y-6">
              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Objeções Críticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20">
                    <p className="text-xs font-semibold text-status-error uppercase mb-1">Preço</p>
                    <p className="text-xs text-muted-foreground">Responsável por 45% das perdas no último mês. Revise as respostas de "Ancoragem de Valor".</p>
                  </div>
                  <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                    <p className="text-xs font-semibold text-status-warning uppercase mb-1">Concorrência</p>
                    <p className="text-xs text-muted-foreground">Aumento de 12% em menções ao Player X. Use a tag #player-x para filtrar respostas.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Impacto em Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vendedores que utilizam a biblioteca têm uma taxa de conversão <span className="text-foreground font-semibold">18% superior</span> em estágios de negociação.
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
