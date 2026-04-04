/**
 * Hook to query page analytics data for dashboards and reports.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RouteUsage {
  route: string;
  page_title: string;
  total_visits: number;
  total_duration: number;
  avg_duration: number;
  total_interactions: number;
  unique_sessions: number;
}

export function usePageAnalytics(days: number = 30) {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ["page-analytics", salesperson?.id, days],
    queryFn: async (): Promise<RouteUsage[]> => {
      if (!salesperson?.id) return [];

      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from("page_analytics")
        .select("route, page_title, duration_seconds, interactions, session_id")
        .eq("salesperson_id", salesperson.id)
        .gte("entered_at", since.toISOString())
        .order("entered_at", { ascending: false })
        .limit(1000);

      if (error || !data) return [];

      type InternalUsage = RouteUsage & { _sessions: Set<string> };
      const map = new Map<string, InternalUsage>();

      for (const row of data) {
        const key = row.route;
        const existing = map.get(key);

        if (existing) {
          existing.total_visits += 1;
          existing.total_duration += row.duration_seconds ?? 0;
          existing.total_interactions += row.interactions ?? 0;
          if (row.session_id && !existing._sessions.has(row.session_id)) {
            existing.unique_sessions += 1;
            existing._sessions.add(row.session_id);
          }
        } else {
          const sessions = new Set<string>();
          if (row.session_id) sessions.add(row.session_id);
          map.set(key, {
            route: key,
            page_title: row.page_title ?? key,
            total_visits: 1,
            total_duration: row.duration_seconds ?? 0,
            avg_duration: 0,
            total_interactions: row.interactions ?? 0,
            unique_sessions: sessions.size,
            _sessions: sessions,
          });
        }
      }

      // Calculate averages and clean up
      const results: RouteUsage[] = [];
      for (const [, usage] of map) {
        usage.avg_duration = usage.total_visits > 0
          ? Math.round(usage.total_duration / usage.total_visits)
          : 0;
        delete (usage as any)._sessions;
        results.push(usage);
      }

      return results.sort((a, b) => b.total_visits - a.total_visits);
    },
    enabled: !!salesperson?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
