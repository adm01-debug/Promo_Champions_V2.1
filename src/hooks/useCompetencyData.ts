import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CompetencyData } from '@/components/analytics/CompetencyRadar';

/**
 * Computes competency radar data from real activities and sales data.
 * Maps activity types and sales outcomes to competency areas.
 */
export function useCompetencyData(salespersonId?: string) {
  const { salesperson } = useAuth();
  const spId = salespersonId || salesperson?.id;

  return useQuery<CompetencyData[]>({
    queryKey: ['competency-data', spId],
    queryFn: async () => {
      if (!spId) return [];

      const [activitiesRes, salesRes, outcomesRes] = await Promise.all([
        supabase.from('activities').select('activity_type, outcome')
          .eq('salesperson_id', spId).limit(500),
        supabase.from('sales').select('status, amount')
          .eq('salesperson_id', spId).limit(500),
        supabase.from('deal_outcomes').select('outcome, reason')
          .eq('salesperson_id', spId).limit(200),
      ]);

      const activities = activitiesRes.data || [];
      const sales = salesRes.data || [];
      const outcomes = outcomesRes.data || [];

      const totalActivities = Math.max(activities.length, 1);
      const totalSales = Math.max(sales.length, 1);

      // Prospection: calls + emails ratio
      const prospectionActivities = activities.filter(a => a.activity_type === 'call' || a.activity_type === 'email');
      const prospectionScore = Math.min(100, Math.round((prospectionActivities.length / totalActivities) * 150));

      // Qualification: qualified leads ratio
      const qualifiedSales = sales.filter(s => ['qualified', 'proposal', 'negotiation', 'completed'].includes(s.status));
      const qualificationScore = Math.min(100, Math.round((qualifiedSales.length / totalSales) * 120));

      // Negotiation: proposals/negotiations ratio
      const negotiationSales = sales.filter(s => ['negotiation', 'completed'].includes(s.status));
      const negotiationScore = Math.min(100, Math.round((negotiationSales.length / totalSales) * 130));

      // Closing: completed deals ratio
      const completedSales = sales.filter(s => s.status === 'completed');
      const closingScore = Math.min(100, Math.round((completedSales.length / totalSales) * 140));

      // Follow-up: meetings ratio
      const followUpActivities = activities.filter(a => a.activity_type === 'call' || a.activity_type === 'email' || a.activity_type === 'whatsapp');
      const followUpScore = Math.min(100, Math.round((followUpActivities.length / totalActivities) * 160));

      // Presentation: successful outcomes (connected, qualified, scheduled)
      const successfulOutcomes = activities.filter(a => a.outcome === 'connected' || a.outcome === 'qualified' || a.outcome === 'scheduled');
      const presentationScore = Math.min(100, Math.round((successfulOutcomes.length / totalActivities) * 140));

      return [
        { area: 'Prospecção', value: prospectionScore, maxValue: 100, icon: '📞' },
        { area: 'Qualificação', value: qualificationScore, maxValue: 100, icon: '🎯' },
        { area: 'Negociação', value: negotiationScore, maxValue: 100, icon: '🤝' },
        { area: 'Fechamento', value: closingScore, maxValue: 100, icon: '🏆' },
        { area: 'Follow-up', value: followUpScore, maxValue: 100, icon: '📋' },
        { area: 'Apresentação', value: presentationScore, maxValue: 100, icon: '📊' },
      ];
    },
    enabled: !!spId,
    staleTime: 10 * 60 * 1000,
  });
}
