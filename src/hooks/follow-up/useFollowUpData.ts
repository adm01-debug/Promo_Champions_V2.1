import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInHours } from 'date-fns';
import { getTemperature, getSuggestedAction, type ColdLead } from '@/components/follow-up/types';

export function useFollowUpSettings() {
  return useQuery({
    queryKey: ['follow-up-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('follow_up_settings').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useFollowUpLeads(minDaysInactive: number) {
  return useQuery({
    queryKey: ['cold-leads', minDaysInactive],
    queryFn: async () => {
      const { data: deals, error: dealsError } = await supabase
        .from('sales')
        .select(
          `id, client_name, product_name, amount, status, updated_at, salesperson_id,
           lead_scores (score),
           deal_probability_scores (calibrated_probability)`
        )
        .in('status', ['lead', 'qualified', 'proposal', 'negotiation', 'open'])
        .order('updated_at', { ascending: true });
      if (dealsError) throw dealsError;

      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('sale_id, status, completed_at')
        .order('completed_at', { ascending: false });
      if (tasksError) throw tasksError;

      const pendingTaskIds = new Set(
        (allTasks || []).filter(t => t.status === 'pending').map(t => t.sale_id)
      );
      const completedTasksMap = (allTasks || [])
        .filter(t => t.status === 'completed')
        .reduce((acc: Record<string, number>, t) => {
          if (t.sale_id) acc[t.sale_id] = (acc[t.sale_id] || 0) + 1;
          return acc;
        }, {});

      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('sale_id, notes, created_at, activity_type')
        .order('created_at', { ascending: false });
      if (activitiesError) throw activitiesError;

      const activitiesMap = (activities || []).reduce(
        (acc: Record<string, (typeof activities)[0]>, act) => {
          if (act.sale_id && !acc[act.sale_id]) acc[act.sale_id] = act;
          return acc;
        },
        {}
      );

      const now = new Date();
      return (deals || [])
        .map(deal => {
          const hoursInactive = differenceInHours(now, new Date(deal.updated_at));
          const daysInactive = Math.floor(hoursInactive / 24);
          const temp = getTemperature(daysInactive);
          const suggestion = getSuggestedAction(temp);
          const lastActivity = activitiesMap[deal.id];
          const score = (deal as any).lead_scores?.[0]?.score || 0;
          const probability =
            (deal as any).deal_probability_scores?.[0]?.calibrated_probability || undefined;
          const healthScore = Math.max(0, Math.min(100, 100 - daysInactive * 5 + score / 10));
          const velocity =
            daysInactive < 5 ? 'increasing' : daysInactive > 10 ? 'decreasing' : 'stable';

          return {
            ...deal,
            days_inactive: daysInactive,
            temperature: temp,
            suggested_action: suggestion.action,
            suggested_channel: suggestion.channel,
            last_activity: lastActivity
              ? { notes: lastActivity.notes, created_at: lastActivity.created_at, type: lastActivity.activity_type }
              : undefined,
            score,
            health_score: Math.round(healthScore),
            interaction_velocity: velocity,
            probability,
            has_pending_task: pendingTaskIds.has(deal.id),
            follow_up_count: completedTasksMap[deal.id] || 0,
          } as ColdLead;
        })
        .filter(lead => lead.days_inactive >= minDaysInactive)
        .sort((a, b) => b.days_inactive - a.days_inactive);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFollowUpAuditLogs(saleId?: string | null) {
  return useQuery({
    queryKey: ['follow-up-audit-logs', saleId],
    queryFn: async () => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from('follow_up_audit_view')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!saleId,
  });
}
