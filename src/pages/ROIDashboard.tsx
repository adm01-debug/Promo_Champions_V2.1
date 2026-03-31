import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Timer,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useROIDashboard } from '@/hooks/useROIDashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

const periodOptions = [
  { label: '1 mês', value: 1 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
];

const ROIDashboard = () => {
  const [period, setPeriod] = useState(3);
  const { roiData, summary, isLoading } = useROIDashboard(period);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const roiChartData = roiData.map((r) => ({
    name: r.name.split(' ')[0],
    roi: Number(r.roi.toFixed(1)),
    revenue: r.totalRevenue,
    cost: r.estimatedCost,
  }));

  const efficiencyData = roiData.map((r) => ({
    name: r.name.split(' ')[0],
    x: r.activitiesCount,
    y: r.totalRevenue,
    z: r.wonDeals || 1,
    roi: r.roi,
  }));

  return (
    <>
      <Helmet>
        <title>ROI por Vendedor | I HAVE THE POWER!</title>
        <meta name="description" content="Dashboard de ROI por vendedor com CAC, LTV e payback period" />
      </Helmet>

      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display text-foreground">
              ROI por Vendedor
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Análise de retorno sobre investimento, CAC, LTV e payback
            </p>
          </div>

          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {periodOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md font-medium transition-all',
                  period === p.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {summary.overallROI >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPercent(summary.overallROI)}</p>
                <p className="text-xs text-muted-foreground mt-1">ROI Geral</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.avgCAC)}</p>
                <p className="text-xs text-muted-foreground mt-1">CAC Médio</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.avgLTV)}</p>
                <p className="text-xs text-muted-foreground mt-1">LTV Médio</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Timer className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{Math.round(summary.avgPayback)}d</p>
                <p className="text-xs text-muted-foreground mt-1">Payback Médio</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ranking" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="ranking">Ranking ROI</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          </TabsList>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-3">
            {roiData.map((sp, i) => (
              <motion.div
                key={sp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                        i === 0 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        i === 1 && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                        i === 2 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                        i > 2 && 'bg-muted text-muted-foreground'
                      )}>
                        {i + 1}º
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">{sp.name}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {sp.role === 'sdr' ? 'SDR' : 'Closer'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{formatCurrency(sp.totalRevenue)} receita</span>
                          <span>{sp.wonDeals} vendas</span>
                          <span>{sp.activitiesCount} atividades</span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="hidden md:flex items-center gap-6 shrink-0 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">CAC</p>
                          <p className="font-semibold">{formatCurrency(sp.cac)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">LTV</p>
                          <p className="font-semibold">{formatCurrency(sp.ltv)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Payback</p>
                          <p className="font-semibold">{sp.paybackDays}d</p>
                        </div>
                      </div>

                      {/* ROI Badge */}
                      <div className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-bold shrink-0',
                        sp.roi >= 100 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        sp.roi >= 0 && sp.roi < 100 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        sp.roi < 0 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {formatPercent(sp.roi)} ROI
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <Progress
                        value={Math.min(100, Math.max(0, (sp.totalRevenue / (sp.estimatedCost * 3)) * 100))}
                        className="h-1.5"
                      />
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>Custo: {formatCurrency(sp.estimatedCost)}</span>
                        <span>Receita: {formatCurrency(sp.totalRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {roiData.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">Sem dados de ROI</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cadastre vendedores e registre vendas para ver o ROI.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  ROI por Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={roiChartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'roi' ? `${value}%` : formatCurrency(value),
                        name === 'roi' ? 'ROI' : name === 'revenue' ? 'Receita' : 'Custo',
                      ]}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Receita" radius={[6, 6, 0, 0]}>
                      {roiChartData.map((entry, index) => (
                        <Cell key={index} fill={`hsl(262, 83%, ${58 + index * 5}%)`} />
                      ))}
                    </Bar>
                    <Bar dataKey="cost" name="Custo" fill="hsl(var(--muted-foreground) / 0.3)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-emerald-500 mb-3" />
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Receita Total</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingDown className="h-8 w-8 mx-auto text-destructive mb-3" />
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalCosts)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Custo Total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Efficiency Tab */}
          <TabsContent value="efficiency" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  Eficiência: Atividades × Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" dataKey="x" name="Atividades" tick={{ fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" name="Receita" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Vendas" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'Receita' ? formatCurrency(value) : value,
                        name,
                      ]}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Scatter name="Vendedores" data={efficiencyData} fill="hsl(262, 83%, 58%)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue per activity ranking */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Receita por Atividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...roiData]
                  .sort((a, b) => b.revenuePerActivity - a.revenuePerActivity)
                  .map((sp) => (
                    <div key={sp.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{sp.name}</span>
                        <span className="text-xs text-muted-foreground">{sp.activitiesCount} atividades</span>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(sp.revenuePerActivity)}/atividade</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ROIDashboard;
