import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, DollarSign, BarChart3, PieChart, Activity, Award, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';
import { ExecInsightsBanner } from '@/components/reports/ExecInsightsBanner';
import { QBRStoryGenerator } from '@/components/reports/QBRStoryGenerator';
import { PageTransition } from "@/components/transitions/PageTransition";

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142 71% 45%)', 'hsl(var(--destructive))', 'hsl(var(--secondary))'];

const RelatoriosExecutivos = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === 'week') return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
    if (period === 'month') return { start: startOfMonth(now), end: endOfMonth(now) };
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    return { start: quarterStart, end: quarterEnd };
  }, [period]);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['exec-report-sales', period],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales').select('id, amount, status, created_at, salesperson_id, client_name, product_name').gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  const { data: salespeople } = useQuery({
    queryKey: ['exec-report-sp'],
    queryFn: async () => { const { data } = await supabase.rpc('get_active_salespeople'); return data || []; },
    staleTime: 5 * 60 * 1000,
  });

  const { data: activities } = useQuery({
    queryKey: ['exec-report-activities', period],
    queryFn: async () => { const { data } = await supabase.from('activities').select('id, activity_type, outcome, salesperson_id, created_at').gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString()); return data || []; },
  });

  const metrics = useMemo(() => {
    if (!salesData) return null;
    const won = salesData.filter(s => s.status === 'won');
    const lost = salesData.filter(s => s.status === 'lost');
    const open = salesData.filter(s => !['won', 'lost', 'abandoned'].includes(s.status));
    const totalRevenue = won.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgTicket = won.length > 0 ? totalRevenue / won.length : 0;
    const conversionRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    const pipelineValue = open.reduce((sum, s) => sum + (s.amount || 0), 0);
    return { totalRevenue, avgTicket, conversionRate, pipelineValue, wonCount: won.length, lostCount: lost.length, openCount: open.length, totalDeals: salesData.length };
  }, [salesData]);

  const topSellers = useMemo(() => {
    if (!salesData || !salespeople) return [];
    const spMap = new Map(salespeople.map(sp => [sp.id, sp.name]));
    const revenue: Record<string, { name: string; revenue: number; deals: number }> = {};
    salesData.filter(s => s.status === 'won').forEach(sale => {
      const name = spMap.get(sale.salesperson_id || '') || 'N/A';
      if (!revenue[name]) revenue[name] = { name, revenue: 0, deals: 0 };
      revenue[name].revenue += sale.amount || 0;
      revenue[name].deals += 1;
    });
    return Object.values(revenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [salesData, salespeople]);

  const activitySummary = useMemo(() => {
    if (!activities) return [];
    const types: Record<string, number> = {};
    activities.forEach(a => { types[a.activity_type] = (types[a.activity_type] || 0) + 1; });
    const labels: Record<string, string> = { call: 'Ligações', email: 'E-mails', meeting: 'Reuniões', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', note: 'Notas' };
    return Object.entries(types).map(([type, count]) => ({ name: labels[type] || type, value: count }));
  }, [activities]);

  const statusDistribution = useMemo(() => {
    if (!salesData) return [];
    const counts: Record<string, number> = {};
    salesData.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    const labels: Record<string, string> = { won: 'Ganhas', lost: 'Perdidas', open: 'Abertas', lead: 'Leads', qualified: 'Qualificadas', proposal: 'Propostas', negotiation: 'Negociação' };
    return Object.entries(counts).map(([status, count]) => ({ name: labels[status] || status, value: count }));
  }, [salesData]);

  const periodLabel = period === 'week' ? 'Semanal' : period === 'month' ? 'Mensal' : 'Trimestral';

  const insights = useMemo(() => {
    if (!metrics || !activities) return [];
    const result: { type: 'success' | 'warning' | 'info'; text: string }[] = [];
    if (metrics.conversionRate >= 30) result.push({ type: 'success', text: `Taxa de conversão de ${metrics.conversionRate.toFixed(1)}% está acima da média do mercado.` });
    else if (metrics.conversionRate < 15) result.push({ type: 'warning', text: `Taxa de conversão de ${metrics.conversionRate.toFixed(1)}% está abaixo do esperado. Revisar qualificação de leads.` });
    if (metrics.pipelineValue > metrics.totalRevenue * 2) result.push({ type: 'info', text: `Pipeline de R$ ${(metrics.pipelineValue / 1000).toFixed(0)}k representa ${(metrics.pipelineValue / (metrics.totalRevenue || 1) * 100).toFixed(0)}% da receita — bom potencial de crescimento.` });
    if (activities.length > 0) {
      const connected = activities.filter(a => a.outcome === 'connected' || a.outcome === 'scheduled').length;
      result.push({ type: 'info', text: `${activities.length} atividades realizadas com ${(connected / activities.length * 100).toFixed(1)}% de taxa de conexão.` });
    }
    if (topSellers.length > 0) result.push({ type: 'success', text: `Top vendedor: ${topSellers[0].name} com R$ ${(topSellers[0].revenue / 1000).toFixed(1)}k em ${topSellers[0].deals} vendas.` });
    return result;
  }, [metrics, activities, topSellers]);

  const kpis = metrics ? [
    { label: 'Faturamento', value: `R$ ${(metrics.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-status-success' },
    { label: 'Vendas Ganhas', value: metrics.wonCount.toString(), icon: Award, color: 'text-primary' },
    { label: 'Ticket Médio', value: `R$ ${(metrics.avgTicket / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-accent' },
    { label: 'Taxa Conversão', value: `${metrics.conversionRate.toFixed(1)}%`, icon: Target, color: 'text-status-warning' },
  ] : [];

  return (
    <PageTransition>
    <>
      <Helmet><title>Relatórios Executivos | PROMO CHAMPIONS</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">📊 Relatórios Executivos</h1>
            <p className="text-muted-foreground mt-1">Visão executiva com insights automáticos por IA</p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-36"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ExecInsightsBanner insights={insights} periodLabel={periodLabel} />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><kpi.icon className={`h-5 w-5 ${kpi.color}`} /><span className="text-xs text-muted-foreground">{kpi.label}</span></div><div className="text-metric">{kpi.value}</div></CardContent></Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Top Vendedores</CardTitle></CardHeader><CardContent>{topSellers.length > 0 ? (<ResponsiveContainer width="100%" height={250}><BarChart data={topSellers} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} /><YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} /><Tooltip formatter={(v: any) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Receita']} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>) : (<div className="h-[250px] flex items-center justify-center text-muted-foreground">Sem dados</div>)}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4" /> Distribuição de Status</CardTitle></CardHeader><CardContent>{statusDistribution.length > 0 ? (<ResponsiveContainer width="100%" height={250}><RPieChart><Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>{statusDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></RPieChart></ResponsiveContainer>) : (<div className="h-[250px] flex items-center justify-center text-muted-foreground">Sem dados</div>)}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Atividades por Tipo</CardTitle></CardHeader><CardContent>{activitySummary.length > 0 ? (<ResponsiveContainer width="100%" height={250}><BarChart data={activitySummary}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>) : (<div className="h-[250px] flex items-center justify-center text-muted-foreground">Sem dados</div>)}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Pipeline Ativo</CardTitle></CardHeader><CardContent className="space-y-4">{metrics && (<><div className="text-center"><div className="text-metric-lg text-primary">R$ {(metrics.pipelineValue / 1000).toFixed(1)}k</div><div className="text-sm text-muted-foreground">{metrics.openCount} deals em andamento</div></div><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-status-success">✅ Ganhas: {metrics.wonCount}</span><span className="text-destructive">❌ Perdidas: {metrics.lostCount}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Total: {metrics.totalDeals} deals</span><span className="text-muted-foreground">Win rate: {metrics.conversionRate.toFixed(1)}%</span></div></div></>)}</CardContent></Card>
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default RelatoriosExecutivos;
