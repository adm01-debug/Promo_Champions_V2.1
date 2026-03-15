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

interface ScoredLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  score: number;
  category: 'Hot' | 'Warm' | 'Cold';
  factors: LeadScoreFactors;
  lastActivity?: Date;
}

/**
 * Hook for automatic lead scoring based on client data and activities.
 * Uses clients table with available columns (name, email, company, total_value)
 * and lead_scores table for persisted scores.
 */
export const useLeadScoring = (leadId?: string) => {
  return useQuery<ScoredLead[]>({
    queryKey: ['lead-scoring', leadId],
    queryFn: async (): Promise<ScoredLead[]> => {
      // Get clients with their portfolio and ICP data
      let clientQuery = supabase
        .from('clients')
        .select('id, name, email, company, total_value');

      if (leadId) {
        clientQuery = clientQuery.eq('id', leadId);
      }

      const { data: clients, error } = await clientQuery;
      if (error) throw error;
      if (!clients || clients.length === 0) return [];

      const clientIds = clients.map(c => c.id);

      // Get activities for engagement scoring
      const { data: activities } = await supabase
        .from('activities')
        .select('sale_id, activity_type, outcome, created_at')
        .order('created_at', { ascending: false });

      // Get sales linked to clients for behavior scoring
      const { data: sales } = await supabase
        .from('sales')
        .select('id, client_name, amount, status, created_at')
        .order('created_at', { ascending: false });

      // Get ICP data for enrichment
      const { data: icpData } = await supabase
        .from('icp_data')
        .select('client_id, is_icp_match, num_colaboradores, capital_social, ramo_atividade')
        .in('client_id', clientIds.length > 0 ? clientIds : ['none']);

      const icpMap = new Map((icpData || []).map(d => [d.client_id, d]));

      // Get existing lead scores
      const { data: existingScores } = await supabase
        .from('lead_scores')
        .select('sale_id, score, factors');

      return clients.map(client => {
        const icp = icpMap.get(client.id);
        const clientSales = (sales || []).filter(s => 
          s.client_name?.toLowerCase() === client.name?.toLowerCase()
        );

        // Company Size Score (0-20) based on ICP data
        const companySizeScore = calculateCompanySizeScore(icp?.num_colaboradores);

        // Industry Score (0-15) based on ICP ramo_atividade
        const industryScore = icp?.is_icp_match ? 15 : (icp?.ramo_atividade ? 10 : 5);

        // Job Title Score (0-15)
        const jobTitleScore = 10; // Default mid-range

        // Engagement Score (0-25) based on activities linked to client's sales
        const clientSaleIds = clientSales.map(s => s.id);
        const clientActivities = (activities || []).filter(a => 
          a.sale_id && clientSaleIds.includes(a.sale_id)
        );
        const engagementScore = calculateEngagementScore(clientActivities);

        // Source Score (0-10) based on total value
        const sourceScore = client.total_value > 100000 ? 10 : client.total_value > 50000 ? 7 : 5;

        // Behavior Score (0-15)
        const behaviorScore = calculateBehaviorScore(clientActivities, clientSales);

        const factors: LeadScoreFactors = {
          companySize: companySizeScore,
          industry: industryScore,
          jobTitle: jobTitleScore,
          engagement: engagementScore,
          source: sourceScore,
          behavior: behaviorScore,
        };

        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

        const lastActivity = clientActivities.length > 0
          ? new Date(clientActivities[0].created_at)
          : undefined;

        return {
          id: client.id,
          name: client.name,
          email: client.email || '',
          company: client.company || undefined,
          score: Math.round(totalScore),
          category: totalScore >= 80 ? 'Hot' as const : totalScore >= 50 ? 'Warm' as const : 'Cold' as const,
          factors,
          lastActivity,
        };
      }).sort((a, b) => b.score - a.score);
    },
    staleTime: 1000 * 60 * 15,
  });
};

// Alias for backwards compatibility
export const useLeadScores = useLeadScoring;

// Hook to trigger recalculation
export const useCalculateLeadScores = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      return saleIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring'] });
    },
  });
};

// Scoring helper functions
function calculateCompanySizeScore(numColaboradores?: number | null): number {
  if (!numColaboradores) return 5;
  if (numColaboradores > 500) return 20;
  if (numColaboradores > 100) return 15;
  if (numColaboradores > 20) return 10;
  return 5;
}

function calculateEngagementScore(activities: Array<{ created_at: string }>): number {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentActivities = activities.filter(
    a => new Date(a.created_at) > last30Days
  );

  return Math.min(recentActivities.length * 2, 25);
}

function calculateBehaviorScore(
  activities: Array<{ activity_type: string }>,
  sales: Array<{ status: string }>
): number {
  let score = 0;

  // Has active sales: +10
  const activeDeals = sales.filter(s => s.status !== 'completed' && s.status !== 'lost');
  if (activeDeals.length > 0) score += 10;

  // Has meetings: +5
  const hasMeeting = activities.some(a => a.activity_type === 'meeting');
  if (hasMeeting) score += 5;

  return Math.min(score, 15);
}
