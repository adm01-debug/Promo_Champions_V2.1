import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInHours, differenceInDays } from 'date-fns';

export interface AtRiskDeal {
  id: string;
  clientName: string;
  productName: string;
  amount: number;
  stage: string;
  salespersonName: string;
  hoursSinceLastActivity: number;
  daysSinceLastUpdate: number;
  activityCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  riskFactors: string[];
  aiAnalysis?: string;
  suggestedAction?: string;
}

export interface AtRiskAnalysis {
  deals: AtRiskDeal[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    total: number;
    totalValueAtRisk: number;
  };
}

export function useAtRiskDeals() {
  return useQuery({
    queryKey: ['at-risk-deals'],
    queryFn: async (): Promise<AtRiskAnalysis> => {
      // Fetch active deals (not completed/lost)
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          salespeople (name),
          products (price, category)
        `)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'lost');

      if (salesError) throw salesError;

      // Fetch activities for these deals
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      const now = new Date();
      const atRiskDeals: AtRiskDeal[] = [];

      sales?.forEach(sale => {
        const dealActivities = activities?.filter(a => a.sale_id === sale.id) || [];
        const lastActivity = dealActivities[0];
        const lastActivityDate = lastActivity ? new Date(lastActivity.created_at) : null;
        const lastUpdateDate = new Date(sale.updated_at);

        const hoursSinceLastActivity = lastActivityDate 
          ? differenceInHours(now, lastActivityDate)
          : differenceInHours(now, new Date(sale.created_at));
        
        const daysSinceLastUpdate = differenceInDays(now, lastUpdateDate);

        // Calculate risk factors
        const riskFactors: string[] = [];
        let riskScore = 0;
        let suggestedAction = "";

        // 1. Inactivity
        if (hoursSinceLastActivity >= 48) {
          riskFactors.push(`${Math.floor(hoursSinceLastActivity / 24)} dias sem atividade`);
          riskScore += Math.min(40, Math.floor(hoursSinceLastActivity / 24) * 8);
          suggestedAction = "Realizar follow-up imediato.";
        }

        // 2. Stagnation
        if (daysSinceLastUpdate >= 7) {
          riskFactors.push(`${daysSinceLastUpdate} dias no mesmo estágio`);
          riskScore += Math.min(30, daysSinceLastUpdate * 3);
          if (!suggestedAction) suggestedAction = "Revisar estágio do funil.";
        }

        // 3. Low Engagement
        if (dealActivities.length < 2 && daysSinceLastUpdate >= 3) {
          riskFactors.push(`Baixo engajamento (apenas ${dealActivities.length} interações)`);
          riskScore += 25;
          if (!suggestedAction) suggestedAction = "Iniciar cadência de reativação.";
        }

        // 4. Value Anomaly
        const productPrice = (sale as any).products?.price || 0;
        if (productPrice > 0 && sale.amount > productPrice * 2.5) {
          riskFactors.push('Valor do deal atípico (muito superior ao preço de lista)');
          riskScore += 15;
          if (!suggestedAction) suggestedAction = "Verificar se o valor está correto.";
        }

        // 5. High Value + High Inactivity
        if (sale.amount > 5000 && hoursSinceLastActivity > 72) {
          riskFactors.push('Deal prioritário abandonado');
          riskScore += 30;
          suggestedAction = "ESCALAR: Deal prioritário sem contato há 3+ dias.";
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskScore >= 80) riskLevel = 'critical';
        else if (riskScore >= 50) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'medium';

        // Only include deals with some risk
        if (riskScore >= 20) {
          atRiskDeals.push({
            id: sale.id,
            clientName: sale.client_name,
            productName: sale.product_name,
            amount: sale.amount,
            stage: sale.status,
            salespersonName: (sale as any).salespeople?.name || 'Não atribuído',
            hoursSinceLastActivity,
            daysSinceLastUpdate,
            activityCount: dealActivities.length,
            riskLevel,
            riskScore,
            riskFactors,
            suggestedAction: suggestedAction || "Agendar próxima ação."
          });
        }
      });

      // Sort by risk score descending
      atRiskDeals.sort((a, b) => b.riskScore - a.riskScore);

      const summary = {
        critical: atRiskDeals.filter(d => d.riskLevel === 'critical').length,
        high: atRiskDeals.filter(d => d.riskLevel === 'high').length,
        medium: atRiskDeals.filter(d => d.riskLevel === 'medium').length,
        total: atRiskDeals.length,
        totalValueAtRisk: atRiskDeals
          .filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high')
          .reduce((sum, d) => sum + d.amount, 0),
      };

      return { deals: atRiskDeals, summary };
    },
    refetchInterval: 60000 * 5, // Refresh every 5 minutes
  });
}

export function useAnalyzeAtRiskDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string): Promise<{ analysis: string; recommendations: string[] }> => {
      const { data, error } = await supabase.functions.invoke('detect-at-risk-deals', {
        body: { dealId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['at-risk-deals'] });
    },
  });
}
