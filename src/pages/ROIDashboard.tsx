import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Target, Timer, Award, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useROIDashboard } from '@/hooks/useROIDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { ROIRankingList } from '@/components/roi/ROIRankingList';
import { PageTransition } from "@/components/transitions/PageTransition";

const formatCurrency = (v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const formatPercent = (v: any) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const periodOptions = [{ label: '1 mês', value: 1 }, { label: '3 meses', value: 3 }, { label: '6 meses', value: 6 }, { label: '12 meses', value: 12 }];

const ROIDashboard = () => {
  const [period, setPeriod] = useState(3);
  const { roiData, summary, isLoading } = useROIDashboard(period);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="p-4 lg:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  const roiChartData = roiData.map((r) => ({ name: r.name.split(' ')[0], roi: Number(r.roi.toFixed(1)), revenue: r.totalRevenue, cost: r.estimatedCost }));
  const efficiencyData = roiData.map((r) => ({ name: r.name.split(' ')[0], x: r.activitiesCount, y: r.totalRevenue, z: r.wonDeals || 1, roi: r.roi }));

  return (
    <PageTransition>
      <Helmet><title>ROI por Vendedor | PROMO CHAMPIONS</title><meta name="description" content="Dashboard de ROI por vendedor com CAC, LTV e payback period" /></Helmet>
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl lg:text-3xl font-bold font-display text-foreground">ROI por Vendedor</h1><p className="text-muted-foreground text-sm mt-1">Análise de retorno sobre investimento, CAC, LTV e payback</p></div>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {periodOptions.map((p) => (<button key={p.value} onClick={() => setPeriod(p.value)} className={cn('px-3 py-1.5 text-sm rounded-md font-medium transition-all', period === p.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{p.label}</button>))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-primary/5"><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><DollarSign className="h-5 w-5 text-primary" />{summary.overallROI >= 0 ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}</div><p className="text-2xl font-bold text-foreground">{formatPercent(summary.overallROI)}</p><p className="text-xs text-muted-foreground mt-1">ROI Geral</p></CardContent></Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-lg hover-lift-sm"><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><Target className="h-5 w-5 text-secondary" /></div><p className="text-2xl font-bold text-foreground">{formatCurrency(summary.avgCAC)}</p><p className="text-xs text-muted-foreground mt-1">CAC Médio</p></CardContent></Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-lg hover-lift-sm"><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><TrendingUp className="h-5 w-5 text-accent" /></div><p className="text-2xl font-bold text-foreground">{formatCurrency(summary.avgLTV)}</p><p className="text-xs text-muted-foreground mt-1">LTV Médio</p></CardContent></Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-lg hover-lift-sm"><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><Timer className="h-5 w-5 text-rank-gold" /></div><p className="text-2xl font-bold text-foreground">{Math.round(summary.avgPayback)}d</p><p className="text-xs text-muted-foreground mt-1">Payback Médio</p></CardContent></Card>
          </motion.div>
        </div>

        <Tabs defaultValue="ranking" className="space-y-4">
          <TabsList className="bg-muted/50"><TabsTrigger value="ranking">Ranking ROI</TabsTrigger><TabsTrigger value="charts">Gráficos</TabsTrigger><TabsTrigger value="efficiency">Eficiência</TabsTrigger></TabsList>

          <TabsContent value="ranking"><ROIRankingList roiData={roiData} /></TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <Card className="border-none shadow-lg hover-lift-sm">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />ROI por Vendedor</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={roiChartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any, name: any) => [name === 'roi' ? `${value}%` : formatCurrency(value), name === 'roi' ? 'ROI' : name === 'revenue' ? 'Receita' : 'Custo']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="revenue" name="Receita" radius={[6, 6, 0, 0]}>{roiChartData.map((_entry, index) => <Cell key={index} fill={`hsl(262, 83%, ${58 + index * 5}%)`} />)}</Bar>
                    <Bar dataKey="cost" name="Custo" fill="hsl(var(--muted-foreground) / 0.3)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-lg hover-lift-sm"><CardContent className="p-6 text-center"><TrendingUp className="h-8 w-8 mx-auto text-success mb-3" /><p className="text-metric-lg text-foreground">{formatCurrency(summary.totalRevenue)}</p><p className="text-sm text-muted-foreground mt-1">Receita Total</p></CardContent></Card>
              <Card className="border-none shadow-lg hover-lift-sm"><CardContent className="p-6 text-center"><TrendingDown className="h-8 w-8 mx-auto text-destructive mb-3" /><p className="text-metric-lg text-foreground">{formatCurrency(summary.totalCosts)}</p><p className="text-sm text-muted-foreground mt-1">Custo Total</p></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <Card className="border-none shadow-lg hover-lift-sm">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-accent" />Eficiência: Atividades × Receita</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" dataKey="x" name="Atividades" tick={{ fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" name="Receita" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Vendas" />
                    <Tooltip formatter={(value: any, name: any) => [name === 'Receita' ? formatCurrency(value) : value, name]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Scatter name="Vendedores" data={efficiencyData} fill="hsl(262, 83%, 58%)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover-lift-sm">
              <CardHeader><CardTitle className="text-base">Receita por Atividade</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[...roiData].sort((a, b) => b.revenuePerActivity - a.revenuePerActivity).map((sp) => (
                  <div key={sp.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3"><span className="font-medium text-foreground">{sp.name}</span><span className="text-xs text-muted-foreground">{sp.activitiesCount} atividades</span></div>
                    <span className="font-bold text-primary">{formatCurrency(sp.revenuePerActivity)}/atividade</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ROIDashboard;
