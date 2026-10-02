import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STAGE_ORDER = ['pending', 'qualified', 'proposal', 'negotiation', 'completed'];
const STAGE_LABELS: Record<string, string> = {
  pending: 'Leads',
  qualified: 'Verified',
  proposal: 'Proposal',
  negotiation: 'Sync',
  completed: 'Locked',
};
const STAGE_COLORS = [
  'rgba(14, 165, 233, 0.4)',
  'rgba(14, 165, 233, 0.55)',
  'rgba(14, 165, 233, 0.7)',
  'rgba(14, 165, 233, 0.85)',
  'rgba(34, 197, 94, 0.8)',
];

export function useFunnelStatusCounts() {
  return useQuery({
    queryKey: ['funnel-chart-real'],
    queryFn: async () => {
      const { data: sales, error } = await supabase.from('sales').select('status');
      if (error) throw error;

      const counts: Record<string, number> = {};
      (sales || []).forEach(s => {
        const status = s.status || 'pending';
        counts[status] = (counts[status] || 0) + 1;
      });

      return STAGE_ORDER.map((stage, i) => ({
        stage: STAGE_LABELS[stage] || stage,
        value: counts[stage] || 0,
        color: STAGE_COLORS[i],
      }));
    },
    staleTime: 60_000,
  });
}
