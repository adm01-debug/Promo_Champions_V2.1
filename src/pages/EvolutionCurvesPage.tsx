import { Helmet } from 'react-helmet-async';
import { EvolutionChart } from '@/components/competitive/EvolutionChart';
import { PageTransition } from '@/components/transitions/PageTransition';
import { TrendingUp, Users, Filter, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvolutionCurves } from '@/hooks/useEvolutionCurves';
import { formatBRL } from '@/lib/money';
import { useMemo } from 'react';

const LEADERS_PERIOD_DAYS = 30;

export default function EvolutionCurvesPage() {
  const { chartData, salespeople, isLoading, isError } =
    useEvolutionCurves(LEADERS_PERIOD_DAYS);

  // Receita ganha acumulada por vendedor no período (último ponto da curva).
  const leaders = useMemo(() => {
    const last = chartData[chartData.length - 1];
    if (!last) return [];
    return salespeople
      .map(sp => ({ id: sp.id, name: sp.name, revenue: Number(last[sp.name]) || 0 }))
      .filter(l => l.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [chartData, salespeople]);

  return (
    <>
      <Helmet>
        <title>Curvas de Evolução | Promo Champions</title>
        <meta
          name="description"
          content="Dashboard comparativo de evolução de receita e performance entre vendedores"
        />
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
              <div className="p-2.5 rounded-xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Curvas de Evolução</h1>
                <p className="text-sm text-muted-foreground/80">
                  Análise histórica comparativa de performance acumulada
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="glass gap-2 border-border/50"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass gap-2 border-border/50"
              >
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
                    <CardTitle className="text-section-title text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Líderes de Receita
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Vendas ganhas nos últimos {LEADERS_PERIOD_DAYS} dias
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="space-y-2 p-4">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="h-8 rounded-lg bg-muted/30 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : isError ? (
                      <p className="p-4 text-xs text-destructive">
                        Não foi possível carregar os líderes de receita.
                      </p>
                    ) : leaders.length === 0 ? (
                      <p className="p-4 text-xs text-muted-foreground">
                        Sem vendas ganhas no período ainda.
                      </p>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {leaders.map(v => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-4"
                          >
                            <span className="text-xs font-medium">{v.name}</span>
                            <span className="text-xs text-status-success font-bold">
                              {formatBRL(v.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
