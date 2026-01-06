import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  dueDate?: Date;
}

export const useNextBestAction = (dealId?: string) => {
  return useQuery<NextAction[]>({
    queryKey: ['next-best-action', dealId],
    queryFn: async () => {
      if (!dealId) return [];

      const { data: deal } = await supabase
        .from('sales')
        .select('*, activities(*)')
        .eq('id', dealId)
        .single();

      if (!deal) throw new Error('Deal not found');

      const actions: NextAction[] = [];

      // Inactivity check
      const lastActivity = deal.activities?.[0];
      if (lastActivity) {
        const daysSince = (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) {
          actions.push({
            action: 'Follow up with client',
            priority: 'high',
            reason: `No activity for ${Math.round(daysSince)} days`,
            dueDate: new Date(Date.now() + 86400000),
          });
        }
      }

      // Stage-based actions
      if (deal.status === 'Lead' || deal.status === 'lead') {
        actions.push({
          action: 'Schedule qualification call',
          priority: 'high',
          reason: 'Lead needs to be qualified',
        });
      }

      if (deal.status === 'Qualified' || deal.status === 'qualified') {
        actions.push({
          action: 'Send proposal',
          priority: 'medium',
          reason: 'Move to next stage',
        });
      }

      return actions;
    },
    enabled: !!dealId,
  });
};
