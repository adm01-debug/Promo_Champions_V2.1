import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  normalizeBriefing,
  type ExecutiveBriefing,
} from '@/components/executive-briefing/briefingHelpers';

export function useBriefingHistory(limit = 14) {
  return useQuery({
    queryKey: ['executive-briefing', 'history', limit],
    queryFn: async (): Promise<ExecutiveBriefing[]> => {
      const { data, error } = await supabase
        .from('executive_briefings')
        .select('*')
        .order('briefing_date', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(normalizeBriefing);
    },
    staleTime: 5 * 60_000,
  });
}
