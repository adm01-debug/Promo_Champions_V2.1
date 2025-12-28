import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeadScoringCriteria {
  demographic: number;
  behavioral: number;
  engagement: number;
  fit: number;
}

interface ScoredLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  score: number;
  criteria: LeadScoringCriteria;
  priority: 'hot' | 'warm' | 'cold';
  recommendation: string;
}

export const useLeadScoring = () => {
  return useQuery<ScoredLead[]>({
    queryKey: ['lead-scoring'],
    queryFn: async (): Promise<ScoredLead[]> => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          company,
          job_title,
          company_size,
          industry,
          activities(type, created_at),
          email_opens,
          email_clicks,
          website_visits
        `);
      
      if (error) throw error;
      if (!data) return [];
      
      return data.map(lead => {
        // Demographic Score (0-25)
        let demographic = 0;
        if (lead.job_title?.toLowerCase().includes('director') || 
            lead.job_title?.toLowerCase().includes('manager')) demographic += 10;
        if (lead.job_title?.toLowerCase().includes('c-level') || 
            lead.job_title?.toLowerCase().includes('ceo')) demographic += 15;
        if (lead.company_size === 'enterprise') demographic += 10;
        
        // Behavioral Score (0-25)
        let behavioral = 0;
        const recentActivities = (lead.activities || []).filter((a: any) => {
          const activityDate = new Date(a.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return activityDate > weekAgo;
        });
        behavioral += Math.min(recentActivities.length * 3, 25);
        
        // Engagement Score (0-25)
        let engagement = 0;
        engagement += Math.min((lead.email_opens || 0) * 2, 10);
        engagement += Math.min((lead.email_clicks || 0) * 3, 10);
        engagement += Math.min((lead.website_visits || 0), 5);
        
        // Fit Score (0-25)
        let fit = 0;
        const targetIndustries = ['technology', 'finance', 'healthcare'];
        if (lead.industry && targetIndustries.includes(lead.industry.toLowerCase())) {
          fit += 15;
        }
        if (lead.company_size && ['medium', 'enterprise'].includes(lead.company_size)) {
          fit += 10;
        }
        
        const totalScore = demographic + behavioral + engagement + fit;
        
        let priority: 'hot' | 'warm' | 'cold';
        let recommendation: string;
        
        if (totalScore >= 70) {
          priority = 'hot';
          recommendation = 'Contato imediato - Alta probabilidade de conversão';
        } else if (totalScore >= 40) {
          priority = 'warm';
          recommendation = 'Nutrir com conteúdo relevante';
        } else {
          priority = 'cold';
          recommendation = 'Manter em campanha de aquecimento';
        }
        
        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          score: totalScore,
          criteria: { demographic, behavioral, engagement, fit },
          priority,
          recommendation
        };
      }).sort((a, b) => b.score - a.score);
    },
    staleTime: 5 * 60 * 1000
  });
};
