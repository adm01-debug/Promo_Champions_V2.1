import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays } from "date-fns";

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
        { data: userRoles }
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("salespeople").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("access_denied_logs").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("security_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("sdr_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("access_denied_logs").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("security_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("sdr_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("user_roles").select("role")
      ]);

      const roleDistribution = { admin: 0, manager: 0, salesperson: 0 };
      userRoles?.forEach((r: { role: string }) => {
        if (r.role in roleDistribution) {
          roleDistribution[r.role as keyof typeof roleDistribution]++;
        }
      });

      return {
        totalUsers: totalUsers || 0,
        totalSalespeople: totalSalespeople || 0,
        accessDeniedCount: accessDeniedCount || 0,
        securityAlertsCount: securityAlertsCount || 0,
        sdrAlertsCount: sdrAlertsCount || 0,
        recentAccessDenied: recentAccessDenied || [],
        recentSecurityAlerts: recentSecurityAlerts || [],
        recentSDRAlerts: recentSDRAlerts || [],
        roleDistribution
      };
    },
    staleTime: 60000,
  });
}

export function useEdgeFunctionsStatus() {
  return useQuery({
    queryKey: ["edge-functions-status"],
    queryFn: async () => {
      const { data: bitrixLogs } = await supabase
        .from("bitrix24_sync_logs")
        .select("status, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: circuitEvents } = await supabase
        .from("circuit_breaker_events")
        .select("circuit_name, new_state, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      const openCircuits = circuitEvents?.filter(e => e.new_state === "OPEN") || [];

      return {
        bitrixLastSync: bitrixLogs?.[0] || null,
        openCircuits,
        circuitEvents: circuitEvents || []
      };
    },
    staleTime: 30000,
  });
}
