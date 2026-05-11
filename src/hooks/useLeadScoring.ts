import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeadScoreFactors {
  companySize: number;
  industry: number;
  jobTitle: number;
  engagement: number;
  source: number;
  behavior: number;
}

interface ServerScoreFactors {
  dealValue: number;
  stageProgress: number;
  timeInPipeline: number;
  category: number;
  recentActivity: number;
  labels?: Record<string, string>;
}

interface ScoredLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  score: number;
  category: 'Hot' | 'Warm' | 'Cold';
  factors: LeadScoreFactors | ServerScoreFactors;
  labels?: Record<string, string>;
  lastActivity?: Date;
  bestDealId?: string;
  trend?: number[]; // Historico recente
}

/**
 * Hook for lead scoring — uses the lead-scoring edge function for deal-based scoring
 * and falls back to local calculation for client-based scoring.
 */
export const useLeadScoring = (leadId?: string) => {
  return useQuery<ScoredLead[]>({
    queryKey: ['lead-scoring', leadId],
    queryFn: async (): Promise<ScoredLead[]> => {
      // Get clients
      const { data: trends } = await supabase.from('lead_score_trends').select('*').order('captured_at', { ascending: true });
      const trendMap = new Map<string, number[]>();
      (trends || []).forEach(t => {
        const existing = trendMap.get(t.sale_id) || [];
        existing.push(t.score);
        trendMap.set(t.sale_id, existing.slice(-5));
      });

      let clientQuery = supabase.from('clients').select('id, name, email, company, total_value');
      if (leadId) clientQuery = clientQuery.eq('id', leadId);

      const { data: clients, error } = await clientQuery;
      if (error) throw error;
      if (!clients || clients.length === 0) return [];

      // Get sales linked to clients for edge function scoring
      const { data: sales } = await supabase
        .from('sales')
        .select('id, client_name, amount, status, created_at')
        .order('created_at', { ascending: false });

      const clientSalesMap = new Map<string, string[]>();
      (sales || []).forEach(sale => {
        const client = clients.find(c => c.name?.toLowerCase() === sale.client_name?.toLowerCase());
        if (client) {
          const existing = clientSalesMap.get(client.id) || [];
          existing.push(sale.id);
          clientSalesMap.set(client.id, existing);
        }
      });

      // Collect all deal IDs for edge function scoring
      const allDealIds = Array.from(clientSalesMap.values()).flat();

      // Call edge function for server-side scoring if we have deals
      let serverScores: Record<string, { score: number; factors: ServerScoreFactors; labels: Record<string, string> }> = {};

      if (allDealIds.length > 0) {
        try {
          const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('lead-scoring', {
            body: { dealIds: allDealIds.slice(0, 50) }, // Limit batch size
          });

          if (!edgeError && edgeResult?.scores) {
            serverScores = edgeResult.scores;
          }
        } catch (err) {
          if (import.meta.env.DEV) console.warn('Edge function lead-scoring unavailable, using local fallback');
        }
      }

      // Get ICP data for enrichment
      const clientIds = clients.map(c => c.id);
      const { data: icpData } = await supabase
        .from('icp_data')
        .select('client_id, is_icp_match, num_colaboradores, capital_social, ramo_atividade')
        .in('client_id', clientIds.length > 0 ? clientIds : ['none']);

      const icpMap = new Map((icpData || []).map(d => [d.client_id, d]));

      return clients.map(client => {
        const dealIds = clientSalesMap.get(client.id) || [];
        const icp = icpMap.get(client.id);

        // Use best server score for this client if available
        let bestScore = 0;
        let bestFactors: ServerScoreFactors | null = null;
        let bestLabels: Record<string, string> = {};
        let bestDealId: string | undefined;

        dealIds.forEach(dealId => {
          const ss = serverScores[dealId];
          if (ss && ss.score > bestScore) {
            bestScore = ss.score;
            bestFactors = ss.factors;
            bestLabels = ss.labels || {};
            bestDealId = dealId;
          }
        });

        if (bestFactors) {
          // Use server-side score (edge function)
          return {
            id: client.id,
            name: client.name,
            email: client.email || '',
            company: client.company || undefined,
            score: bestScore,
            category: bestScore >= 80 ? 'Hot' as const : bestScore >= 50 ? 'Warm' as const : 'Cold' as const,
            factors: bestFactors,
            labels: bestLabels,
            bestDealId,
            trend: trendMap.get(bestDealId || '') || [],
          };
        }

        // Fallback: local scoring for clients without deals
        const companySizeScore = calculateCompanySizeScore(icp?.num_colaboradores);
        const industryScore = icp?.is_icp_match ? 15 : (icp?.ramo_atividade ? 10 : 5);
        const sourceScore = client.total_value > 100000 ? 10 : client.total_value > 50000 ? 7 : 5;

        const factors: LeadScoreFactors = {
          companySize: companySizeScore,
          industry: industryScore,
          jobTitle: 10,
          engagement: 5,
          source: sourceScore,
          behavior: 5,
        };

        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

        return {
          id: client.id,
          name: client.name,
          email: client.email || '',
          company: client.company || undefined,
          score: Math.round(totalScore),
          category: totalScore >= 80 ? 'Hot' as const : totalScore >= 50 ? 'Warm' as const : 'Cold' as const,
          factors,
        };
      }).sort((a, b) => b.score - a.score);
    },
    staleTime: 1000 * 60 * 15,
  });
};

export const useLeadScores = useLeadScoring;

export const useCalculateLeadScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      if (saleIds.length === 0) return {};

      const { data, error } = await supabase.functions.invoke('lead-scoring', {
        body: { dealIds: saleIds },
      });

      if (error) throw error;
      return data?.scores || {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring'] });
    },
  });
};

function calculateCompanySizeScore(numColaboradores?: number | null): number {
  if (!numColaboradores) return 5;
  if (numColaboradores > 500) return 20;
  if (numColaboradores > 100) return 15;
  if (numColaboradores > 20) return 10;
  return 5;
}
