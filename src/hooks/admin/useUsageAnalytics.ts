/**
 * Métricas de uso/adoção da plataforma: page_analytics agregados por rota
 * e por vendedor ativo. Usado pela página Usage Analytics.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import {
  aggregatePageViews,
  aggregateUserActivity,
  type AnalyticsEvent,
  type PageView,
  type UserActivity,
} from '@/lib/usageAnalytics';

export function useUsageAnalytics() {
  return useQuery<{
    pageViews: PageView[];
    userActivity: UserActivity[];
  }>({
    queryKey: ['usage-analytics'],
    queryFn: async () => {
      const [eventsResult, salespeopleResult] = await Promise.all([
        supabase
          .from('page_analytics')
          .select('route, salesperson_id, entered_at')
          .order('entered_at', { ascending: false })
          .limit(10_000),
        supabase.from('salespeople').select('id, name').eq('is_active', true),
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (salespeopleResult.error) throw salespeopleResult.error;

      const salespeople = new Map(
        (salespeopleResult.data ?? []).map(({ id, name }) => [id, name])
      );
      const events = (eventsResult.data ?? []) as AnalyticsEvent[];

      return {
        pageViews: aggregatePageViews(events),
        userActivity: aggregateUserActivity(events, salespeople),
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
}
