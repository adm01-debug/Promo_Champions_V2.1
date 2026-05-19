import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, subDays } from "date-fns";
import { BIGestorData, BIVendedorData } from "@/types/bi";
import * as helpers from "@/utils/bi-helpers";
import { 
  sentimentDistribution, 
  topObjectionsAcross,
  type ConversationAnalysis 
} from "@/components/conversation-intelligence/conversationHelpers";

export const biService = {
  async getGestorData(): Promise<BIGestorData> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    
    const [
      salespeopleRes,
      currentSalesRes,
      previousSalesRes,
      goalsRes,
      pipelineRes,
      activitiesRes,
      last6MonthsSalesRes
    ] = await Promise.all([
      supabase.from("salespeople").select("id, name, avatar_url, role, commission_rate").eq("is_active", true),
      supabase.from("sales").select("id, salesperson_id, amount, status, category, source, created_at").gte("created_at", monthStart.toISOString()).lte("created_at", monthEnd.toISOString()),
      supabase.from("sales").select("salesperson_id, amount, status").eq("status", "completed").gte("created_at", prevMonthStart.toISOString()).lte("created_at", prevMonthEnd.toISOString()),
      supabase.from("sales_goals").select("salesperson_id, goal_amount").eq("month", format(now, "yyyy-MM") + "-01"),
      supabase.from("sales").select("id, salesperson_id, amount, status, created_at").in("status", ["pending", "qualified", "proposal", "negotiation"]),
      supabase.from("activities").select("salesperson_id, activity_type").gte("created_at", monthStart.toISOString()),
      supabase.from("sales").select("amount, status, created_at").eq("status", "completed").gte("created_at", subMonths(now, 6).toISOString())
    ]);

    const salespeople = salespeopleRes.data || [];
    const currentSales = currentSalesRes.data || [];
    const previousSales = previousSalesRes.data || [];
    const goals = goalsRes.data || [];
    const pipelineDeals = pipelineRes.data || [];
    const activities = activitiesRes.data || [];
    const last6MonthsSales = last6MonthsSalesRes.data || [];

    const completedSales = currentSales.filter(s => s.status === "completed");
    const totalTeamRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const previousTeamRevenue = previousSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const teamRevenueChange = previousTeamRevenue > 0 ? ((totalTeamRevenue - previousTeamRevenue) / previousTeamRevenue) * 100 : 0;
    const totalTeamGoal = goals.reduce((sum, g) => sum + Number(g.goal_amount), 0);
    const teamGoalProgress = totalTeamGoal > 0 ? (totalTeamRevenue / totalTeamGoal) * 100 : 0;

    const salespeoplePerformance = helpers.buildSalespeoplePerformance(salespeople, completedSales, currentSales, goals, activities);
    const avgPerformance = salespeoplePerformance.length > 0 ? salespeoplePerformance.reduce((sum, sp) => sum + sp.goalProgress, 0) / salespeoplePerformance.length : 0;
    const topPerformers = salespeoplePerformance.filter(sp => sp.goalProgress >= 100).slice(0, 5);
    const underperformers = salespeoplePerformance.filter(sp => sp.goalProgress < 50 && sp.goalProgress > 0).slice(0, 5);

    const { totalPipelineValue, atRiskDeals, avgDaysInPipeline, dealsByStage } = helpers.computePipelineHealth(pipelineDeals, now);
    const daysRemaining = differenceInDays(monthEnd, now);
    const { weightedForecast, projectedRevenue, confidenceLevel } = helpers.computeForecast(pipelineDeals, totalTeamRevenue, totalTeamGoal, daysRemaining, 30 - daysRemaining);

    return {
      totalTeamRevenue, previousTeamRevenue, teamRevenueChange, totalTeamGoal, teamGoalProgress,
      activeSalespeople: salespeople.length, avgPerformance, totalPipelineValue, totalPipelineDeals: pipelineDeals.length,
      atRiskDeals, avgDaysInPipeline, dealsByStage, weightedForecast, projectedRevenue, confidenceLevel,
      salespeoplePerformance, topPerformers, underperformers,
      revenueByMonth: helpers.buildRevenueByMonth(last6MonthsSales),
      conversionByMonth: helpers.buildRevenueByMonth(last6MonthsSales).map(r => ({ month: r.month, rate: 0 })),
      dealsBySource: helpers.buildDealsBySource(completedSales),
      abcClients: helpers.buildABCAnalysis(salespeoplePerformance),
      stagnantDeals: atRiskDeals, missedGoals: salespeoplePerformance.filter(sp => sp.goalProgress < 80 && sp.goalProgress > 0).length,
      lowActivitySalespeople: salespeoplePerformance.filter(sp => sp.activities < 5).length
    };
  },

  async getVendedorData(salesperson: { id: string; commission_rate: number }): Promise<BIVendedorData> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const today = format(now, "yyyy-MM-dd");
    const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");

    const [
      currentSalesRes, previousSalesRes, allSalesRes, goalRes,
      activitiesRes, activityGoalsRes, achievementsRes,
      allSalespeopleRes, pipelineRes, convRes, rankingDataRes
    ] = await Promise.all([
      supabase.from("sales").select("id, amount, category, status, created_at").eq("salesperson_id", salesperson.id).eq("status", "completed").gte("created_at", monthStart.toISOString()).lte("created_at", monthEnd.toISOString()),
      supabase.from("sales").select("amount").eq("salesperson_id", salesperson.id).eq("status", "completed").gte("created_at", prevMonthStart.toISOString()).lte("created_at", prevMonthEnd.toISOString()),
      supabase.from("sales").select("id, status, created_at").eq("salesperson_id", salesperson.id).gte("created_at", monthStart.toISOString()).lte("created_at", monthEnd.toISOString()),
      supabase.from("sales_goals").select("goal_amount").eq("salesperson_id", salesperson.id).eq("month", format(now, "yyyy-MM") + "-01").maybeSingle(),
      supabase.from("activities").select("activity_type, created_at").eq("salesperson_id", salesperson.id).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }),
      supabase.from("activity_goals").select("*").eq("salesperson_id", salesperson.id).maybeSingle(),
      supabase.from("achievements").select("achievement_type, achievement_date").eq("salesperson_id", salesperson.id).order("achievement_date", { ascending: false }).limit(10),
      supabase.from("salespeople").select("id").eq("is_active", true),
      supabase.from("sales").select("id, amount, status, created_at").eq("salesperson_id", salesperson.id).in("status", ["pending", "qualified", "proposal", "negotiation"]),
      supabase.from("conversation_analyses").select("*").eq("analyzed_by", salesperson.id).gte("created_at", monthStart.toISOString()).order("created_at", { ascending: false }).limit(100),
      supabase.from("sales").select("salesperson_id, amount").eq("status", "completed").gte("created_at", monthStart.toISOString()).lte("created_at", monthEnd.toISOString())
    ]);

    const currentSales = currentSalesRes.data || [];
    const previousSales = previousSalesRes.data || [];
    const allSales = allSalesRes.data || [];
    const goal = goalRes.data?.goal_amount || 0;
    const activities = activitiesRes.data || [];
    const activityGoals = activityGoalsRes.data;
    const achievements = achievementsRes.data || [];
    const allSalespeople = allSalespeopleRes.data || [];
    const pipelineDeals = pipelineRes.data || [];
    const convAnalyses = (convRes.data || []) as unknown as ConversationAnalysis[];

    const totalRevenue = currentSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const previousRevenue = previousSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const completedDeals = currentSales.length;
    const daysRemaining = differenceInDays(monthEnd, now);

    const { pipelineValue, dealsByStage, avgDaysInPipeline } = helpers.computePipelineByStage(pipelineDeals, now);
    const currentRank = helpers.computeRanking(rankingDataRes.data || [], salesperson.id, allSalespeople.length);
    const activitiesByType = helpers.computeActivitiesByType(activities);
    
    const todayActivities = activities.filter(a => a.created_at?.slice(0, 10) === today).length;
    const totalGoalToday = activityGoals ? activityGoals.calls_goal + activityGoals.emails_goal + activityGoals.meetings_goal + activityGoals.linkedin_goal + activityGoals.whatsapp_goal : 0;

    const { data: streakAchievements } = await supabase.from("achievements").select("achievement_date").eq("salesperson_id", salesperson.id).eq("achievement_type", "daily_goal").order("achievement_date", { ascending: false });
    const { currentStreak, bestStreak } = helpers.computeStreak((streakAchievements || []).map(a => a.achievement_date), now);

    return {
      totalRevenue, previousRevenue, revenueChange: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      totalDeals: allSales.length, completedDeals, conversionRate: allSales.length > 0 ? (completedDeals / allSales.length) * 100 : 0,
      avgTicket: completedDeals > 0 ? totalRevenue / completedDeals : 0,
      currentGoal: goal, goalProgress: goal > 0 ? (totalRevenue / goal) * 100 : 0,
      daysRemaining, dailyRequired: goal > 0 && daysRemaining > 0 ? Math.max(0, (goal - totalRevenue) / daysRemaining) : 0,
      commission: totalRevenue * (salesperson.commission_rate / 100), commissionRate: salesperson.commission_rate,
      pipelineValue, pipelineDeals: pipelineDeals.length, dealsByStage, avgDaysInPipeline,
      currentRank, totalSalespeople: allSalespeople.length, totalActivities: activities.length,
      activitiesByType, activityGoalProgress: totalGoalToday > 0 ? (todayActivities / totalGoalToday) * 100 : 0,
      currentStreak, bestStreak, totalAchievements: achievements.length,
      recentAchievements: achievements.slice(0, 5).map(a => ({ type: a.achievement_type, date: a.achievement_date })),
      salesByDay: helpers.buildSalesByDay(currentSales),
      salesByCategory: helpers.buildSalesByCategory(currentSales),
      conversationInsights: {
        total: convAnalyses.length,
        sentiment: sentimentDistribution(convAnalyses),
        topObjections: topObjectionsAcross(convAnalyses, 6),
        buyingSignalsTotal: convAnalyses.reduce((acc, i) => acc + (i.buying_signals?.length ?? 0), 0),
        riskSignalsTotal: convAnalyses.reduce((acc, i) => acc + (i.risk_signals?.length ?? 0), 0),
      }
    };
  }
};
