import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays } from "date-fns";

import { getQueryMetrics } from "@/hooks/useQueryPerformance";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();

      const [
        { count: totalUsers },
        { count: totalSalespeople },
        { count: accessDeniedCount },
        { count: securityAlertsCount },
        { count: sdrAlertsCount },
        { data: recentAccessDenied },
        { data: recentSecurityAlerts },
        { data: recentSDRAlerts },
        { data: userRoles },
        { data: revenueData },
        { count: pendingApprovals },
        { data: bitrixLogs },
        { data: circuitEvents }
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("salespeople").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("access_denied_logs").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("security_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("sdr_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("access_denied_logs").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("security_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("sdr_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("user_roles").select("role"),
        supabase.from("sales").select("amount").eq("status", "completed"),
        supabase.from("commercial_approval_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bitrix24_sync_logs").select("status, created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("circuit_breaker_events").select("circuit_name, new_state, created_at").order("created_at", { ascending: false }).limit(10)
      ]);

      const roleDistribution = { admin: 0, manager: 0, salesperson: 0 };
      userRoles?.forEach((r: any) => {
        if (r.role in roleDistribution) {
          roleDistribution[r.role as keyof typeof roleDistribution]++;
        }
      });

      const totalRevenue = revenueData?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const openCircuits = circuitEvents?.filter((e: any) => e.new_state === "OPEN") || [];
      const queryMetrics = getQueryMetrics();

      return {
        totalUsers: totalUsers || 0,
        totalSalespeople: totalSalespeople || 0,
        accessDeniedCount: accessDeniedCount || 0,
        securityAlertsCount: securityAlertsCount || 0,
        sdrAlertsCount: sdrAlertsCount || 0,
        recentAccessDenied: recentAccessDenied || [],
        recentSecurityAlerts: recentSecurityAlerts || [],
        recentSDRAlerts: recentSDRAlerts || [],
        roleDistribution,
        totalRevenue,
        pendingApprovals: pendingApprovals || 0,
        edgeStatus: {
          bitrixLastSync: bitrixLogs?.[0] || null,
          openCircuits,
          circuitEvents: circuitEvents || []
        },
        queryMetrics
      };
    },
    staleTime: 30000,
  });
}

