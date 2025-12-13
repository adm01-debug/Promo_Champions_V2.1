import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface SalespersonActivityData {
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  role: string;
  // Activity volumes
  total_activities: number;
  calls: number;
  emails: number;
  meetings: number;
  linkedin: number;
  whatsapp: number;
  // Outcomes
  connected: number;
  scheduled: number;
  qualified: number;
  no_answer: number;
  not_interested: number;
  // Metrics
  connection_rate: number;
  scheduling_rate: number;
  qualification_rate: number;
  avg_activities_per_day: number;
}

export interface ActivityTrendData {
  date: string;
  calls: number;
  emails: number;
  meetings: number;
  total: number;
}

export interface TeamActivitySummary {
  total_activities: number;
  total_calls: number;
  total_emails: number;
  total_meetings: number;
  avg_connection_rate: number;
  avg_scheduling_rate: number;
  top_performer_id: string | null;
  top_performer_name: string | null;
}

export function useSalespersonActivityReport(months: number = 1) {
  return useQuery({
    queryKey: ["salesperson-activity-report", months],
    queryFn: async () => {
      const endDate = endOfMonth(new Date());
      const startDate = startOfMonth(subMonths(new Date(), months - 1));
      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch activities in period
      const { data: activities, error: actError } = await supabase
        .from("activities")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (actError) throw actError;

      // Calculate per-salesperson data
      const salespersonData: SalespersonActivityData[] = (salespeople || []).map(sp => {
        const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);
        
        const calls = spActivities.filter(a => a.activity_type === 'call').length;
        const emails = spActivities.filter(a => a.activity_type === 'email').length;
        const meetings = spActivities.filter(a => a.activity_type === 'meeting').length;
        const linkedin = spActivities.filter(a => a.activity_type === 'linkedin').length;
        const whatsapp = spActivities.filter(a => a.activity_type === 'whatsapp').length;
        
        const connected = spActivities.filter(a => a.outcome === 'connected').length;
        const scheduled = spActivities.filter(a => a.outcome === 'scheduled').length;
        const qualified = spActivities.filter(a => a.outcome === 'qualified').length;
        const no_answer = spActivities.filter(a => a.outcome === 'no_answer').length;
        const not_interested = spActivities.filter(a => a.outcome === 'not_interested').length;

        const total = spActivities.length;
        const attempted = total;
        
        return {
          salesperson_id: sp.id,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          total_activities: total,
          calls,
          emails,
          meetings,
          linkedin,
          whatsapp,
          connected,
          scheduled,
          qualified,
          no_answer,
          not_interested,
          connection_rate: attempted > 0 ? (connected / attempted) * 100 : 0,
          scheduling_rate: attempted > 0 ? (scheduled / attempted) * 100 : 0,
          qualification_rate: attempted > 0 ? (qualified / attempted) * 100 : 0,
          avg_activities_per_day: daysInPeriod > 0 ? total / daysInPeriod : 0,
        };
      });

      // Calculate team summary
      const totalActivities = salespersonData.reduce((sum, sp) => sum + sp.total_activities, 0);
      const totalCalls = salespersonData.reduce((sum, sp) => sum + sp.calls, 0);
      const totalEmails = salespersonData.reduce((sum, sp) => sum + sp.emails, 0);
      const totalMeetings = salespersonData.reduce((sum, sp) => sum + sp.meetings, 0);
      
      const avgConnectionRate = salespersonData.length > 0
        ? salespersonData.reduce((sum, sp) => sum + sp.connection_rate, 0) / salespersonData.length
        : 0;
      const avgSchedulingRate = salespersonData.length > 0
        ? salespersonData.reduce((sum, sp) => sum + sp.scheduling_rate, 0) / salespersonData.length
        : 0;

      const topPerformer = salespersonData.sort((a, b) => b.total_activities - a.total_activities)[0];

      const teamSummary: TeamActivitySummary = {
        total_activities: totalActivities,
        total_calls: totalCalls,
        total_emails: totalEmails,
        total_meetings: totalMeetings,
        avg_connection_rate: avgConnectionRate,
        avg_scheduling_rate: avgSchedulingRate,
        top_performer_id: topPerformer?.salesperson_id || null,
        top_performer_name: topPerformer?.salesperson_name || null,
      };

      return {
        salespeople: salespersonData.sort((a, b) => b.total_activities - a.total_activities),
        teamSummary,
      };
    },
    refetchInterval: 60000,
  });
}

export function useActivityTrend(salespersonId?: string, days: number = 30) {
  return useQuery({
    queryKey: ["activity-trend", salespersonId, days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("activities")
        .select("created_at, activity_type")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (salespersonId) {
        query = query.eq("salesperson_id", salespersonId);
      }

      const { data: activities, error } = await query;
      if (error) throw error;

      // Group by date
      const dailyData: Record<string, ActivityTrendData> = {};
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = { date: dateStr, calls: 0, emails: 0, meetings: 0, total: 0 };
      }

      (activities || []).forEach(activity => {
        const dateStr = activity.created_at.split('T')[0];
        if (dailyData[dateStr]) {
          dailyData[dateStr].total++;
          if (activity.activity_type === 'call') dailyData[dateStr].calls++;
          if (activity.activity_type === 'email') dailyData[dateStr].emails++;
          if (activity.activity_type === 'meeting') dailyData[dateStr].meetings++;
        }
      });

      return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}
