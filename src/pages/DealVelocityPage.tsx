import { Helmet } from 'react-helmet-async';
import { DealVelocityChart } from '@/components/analytics/DealVelocityChart';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Clock, Download, ArrowLeftRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDealVelocity } from '@/hooks/deal-intelligence/useDealAnalyticsVelocity';
import { useSalespeopleMin } from '@/hooks/sales/useSalespeopleMin';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DealVelocityPage() {
  const [timeframe, setTimeframe] = useState(90);
  const velocity = useDealVelocity(undefined, timeframe);
  const salespeople = useSalespeopleMin();

  const comparison = useMemo(() => {
    const names = new Map((salespeople.data ?? []).map(sp => [sp.id, sp.name]));
    return (velocity.data?.bySalesperson ?? []).map(v => ({
      ...v,
      name: names.get(v.salespersonId) ?? 'Vendedor sem nome',
    }));
  }, [velocity.data, salespeople.data]);
  const teamAverage = velocity.data?.overallAverage ?? 0;
  const comparisonLoading = velocity.isLoading || salespeople.isLoading;
  const comparisonError = velocity.isError || salespeople.isError;

  return (
    <>
      <Helmet>
        <title>Velocidade de Deals | Promo Champions</title>
        <meta
          name="description"
          content="Dashboard histórico de velocidade de pipeline e benchmarks"
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
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Velocidade de Pipeline</h1>
                <p className="text-sm text-muted-foreground/80">
                  Monitoramento histórico de fluidez e tempo de conversão
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Select
                value={String(timeframe)}
                onValueChange={v => setTimeframe(Number(v))}
              >
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
              <Button
                variant="outline"
                size="sm"
                className="glass gap-2 border-border/50"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <DealVelocityChart />

            <Card className="glass border-border/40 overflow-hidden group">
              <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
                <CardTitle className="text-section-title text-sm flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  Comparativo entre Vendedores
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Dias médios até o ganho no período selecionado
                  {teamAverage > 0 && ` · média da equipe ${teamAverage}d`}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {comparisonLoading ? (
                  <div className="space-y-2 p-4">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="h-12 rounded-lg bg-muted/30 animate-pulse"
                      />
                    ))}
                  </div>
                ) : comparisonError ? (
                  <p className="p-4 text-sm text-destructive">
                    Não foi possível carregar o comparativo entre vendedores.
                  </p>
                ) : comparison.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Sem deals ganhos no período para comparar vendedores.
                  </p>
                ) : (
                  <div className="divide-y divide-border/30">
                    {comparison.map(v => (
                      <div
                        key={v.salespersonId}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              v.avgDays <= teamAverage
                                ? 'bg-status-success shadow-[0_0_8px_rgba(var(--status-success-rgb),0.5)]'
                                : 'bg-status-warning shadow-[0_0_8px_rgba(var(--status-warning-rgb),0.5)]'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">{v.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {v.wonDeals} ganhos · {v.openDeals} em aberto
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold font-display">{v.avgDays}d</p>
                          <p className="text-[10px] text-muted-foreground">
                            Velocidade Média
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
