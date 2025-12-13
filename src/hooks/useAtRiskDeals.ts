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
          salespeople (name)
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

        // No activity in 48+ hours
        if (hoursSinceLastActivity >= 48) {
          riskFactors.push(`${Math.floor(hoursSinceLastActivity / 24)} dias sem atividade`);
          riskScore += Math.min(40, Math.floor(hoursSinceLastActivity / 24) * 5);
        }

        // Deal stagnant (no stage change)
        if (daysSinceLastUpdate >= 7) {
          riskFactors.push(`${daysSinceLastUpdate} dias no mesmo estágio`);
          riskScore += Math.min(30, daysSinceLastUpdate * 2);
        }

        // Low activity count
        if (dealActivities.length < 3) {
          riskFactors.push(`Poucas atividades (${dealActivities.length})`);
          riskScore += 15;
        }

        // High value deal with low engagement
        if (sale.amount > 10000 && dealActivities.length < 5) {
          riskFactors.push('Deal de alto valor com baixo engajamento');
          riskScore += 20;
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskScore >= 70) riskLevel = 'critical';
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
            salespersonName: sale.salespeople?.name || 'Não atribuído',
            hoursSinceLastActivity,
            daysSinceLastUpdate,
            activityCount: dealActivities.length,
            riskLevel,
            riskScore,
            riskFactors,
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
