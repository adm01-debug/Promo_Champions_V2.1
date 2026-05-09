import { Helmet } from "react-helmet-async";
import { EmailMetricsDashboard } from "@/components/analytics/EmailMetricsDashboard";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Mail, BarChart3, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailAnalyticsPage() {
  return (
    <>
      <Helmet>
        <title>Email Analytics | Promo Champions</title>
        <meta name="description" content="Dashboard avançado de métricas de e-mail, taxas de abertura e análise A/B" />
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
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Email Intelligence</h1>
                <p className="text-sm text-muted-foreground/80">Monitoramento de engajamento, taxas de conversão e performance de conteúdo</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <EmailMetricsDashboard />
            </div>
            
            <div className="space-y-6">
              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Funnel de Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Entregues</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Abertos</span>
                      <span className="font-bold">24.5%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-status-info/60 rounded-full" style={{ width: '24.5%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Clicados</span>
                      <span className="font-bold">3.2%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-status-success/60 rounded-full" style={{ width: '13.1%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2 text-primary">
                    <Zap className="h-4 w-4" />
                    Insight de Otimização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Assuntos que iniciam com uma <span className="text-foreground font-semibold">pergunta</span> estão gerando taxas de abertura <span className="text-status-success font-bold">40% maiores</span> que afirmações diretas.
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
