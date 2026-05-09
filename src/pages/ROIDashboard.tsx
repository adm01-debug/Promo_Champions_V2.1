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
import { useCountUp } from '@/hooks/useCountUp';

const formatCurrency = (v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const formatPercent = (v: any) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const periodOptions = [{ label: '1 mês', value: 1 }, { label: '3 meses', value: 3 }, { label: '6 meses', value: 6 }, { label: '12 meses', value: 12 }];

const ROIDashboard = () => {
  const [period, setPeriod] = useState(3);
  const { roiData, summary, isLoading } = useROIDashboard(period);

  const animatedROI = useCountUp(summary.overallROI, { duration: 1400, decimals: 1 });
  const animatedCAC = useCountUp(summary.avgCAC, { duration: 1400 });
  const animatedLTV = useCountUp(summary.avgLTV, { duration: 1400 });
  const animatedPayback = useCountUp(summary.avgPayback, { duration: 1400 });

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
          <div><h1 className="text-2xl lg:text-3xl font-black tracking-tight gradient-text">ROI por Vendedor</h1><p className="text-muted-foreground text-sm mt-1">Análise de retorno sobre investimento, CAC, LTV e payback</p></div>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
            {periodOptions.map((p) => (<button key={p.value} onClick={() => setPeriod(p.value)} className={cn('px-3 py-1.5 text-sm rounded-md font-bold transition-all', period === p.value ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground')}>{p.label}</button>))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary/15 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="h-12 w-12" /></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/20"><DollarSign className="h-4 w-4 text-primary" /></div>
                  {summary.overallROI >= 0 ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-3xl font-black text-foreground">{formatPercent(animatedROI)}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">ROI Geral</p>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/10">
                <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} />
              </div>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-xl glass group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Target className="h-12 w-12" /></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-secondary/20"><Target className="h-4 w-4 text-secondary" /></div>
                </div>
                <p className="text-3xl font-black text-foreground">R$ {animatedCAC.toLocaleString('pt-BR')}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">CAC Médio</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-xl glass group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="h-12 w-12" /></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-accent/20"><TrendingUp className="h-4 w-4 text-accent" /></div>
                </div>
                <p className="text-3xl font-black text-foreground">R$ {animatedLTV.toLocaleString('pt-BR')}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">LTV Médio</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-xl glass group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Timer className="h-12 w-12" /></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-warning/20"><Timer className="h-4 w-4 text-warning" /></div>
                </div>
                <p className="text-3xl font-black text-foreground">{Math.round(animatedPayback)} dias</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Payback Médio</p>
              </CardContent>
            </Card>
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
