import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange, getPreviousPeriodRange, getSamePeriodLastYear } from "./useBIFilters";
import { differenceInDays, format, parseISO, differenceInBusinessDays, endOfMonth, startOfMonth } from "date-fns";

export interface BISDRData {
  // Core metrics
  totalLeadsGenerated: number;
  qualifiedLeads: number;
  qualificationRate: number;
  avgQualificationTime: number;
  
  // Activities
  totalActivities: number;
  activitiesByType: { type: string; count: number; successRate: number }[];
  avgActivitiesPerDay: number;
  totalCalls: number;
  totalEmails: number;
  totalMeetings: number;
  
  // Pipeline SDR (leads in initial stages)
  pipelineValue: number;
  pipelineCount: number;
  pipelineByStage: { stage: string; count: number; value: number }[];
  
  // Comparisons
  previousPeriod: {
    totalLeads: number;
    qualifiedLeads: number;
    totalActivities: number;
  };
  sameLastYear: {
    totalLeads: number;
    qualifiedLeads: number;
    totalActivities: number;
  };
  
  // Goals & Projections
  leadGoal: number;
  activityGoal: number;
  goalProgress: number;
  projectedLeads: number;
  dailyLeadsNeeded: number;
  
  // Rankings
  currentRank: number;
  totalSDRs: number;
  
  // Client insights
  topProspects: { name: string; company: string; value: number; daysInPipeline: number }[];
  recentActivities: { type: string; clientName: string; date: string; outcome: string }[];
  
  // Charts data
  leadsByDay: { day: string; generated: number; qualified: number }[];
  activitiesByDay: { day: string; count: number }[];
  conversionFunnel: { stage: string; count: number; percentage: number }[];
  leadsBySource: { source: string; count: number; qualificationRate: number }[];
}

interface UseBISDROptions {
  dateRange: DateRange;
  salespersonId?: string; // Optional for manager view
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
      const now = new Date();

      // Fetch all data in parallel
      const [
        currentSalesRes,
        previousSalesRes,
        lastYearSalesRes,
        activitiesRes,
        previousActivitiesRes,
        lastYearActivitiesRes,
        activityGoalsRes,
        allSDRsRes,
        recentActivitiesRes
      ] = await Promise.all([
        // Current period sales/leads
        supabase
          .from("sales")
          .select("id, amount, status, source, client_name, category, created_at, updated_at")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", dateRange.start.toISOString())
          .lte("created_at", dateRange.end.toISOString()),

        // Previous period sales
        supabase
          .from("sales")
          .select("id, status")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", previousRange.start.toISOString())
          .lte("created_at", previousRange.end.toISOString()),

        // Same period last year
        supabase
          .from("sales")
          .select("id, status")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", lastYearRange.start.toISOString())
          .lte("created_at", lastYearRange.end.toISOString()),

        // Current activities
        supabase
          .from("activities")
          .select("id, activity_type, outcome, contact_name, created_at")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", dateRange.start.toISOString())
          .lte("created_at", dateRange.end.toISOString()),

        // Previous activities
        supabase
          .from("activities")
          .select("id")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", previousRange.start.toISOString())
          .lte("created_at", previousRange.end.toISOString()),

        // Last year activities
        supabase
          .from("activities")
          .select("id")
          .eq("salesperson_id", targetSalespersonId)
          .gte("created_at", lastYearRange.start.toISOString())
          .lte("created_at", lastYearRange.end.toISOString()),

        // Activity goals
        supabase
          .from("activity_goals")
          .select("*")
          .eq("salesperson_id", targetSalespersonId)
          .maybeSingle(),

        // All SDRs for ranking
        supabase
          .from("salespeople")
          .select("id, role")
          .eq("is_active", true)
          .in("role", ["sdr", "hybrid"]),

        // Recent activities for list
        supabase
          .from("activities")
          .select("activity_type, contact_name, outcome, created_at")
          .eq("salesperson_id", targetSalespersonId)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      const currentSales = currentSalesRes.data || [];
      const previousSales = previousSalesRes.data || [];
      const lastYearSales = lastYearSalesRes.data || [];
      const activities = activitiesRes.data || [];
      const previousActivities = previousActivitiesRes.data || [];
      const lastYearActivities = lastYearActivitiesRes.data || [];
      const activityGoals = activityGoalsRes.data;
      const allSDRs = allSDRsRes.data || [];
      const recentActivitiesData = recentActivitiesRes.data || [];

      // Calculate core metrics
      const totalLeadsGenerated = currentSales.length;
      const qualifiedLeads = currentSales.filter(s => 
        ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
      ).length;
      const qualificationRate = totalLeadsGenerated > 0 
        ? (qualifiedLeads / totalLeadsGenerated) * 100 
        : 0;

      // Avg qualification time (days from pending to qualified)
      const qualifiedSales = currentSales.filter(s => s.status !== "pending" && s.status !== "lost");
      const avgQualificationTime = qualifiedSales.length > 0
        ? qualifiedSales.reduce((sum, s) => {
            return sum + differenceInDays(parseISO(s.updated_at), parseISO(s.created_at));
          }, 0) / qualifiedSales.length
        : 0;

      // Activities by type
      const activityTypeCounts: Record<string, { count: number; success: number }> = {};
      activities.forEach(a => {
        if (!activityTypeCounts[a.activity_type]) {
          activityTypeCounts[a.activity_type] = { count: 0, success: 0 };
        }
        activityTypeCounts[a.activity_type].count++;
        if (a.outcome === "qualified" || a.outcome === "scheduled" || a.outcome === "connected") {
          activityTypeCounts[a.activity_type].success++;
        }
      });

      const activitiesByType = Object.entries(activityTypeCounts).map(([type, data]) => ({
        type,
        count: data.count,
        successRate: data.count > 0 ? (data.success / data.count) * 100 : 0
      }));

      // Days in period for averages
      const daysInPeriod = Math.max(1, differenceInDays(dateRange.end, dateRange.start) + 1);
      const avgActivitiesPerDay = activities.length / daysInPeriod;

      // Activity counts by type
      const totalCalls = activities.filter(a => a.activity_type === "call").length;
      const totalEmails = activities.filter(a => a.activity_type === "email").length;
      const totalMeetings = activities.filter(a => a.activity_type === "meeting").length;

      // Pipeline (SDR focuses on early stages)
      const pipelineDeals = currentSales.filter(s => 
        ["pending", "qualified"].includes(s.status)
      );
      const pipelineValue = pipelineDeals.reduce((sum, s) => sum + Number(s.amount), 0);
      const pipelineByStage = ["pending", "qualified"].map(stage => ({
        stage,
        count: pipelineDeals.filter(d => d.status === stage).length,
        value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0)
      }));

      // Previous period comparisons
      const previousPeriod = {
        totalLeads: previousSales.length,
        qualifiedLeads: previousSales.filter(s => s.status !== "pending" && s.status !== "lost").length,
        totalActivities: previousActivities.length
      };

      const sameLastYear = {
        totalLeads: lastYearSales.length,
        qualifiedLeads: lastYearSales.filter(s => s.status !== "pending" && s.status !== "lost").length,
        totalActivities: lastYearActivities.length
      };

      // Goals and projections
      const totalActivityGoal = activityGoals
        ? activityGoals.calls_goal + activityGoals.emails_goal + activityGoals.meetings_goal +
          activityGoals.linkedin_goal + activityGoals.whatsapp_goal
        : 0;
      
      const monthEnd = endOfMonth(now);
      const monthStart = startOfMonth(now);
      const daysRemainingInMonth = differenceInBusinessDays(monthEnd, now);
      const daysElapsedInMonth = differenceInBusinessDays(now, monthStart);
      
      // Lead goal estimation (based on activity goals)
      const leadGoal = totalActivityGoal * 0.15; // Assume 15% conversion from activities to leads
      const activityGoal = totalActivityGoal * daysInPeriod;
      const goalProgress = activityGoal > 0 ? (activities.length / activityGoal) * 100 : 0;

      // Projection: if current rate continues
      const dailyLeadRate = daysElapsedInMonth > 0 ? totalLeadsGenerated / daysElapsedInMonth : 0;
      const projectedLeads = totalLeadsGenerated + (dailyLeadRate * daysRemainingInMonth);
      const dailyLeadsNeeded = daysRemainingInMonth > 0 
        ? Math.max(0, (leadGoal - totalLeadsGenerated) / daysRemainingInMonth) 
        : 0;

      // SDR Ranking
      const { data: allSDRSales } = await supabase
        .from("sales")
        .select("salesperson_id")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .in("salesperson_id", allSDRs.map(s => s.id));

      const sdrSalesCounts: Record<string, number> = {};
      (allSDRSales || []).forEach(s => {
        if (s.salesperson_id) {
          sdrSalesCounts[s.salesperson_id] = (sdrSalesCounts[s.salesperson_id] || 0) + 1;
        }
      });

      const rankings = Object.entries(sdrSalesCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([id], index) => ({ id, rank: index + 1 }));

      const currentRank = rankings.find(r => r.id === targetSalespersonId)?.rank || allSDRs.length;

      // Top prospects (high value leads in pipeline)
      const topProspects = pipelineDeals
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5)
        .map(s => ({
          name: s.client_name,
          company: s.category,
          value: Number(s.amount),
          daysInPipeline: differenceInDays(now, parseISO(s.created_at))
        }));

      // Recent activities for display
      const recentActivities = recentActivitiesData.map(a => ({
        type: a.activity_type,
        clientName: a.contact_name || "N/A",
        date: format(parseISO(a.created_at), "dd/MM HH:mm"),
        outcome: a.outcome
      }));

      // Charts: Leads by day
      const leadsByDayMap: Record<string, { generated: number; qualified: number }> = {};
      currentSales.forEach(sale => {
        const day = format(parseISO(sale.created_at), "dd/MM");
        if (!leadsByDayMap[day]) {
          leadsByDayMap[day] = { generated: 0, qualified: 0 };
        }
        leadsByDayMap[day].generated++;
        if (sale.status !== "pending" && sale.status !== "lost") {
          leadsByDayMap[day].qualified++;
        }
      });
      const leadsByDay = Object.entries(leadsByDayMap).map(([day, data]) => ({
        day,
        ...data
      }));

      // Activities by day
      const activitiesByDayMap: Record<string, number> = {};
      activities.forEach(a => {
        const day = format(parseISO(a.created_at), "dd/MM");
        activitiesByDayMap[day] = (activitiesByDayMap[day] || 0) + 1;
      });
      const activitiesByDay = Object.entries(activitiesByDayMap).map(([day, count]) => ({
        day,
        count
      }));

      // Conversion funnel
      const conversionFunnel = [
        { stage: "Leads Gerados", count: totalLeadsGenerated, percentage: 100 },
        { stage: "Qualificados", count: qualifiedLeads, percentage: qualificationRate },
        { stage: "Proposta", count: currentSales.filter(s => ["proposal", "negotiation", "completed"].includes(s.status)).length, percentage: 0 },
        { stage: "Fechados", count: currentSales.filter(s => s.status === "completed").length, percentage: 0 }
      ];
      conversionFunnel.forEach((stage, i) => {
        if (i > 0) {
          stage.percentage = totalLeadsGenerated > 0 ? (stage.count / totalLeadsGenerated) * 100 : 0;
        }
      });

      // Leads by source
      const leadsBySourceMap: Record<string, { count: number; qualified: number }> = {};
      currentSales.forEach(sale => {
        const source = sale.source || "other";
        if (!leadsBySourceMap[source]) {
          leadsBySourceMap[source] = { count: 0, qualified: 0 };
        }
        leadsBySourceMap[source].count++;
        if (sale.status !== "pending" && sale.status !== "lost") {
          leadsBySourceMap[source].qualified++;
        }
      });
      const leadsBySource = Object.entries(leadsBySourceMap).map(([source, data]) => ({
        source,
        count: data.count,
        qualificationRate: data.count > 0 ? (data.qualified / data.count) * 100 : 0
      }));

      return {
        totalLeadsGenerated,
        qualifiedLeads,
        qualificationRate,
        avgQualificationTime,
        totalActivities: activities.length,
        activitiesByType,
        avgActivitiesPerDay,
        totalCalls,
        totalEmails,
        totalMeetings,
        pipelineValue,
        pipelineCount: pipelineDeals.length,
        pipelineByStage,
        previousPeriod,
        sameLastYear,
        leadGoal,
        activityGoal,
        goalProgress,
        projectedLeads,
        dailyLeadsNeeded,
        currentRank,
        totalSDRs: allSDRs.length,
        topProspects,
        recentActivities,
        leadsByDay,
        activitiesByDay,
        conversionFunnel,
        leadsBySource
      };
    },
    enabled: !!targetSalespersonId,
    staleTime: 60000,
    refetchInterval: 60000
  });
}
