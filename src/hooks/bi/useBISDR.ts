import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange, getPreviousPeriodRange, getSamePeriodLastYear } from "@/hooks/bi/useBIFilters";
import { differenceInDays } from "date-fns";
import { transformBISDRData } from "@/hooks/bi/useBISDRTransformers";

export interface BISDRData {
  totalLeadsGenerated: number;
  qualifiedLeads: number;
  qualificationRate: number;
  avgQualificationTime: number;
  totalActivities: number;
  activitiesByType: { type: string; count: number; successRate: number }[];
  avgActivitiesPerDay: number;
  connectRate: number;
  bookingRate: number;
  totalCalls: number;
  totalEmails: number;
  totalMeetings: number;
  totalLinkedIn: number;
  totalWhatsApp: number;
  pipelineValue: number;
  pipelineCount: number;
  pipelineByStage: { stage: string; count: number; value: number }[];
  previousPeriod: { totalLeads: number; qualifiedLeads: number; totalActivities: number };
  sameLastYear: { totalLeads: number; qualifiedLeads: number; totalActivities: number };
  leadGoal: number;
  activityGoal: number;
  goalProgress: number;
  projectedLeads: number;
  dailyLeadsNeeded: number;
  currentRank: number;
  totalSDRs: number;
  topProspects: { name: string; company: string; value: number; daysInPipeline: number }[];
  recentActivities: { type: string; clientName: string; date: string; outcome: string }[];
  leadsByDay: { day: string; generated: number; qualified: number }[];
  activitiesByDay: { day: string; count: number }[];
  conversionFunnel: { stage: string; count: number; percentage: number }[];
  leadsBySource: { source: string; count: number; qualificationRate: number }[];
}

interface UseBISDROptions {
  dateRange: DateRange;
  salespersonId?: string;
}

export function useBISDR({ dateRange, salespersonId }: UseBISDROptions) {
  const { salesperson } = useAuth();
  const targetSalespersonId = salespersonId || salesperson?.id;

  return useQuery({
    queryKey: ["bi-sdr", targetSalespersonId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<BISDRData> => {
      if (!targetSalespersonId) throw new Error("SDR não encontrado");

      const previousRange = getPreviousPeriodRange(dateRange);
      const lastYearRange = getSamePeriodLastYear(dateRange);

      const [
        currentSalesRes, previousSalesRes, lastYearSalesRes,
        activitiesRes, previousActivitiesRes, lastYearActivitiesRes,
        activityGoalsRes, allSDRsRes, recentActivitiesRes
      ] = await Promise.all([
        supabase.from("sales").select("id, amount, status, source, client_name, category, created_at, updated_at")
          .eq("salesperson_id", targetSalespersonId).gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString()),
        supabase.from("sales").select("id, status").eq("salesperson_id", targetSalespersonId)
          .gte("created_at", previousRange.start.toISOString()).lte("created_at", previousRange.end.toISOString()),
        supabase.from("sales").select("id, status").eq("salesperson_id", targetSalespersonId)
          .gte("created_at", lastYearRange.start.toISOString()).lte("created_at", lastYearRange.end.toISOString()),
        supabase.from("activities").select("id, activity_type, outcome, contact_name, created_at")
          .eq("salesperson_id", targetSalespersonId).gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString()),
        supabase.from("activities").select("id").eq("salesperson_id", targetSalespersonId)
          .gte("created_at", previousRange.start.toISOString()).lte("created_at", previousRange.end.toISOString()),
        supabase.from("activities").select("id").eq("salesperson_id", targetSalespersonId)
          .gte("created_at", lastYearRange.start.toISOString()).lte("created_at", lastYearRange.end.toISOString()),
        supabase.from("activity_goals").select("*").eq("salesperson_id", targetSalespersonId).maybeSingle(),
        supabase.from("salespeople").select("id, role").eq("is_active", true).in("role", ["sdr", "hybrid"]),
        supabase.from("activities").select("activity_type, contact_name, outcome, created_at")
          .eq("salesperson_id", targetSalespersonId).order("created_at", { ascending: false }).limit(10)
      ]);

      const allSDRs = allSDRsRes.data || [];
      const { data: allSDRSales } = await supabase.from("sales").select("salesperson_id")
        .gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString())
        .in("salesperson_id", allSDRs.map(s => s.id));

      const sdrSalesCounts: Record<string, number> = {};
      (allSDRSales || []).forEach(s => {
        if (s.salesperson_id) sdrSalesCounts[s.salesperson_id] = (sdrSalesCounts[s.salesperson_id] || 0) + 1;
      });

      const daysInPeriod = Math.max(1, differenceInDays(dateRange.end, dateRange.start) + 1);

      return transformBISDRData({
        currentSales: currentSalesRes.data || [],
        previousSales: previousSalesRes.data || [],
        lastYearSales: lastYearSalesRes.data || [],
        activities: activitiesRes.data || [],
        previousActivities: previousActivitiesRes.data || [],
        lastYearActivities: lastYearActivitiesRes.data || [],
        activityGoals: activityGoalsRes.data,
        allSDRs,
        recentActivitiesData: recentActivitiesRes.data || [],
        daysInPeriod,
        targetSalespersonId,
        sdrSalesCounts
      });
    },
    enabled: !!targetSalespersonId,
    staleTime: 60000,
    refetchInterval: 60000
  });
}
