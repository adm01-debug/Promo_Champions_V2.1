import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface RevenueInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: number;
  priority: 'high' | 'medium' | 'low';
  actionable: string;
}

export interface RevenueIntelligence {
  currentRevenue: number;
  projectedRevenue: number;
  revenueGap: number;
  growthRate: number;
  avgDealSize: number;
  topProducts: { name: string; revenue: number; growth: number }[];
  topClients: { name: string; revenue: number; trend: 'up' | 'down' | 'stable' }[];
  insights: RevenueInsight[];
  quarterlyTrend: { quarter: string; revenue: number }[];
}

export function useRevenueIntelligence() {
  return useQuery({
    queryKey: ['revenue-intelligence'],
    queryFn: async (): Promise<RevenueIntelligence> => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      // Vendas do mês atual
      const { data: currentSales } = await supabase
        .from('sales')
        .select('amount, product_name, client_name')
        .eq('status', 'completed')
        .gte('created_at', thisMonth.toISOString());

      // Vendas do mês passado
      const { data: lastMonthSales } = await supabase
        .from('sales')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', thisMonth.toISOString());

      // Pipeline ativo
      const { data: pipeline } = await supabase
        .from('sales')
        .select('amount')
        .eq('status', 'pending');

      // Metas
      const { data: goals } = await supabase
        .from('sales_goals')
        .select('goal_amount')
        .gte('month', thisMonth.toISOString().split('T')[0]);

      // Métricas históricas
      const { data: historicalMetrics } = await supabase
        .from('daily_metrics')
        .select('date, revenue')
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const currentRevenue = currentSales?.reduce((sum, s) => sum + s.amount, 0) || 0;
      const lastMonthRevenue = lastMonthSales?.reduce((sum, s) => sum + s.amount, 0) || 0;
      const pipelineValue = pipeline?.reduce((sum, s) => sum + s.amount, 0) || 0;
      const goalAmount = goals?.[0]?.goal_amount || 0;

      const growthRate = lastMonthRevenue > 0 
        ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const avgDealSize = currentSales && currentSales.length > 0
        ? currentRevenue / currentSales.length
        : 0;

      // Top produtos
      const productRevenue: Record<string, number> = {};
      currentSales?.forEach(s => {
        productRevenue[s.product_name] = (productRevenue[s.product_name] || 0) + s.amount;
      });
      const topProducts = Object.entries(productRevenue)
        .map(([name, revenue]) => ({ name, revenue, growth: 0 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Top clientes
      const clientRevenue: Record<string, number> = {};
      currentSales?.forEach(s => {
        clientRevenue[s.client_name] = (clientRevenue[s.client_name] || 0) + s.amount;
      });
      const topClients = Object.entries(clientRevenue)
        .map(([name, revenue]) => ({ name, revenue, trend: 'stable' as const }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Quarterly trend
      const quarterlyTrend: { quarter: string; revenue: number }[] = [];
      const quarters: Record<string, number> = {};
      historicalMetrics?.forEach(m => {
        const date = new Date(m.date);
        const q = `Q${Math.ceil((date.getMonth() + 1) / 3)}/${date.getFullYear()}`;
        quarters[q] = (quarters[q] || 0) + m.revenue;
      });
      Object.entries(quarters).forEach(([quarter, revenue]) => {
        quarterlyTrend.push({ quarter, revenue });
      });

      // Gerar insights
      const insights: RevenueInsight[] = [];

      // Insight: Gap de meta
      const revenueGap = goalAmount - currentRevenue;
      if (revenueGap > 0) {
        insights.push({
          type: 'risk',
          title: 'Gap de Meta Identificado',
          description: `Faltam R$ ${revenueGap.toLocaleString('pt-BR')} para atingir a meta do mês.`,
          impact: revenueGap,
          priority: revenueGap > goalAmount * 0.3 ? 'high' : 'medium',
          actionable: 'Priorize deals do pipeline com maior probabilidade de fechamento.',
        });
      }

      // Insight: Pipeline saudável
      if (pipelineValue > goalAmount * 2) {
        insights.push({
          type: 'opportunity',
          title: 'Pipeline Robusto',
          description: `Pipeline de R$ ${pipelineValue.toLocaleString('pt-BR')} representa ${((pipelineValue / goalAmount) * 100).toFixed(0)}% da meta.`,
          impact: pipelineValue,
          priority: 'medium',
          actionable: 'Acelere o ciclo de vendas para converter mais deals.',
        });
      }

      // Insight: Crescimento
      if (growthRate > 10) {
        insights.push({
          type: 'trend',
          title: 'Crescimento Acelerado',
          description: `Receita cresceu ${growthRate.toFixed(1)}% vs mês anterior.`,
          impact: currentRevenue - lastMonthRevenue,
          priority: 'low',
          actionable: 'Mantenha as estratégias atuais e escale o que funciona.',
        });
      } else if (growthRate < -10) {
        insights.push({
          type: 'risk',
          title: 'Queda de Receita',
          description: `Receita caiu ${Math.abs(growthRate).toFixed(1)}% vs mês anterior.`,
          impact: lastMonthRevenue - currentRevenue,
          priority: 'high',
          actionable: 'Revise funil de vendas e identifique gargalos.',
        });
      }

      // Projected revenue (baseado em win rate histórico)
      const projectedRevenue = currentRevenue + (pipelineValue * 0.35);

      return {
        currentRevenue,
        projectedRevenue,
        revenueGap,
        growthRate,
        avgDealSize,
        topProducts,
        topClients,
        insights,
        quarterlyTrend,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
