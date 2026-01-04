import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurnIndicators {
  engagementDecline: number; // 0-100
  renewalDelay: number; // 0-100
  negativeFeedback: number; // 0-100
  usageDecline: number; // 0-100
}

interface ChurnRisk {
  clientId: string;
  clientName: string;
  riskScore: number; // 0-100
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  indicators: ChurnIndicators;
  recommendations: string[];
  lastContact?: Date;
  daysUntilRenewal?: number;
}

/**
 * Hook for predicting client churn
 * Analyzes engagement, renewals, feedback, and usage patterns
 */
export const useChurnPrediction = () => {
  return useQuery<ChurnRisk[]>({
    queryKey: ['churn-prediction'],
    queryFn: async (): Promise<ChurnRisk[]> => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          status,
          created_at,
          activities(created_at, type, sentiment),
          deals(renewal_date, status)
        `)
        .eq('status', 'customer');

      if (error) throw error;

      return clients.map(client => {
        // Engagement Decline (0-100)
        const engagementScore = calculateEngagementDecline(client.activities || []);

        // Renewal Delay (0-100)
        const renewalScore = calculateRenewalDelay(client.deals || []);

        // Negative Feedback (0-100)
        const feedbackScore = calculateNegativeFeedback(client.activities || []);

        // Usage Decline (0-100)
        const usageScore = calculateUsageDecline(client.activities || []);

        const indicators: ChurnIndicators = {
          engagementDecline: engagementScore,
          renewalDelay: renewalScore,
          negativeFeedback: feedbackScore,
          usageDecline: usageScore,
        };

        // Calculate overall risk score (weighted average)
        const riskScore = Math.round(
          (engagementScore * 0.3) +
          (renewalScore * 0.3) +
          (feedbackScore * 0.25) +
          (usageScore * 0.15)
        );

        const riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' =
          riskScore >= 75 ? 'Critical' :
          riskScore >= 50 ? 'High' :
          riskScore >= 25 ? 'Medium' : 'Low';

        const recommendations = generateRecommendations(riskLevel, indicators);

        const lastActivity = client.activities?.[0];
        const nextRenewal = client.deals?.find(d => d.renewal_date);

        return {
          clientId: client.id,
          clientName: client.name,
          riskScore,
          riskLevel,
          indicators,
          recommendations,
          lastContact: lastActivity ? new Date(lastActivity.created_at) : undefined,
          daysUntilRenewal: nextRenewal
            ? Math.ceil((new Date(nextRenewal.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : undefined,
        };
      }).sort((a, b) => b.riskScore - a.riskScore);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

function calculateEngagementDecline(activities: any[]): number {
  const last30 = activities.filter(a => {
    const date = new Date(a.created_at);
    const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  }).length;

  const prev30 = activities.filter(a => {
    const date = new Date(a.created_at);
    const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > 30 && daysAgo <= 60;
  }).length;

  if (prev30 === 0) return 0;
  
  const decline = ((prev30 - last30) / prev30) * 100;
  return Math.max(0, Math.min(100, decline));
}

function calculateRenewalDelay(deals: any[]): number {
  const renewal = deals.find(d => d.renewal_date);
  if (!renewal) return 0;

  const daysUntil = (new Date(renewal.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  
  if (daysUntil < 0) return 100; // Overdue
  if (daysUntil < 30) return 75; // Less than 30 days
  if (daysUntil < 60) return 50;
  return 0;
}

function calculateNegativeFeedback(activities: any[]): number {
  const feedbackActivities = activities.filter(a =>
    a.type === 'feedback' || a.type === 'call' || a.type === 'meeting'
  );

  if (feedbackActivities.length === 0) return 0;

  const negative = feedbackActivities.filter(a =>
    a.sentiment === 'negative'
  ).length;

  return (negative / feedbackActivities.length) * 100;
}

function calculateUsageDecline(activities: any[]): number {
  // Similar to engagement but focused on product usage
  return calculateEngagementDecline(activities) * 0.8;
}

function generateRecommendations(
  level: string,
  indicators: ChurnIndicators
): string[] {
  const recommendations: string[] = [];

  if (level === 'Critical' || level === 'High') {
    recommendations.push('Schedule immediate check-in call');
    recommendations.push('Review account health and usage');
  }

  if (indicators.engagementDecline > 50) {
    recommendations.push('Increase touchpoints and engagement');
  }

  if (indicators.renewalDelay > 50) {
    recommendations.push('Proactively discuss renewal terms');
  }

  if (indicators.negativeFeedback > 50) {
    recommendations.push('Address concerns and gather feedback');
  }

  if (indicators.usageDecline > 50) {
    recommendations.push('Provide training or product updates');
  }

  return recommendations;
}
