import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface CustomerHealth {
  clientId: string;
  clientName: string;
  healthScore: number;
  status: 'healthy' | 'at-risk' | 'churning';
  factors: {
    purchaseFrequency: number;
    recentActivity: number;
    totalValue: number;
    engagementScore: number;
  };
  lastPurchase: string | null;
  daysSinceLastPurchase: number;
  recommendation: string;
}

export interface CustomerHealthResult {
  clients: CustomerHealth[];
  avgHealthScore: number;
  healthyCount: number;
  atRiskCount: number;
  churningCount: number;
}

export function useCustomerHealthScore() {
  return useQuery({
    queryKey: ['customer-health-score'],
    queryFn: async (): Promise<CustomerHealthResult> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Buscar todos os clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, total_value, updated_at');

      if (clientsError) throw clientsError;

      // Buscar vendas dos últimos 6 meses
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('client_name, amount, created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (salesError) throw salesError;

      // Buscar atividades recentes
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('contact_name, activity_type, created_at, outcome')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (activitiesError) throw activitiesError;

      // Processar cada cliente
      const healthData: CustomerHealth[] = (clients || []).map(client => {
        const clientSales = sales?.filter(s => s.client_name === client.name) || [];
        const completedSales = clientSales.filter(s => s.status === 'completed');
        const clientActivities = activities?.filter(a => a.contact_name === client.name) || [];

        // Calcular dias desde última compra
        const lastSale = completedSales
          .map(s => new Date(s.created_at))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        
        const daysSinceLastPurchase = lastSale 
          ? Math.ceil((now.getTime() - lastSale.getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        // Score de frequência de compra (0-25)
        const purchaseFrequency = Math.min(25, completedSales.length * 5);

        // Score de atividade recente (0-25)
        const recentActivities = clientActivities.filter(a => {
          const actDate = new Date(a.created_at);
          return (now.getTime() - actDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
        });
        const recentActivity = Math.min(25, recentActivities.length * 5);

        // Score de valor total (0-25)
        const avgClientValue = (clients || []).reduce((sum, c) => sum + c.total_value, 0) / (clients?.length || 1);
        const totalValue = Math.min(25, Math.round((client.total_value / (avgClientValue || 1)) * 12.5));

        // Score de engajamento (0-25)
        const positiveOutcomes = clientActivities.filter(a => 
          a.outcome === 'connected' || a.outcome === 'qualified' || a.outcome === 'scheduled'
        ).length;
        const engagementScore = Math.min(25, positiveOutcomes * 8);

        // Penalidade por inatividade
        let inactivityPenalty = 0;
        if (daysSinceLastPurchase > 180) inactivityPenalty = 30;
        else if (daysSinceLastPurchase > 90) inactivityPenalty = 20;
        else if (daysSinceLastPurchase > 60) inactivityPenalty = 10;

        const healthScore = Math.max(0, purchaseFrequency + recentActivity + totalValue + engagementScore - inactivityPenalty);

        let status: 'healthy' | 'at-risk' | 'churning';
        let recommendation: string;

        if (healthScore >= 60) {
          status = 'healthy';
          recommendation = 'Cliente saudável. Considere upsell ou cross-sell.';
        } else if (healthScore >= 30) {
          status = 'at-risk';
          recommendation = 'Cliente em risco. Agende contato de relacionamento.';
        } else {
          status = 'churning';
          recommendation = 'Alto risco de churn. Ação urgente necessária!';
        }

        return {
          clientId: client.id,
          clientName: client.name,
          healthScore,
          status,
          factors: { purchaseFrequency, recentActivity, totalValue, engagementScore },
          lastPurchase: lastSale?.toISOString() || null,
          daysSinceLastPurchase,
          recommendation,
        };
      });

      // Ordenar por score (menor primeiro para destacar os que precisam de atenção)
      healthData.sort((a, b) => a.healthScore - b.healthScore);

      const avgHealthScore = healthData.length > 0
        ? healthData.reduce((sum, c) => sum + c.healthScore, 0) / healthData.length
        : 0;

      return {
        clients: healthData,
        avgHealthScore,
        healthyCount: healthData.filter(c => c.status === 'healthy').length,
        atRiskCount: healthData.filter(c => c.status === 'at-risk').length,
        churningCount: healthData.filter(c => c.status === 'churning').length,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
