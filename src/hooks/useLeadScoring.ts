// @ts-nocheck
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
 * Hook for automatic lead scoring based on multiple criteria
 * Score range: 0-100
 * Hot: 80+, Warm: 50-79, Cold: <50
 */
export const useLeadScoring = (leadId?: string) => {
  return useQuery<ScoredLead[]>({
    queryKey: ['lead-scoring', leadId],
    queryFn: async (): Promise<ScoredLead[]> => {
      let query = supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          company,
          industry,
          company_size,
          source,
          activities(created_at, type),
          deals(created_at, value)
        `)
        .eq('status', 'lead');

      if (leadId) {
        query = query.eq('id', leadId);
      }

      const { data: leads, error } = await query;

      if (error) throw error;

      return leads.map(lead => {
        // Company Size Score (0-20)
        const companySizeScore = calculateCompanySizeScore(lead.company_size);

        // Industry Score (0-15)
        const industryScore = calculateIndustryScore(lead.industry);

        // Job Title Score (0-15) - would need job_title field
        const jobTitleScore = 10; // Default mid-range

        // Engagement Score (0-25)
        const engagementScore = calculateEngagementScore(lead.activities || []);

        // Source Score (0-10)
        const sourceScore = calculateSourceScore(lead.source);

        // Behavior Score (0-15)
        const behaviorScore = calculateBehaviorScore(
          lead.activities || [],
          lead.deals || []
        );

        const factors: LeadScoreFactors = {
          companySize: companySizeScore,
          industry: industryScore,
          jobTitle: jobTitleScore,
          engagement: engagementScore,
          source: sourceScore,
          behavior: behaviorScore,
        };

        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          score: Math.round(totalScore),
          category: totalScore >= 80 ? 'Hot' : totalScore >= 50 ? 'Warm' : 'Cold',
          factors,
          lastActivity: lead.activities?.[0]?.created_at
            ? new Date(lead.activities[0].created_at)
            : undefined,
        };
      }).sort((a, b) => b.score - a.score);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Alias for backwards compatibility
export const useLeadScores = useLeadScoring;

// Hook to calculate and save lead scores
export const useCalculateLeadScores = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      // Trigger recalculation by invalidating cache
      return saleIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring'] });
    },
  });
};

// Scoring helper functions
function calculateCompanySizeScore(size?: string): number {
  const sizeMap: Record<string, number> = {
    'enterprise': 20,
    'large': 15,
    'medium': 10,
    'small': 5,
    'startup': 3,
  };
  return sizeMap[size?.toLowerCase() || ''] || 5;
}

function calculateIndustryScore(industry?: string): number {
  // High-value industries
  const highValue = ['technology', 'finance', 'healthcare', 'manufacturing'];
  const mediumValue = ['retail', 'education', 'real estate'];
  
  if (!industry) return 5;
  
  if (highValue.some(i => industry.toLowerCase().includes(i))) return 15;
  if (mediumValue.some(i => industry.toLowerCase().includes(i))) return 10;
  return 5;
}

function calculateEngagementScore(activities: any[]): number {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentActivities = activities.filter(
    a => new Date(a.created_at) > last30Days
  );

  // 1 point per activity, max 25
  return Math.min(recentActivities.length * 2, 25);
}

function calculateSourceScore(source?: string): number {
  const sourceMap: Record<string, number> = {
    'referral': 10,
    'direct': 8,
    'organic': 7,
    'paid': 6,
    'social': 5,
    'other': 3,
  };
  return sourceMap[source?.toLowerCase() || 'other'] || 3;
}

function calculateBehaviorScore(activities: any[], deals: any[]): number {
  let score = 0;

  // Has active deals: +10
  if (deals.length > 0) score += 10;

  // Recent demo request: +5
  const hasDemo = activities.some(
    a => a.type === 'demo' || a.type === 'meeting'
  );
  if (hasDemo) score += 5;

  return Math.min(score, 15);
}
