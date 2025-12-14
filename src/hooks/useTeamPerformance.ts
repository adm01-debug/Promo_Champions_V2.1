import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface TeamMemberMetrics {
  id: string;
  name: string;
  avatar_url: string | null;
  role: "sdr" | "closer" | "hybrid";
  totalSales: number;
  completedDeals: number;
  activitiesCount: number;
  meetingsScheduled: number;
  conversionRate: number;
  avgDealValue: number;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  isActive: boolean;
  sdr: TeamMemberMetrics | null;
  closers: TeamMemberMetrics[];
  totals: {
    totalRevenue: number;
    totalDeals: number;
    totalActivities: number;
    totalMeetings: number;
    avgConversion: number;
  };
}

export function useTeamPerformance(month?: Date) {
  const targetMonth = month || new Date();
  const monthStart = format(startOfMonth(targetMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(targetMonth), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["team-performance", monthStart],
    queryFn: async (): Promise<TeamPerformance[]> => {
      // Fetch teams with SDR and closers
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select(`
          id, name, is_active, sdr_id,
          sdr:salespeople!teams_sdr_id_fkey(id, name, avatar_url, role)
        `)
        .order("name");

      if (teamsError) throw teamsError;

      // Fetch team closers
      const { data: teamClosers, error: closersError } = await supabase
        .from("team_closers")
        .select(`
          team_id, closer_id,
          salesperson:salespeople!team_closers_closer_id_fkey(id, name, avatar_url, role)
        `);

      if (closersError) throw closersError;

      // Fetch all salespeople IDs from teams
      const salespersonIds = new Set<string>();
      teams?.forEach((t) => {
        if (t.sdr_id) salespersonIds.add(t.sdr_id);
      });
      teamClosers?.forEach((tc) => {
        if (tc.closer_id) salespersonIds.add(tc.closer_id);
      });

      const idsArray = Array.from(salespersonIds);
      if (idsArray.length === 0) return [];

      // Fetch sales for this month
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("salesperson_id, amount, status")
        .in("salesperson_id", idsArray)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd + "T23:59:59");

      if (salesError) throw salesError;

      // Fetch activities for this month
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("salesperson_id, activity_type, outcome")
        .in("salesperson_id", idsArray)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd + "T23:59:59");

      if (activitiesError) throw activitiesError;

      // Calculate metrics per salesperson
      const metricsMap = new Map<string, {
        totalSales: number;
        completedDeals: number;
        totalDeals: number;
        activitiesCount: number;
        meetingsScheduled: number;
      }>();

      idsArray.forEach((id) => {
        metricsMap.set(id, {
          totalSales: 0,
          completedDeals: 0,
          totalDeals: 0,
          activitiesCount: 0,
          meetingsScheduled: 0,
        });
      });

      sales?.forEach((sale) => {
        if (!sale.salesperson_id) return;
        const metrics = metricsMap.get(sale.salesperson_id);
        if (metrics) {
          metrics.totalDeals++;
          if (sale.status === "completed") {
            metrics.totalSales += Number(sale.amount) || 0;
            metrics.completedDeals++;
          }
        }
      });

      activities?.forEach((activity) => {
        if (!activity.salesperson_id) return;
        const metrics = metricsMap.get(activity.salesperson_id);
        if (metrics) {
          metrics.activitiesCount++;
          if (activity.outcome === "scheduled") {
            metrics.meetingsScheduled++;
          }
        }
      });

      // Build team performance data
      return (teams || []).map((team) => {
        const teamClosersList = teamClosers?.filter((tc) => tc.team_id === team.id) || [];

        const buildMemberMetrics = (
          person: { id: string; name: string; avatar_url: string | null; role: string } | null
        ): TeamMemberMetrics | null => {
          if (!person) return null;
          const metrics = metricsMap.get(person.id) || {
            totalSales: 0,
            completedDeals: 0,
            totalDeals: 0,
            activitiesCount: 0,
            meetingsScheduled: 0,
          };
          return {
            id: person.id,
            name: person.name,
            avatar_url: person.avatar_url,
            role: person.role as "sdr" | "closer" | "hybrid",
            totalSales: metrics.totalSales,
            completedDeals: metrics.completedDeals,
            activitiesCount: metrics.activitiesCount,
            meetingsScheduled: metrics.meetingsScheduled,
            conversionRate: metrics.totalDeals > 0 
              ? (metrics.completedDeals / metrics.totalDeals) * 100 
              : 0,
            avgDealValue: metrics.completedDeals > 0 
              ? metrics.totalSales / metrics.completedDeals 
              : 0,
          };
        };

        const sdr = buildMemberMetrics(team.sdr);
        const closers = teamClosersList
          .map((tc) => buildMemberMetrics(tc.salesperson))
          .filter((c): c is TeamMemberMetrics => c !== null);

        const allMembers = [sdr, ...closers].filter((m): m is TeamMemberMetrics => m !== null);

        return {
          teamId: team.id,
          teamName: team.name,
          isActive: team.is_active,
          sdr,
          closers,
          totals: {
            totalRevenue: allMembers.reduce((sum, m) => sum + m.totalSales, 0),
            totalDeals: allMembers.reduce((sum, m) => sum + m.completedDeals, 0),
            totalActivities: allMembers.reduce((sum, m) => sum + m.activitiesCount, 0),
            totalMeetings: allMembers.reduce((sum, m) => sum + m.meetingsScheduled, 0),
            avgConversion: allMembers.length > 0
              ? allMembers.reduce((sum, m) => sum + m.conversionRate, 0) / allMembers.length
              : 0,
          },
        };
      });
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
