import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, subDays } from "date-fns";
import {
  computeRanking, computeActivitiesByType, computeStreak,
  computePipelineByStage, buildSalesByDay, buildSalesByCategory,
} from "./biVendedorHelpers";
import { 
  sentimentDistribution, 
  topObjectionsAcross,
  type ConversationAnalysis 
} from "@/components/conversation-intelligence/conversationHelpers";

export interface BIVendedorData {
  // Performance metrics
  totalRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  totalDeals: number;
  completedDeals: number;
  conversionRate: number;
  avgTicket: number;
  
  // Goals
  currentGoal: number;
  goalProgress: number;
  daysRemaining: number;
  dailyRequired: number;
  commission: number;
  commissionRate: number;
  
  // Pipeline
  pipelineValue: number;
  pipelineDeals: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  avgDaysInPipeline: number;
  
  // Ranking
  currentRank: number;
  totalSalespeople: number;
  
  // Activities
  totalActivities: number;
  activitiesByType: { type: string; count: number }[];
  activityGoalProgress: number;
  currentStreak: number;
  bestStreak: number;
  
  // Achievements
  totalAchievements: number;
  recentAchievements: { type: string; date: string }[];
  
  // Recent data for charts
  salesByDay: { day: string; value: number }[];
  salesByCategory: { category: string; value: number }[];

  // Conversation Intelligence
  conversationInsights: {
    total: number;
    sentiment: { sentiment: string; label: string; value: number; color: string }[];
    topObjections: { label: string; count: number }[];
    buyingSignalsTotal: number;
    riskSignalsTotal: number;
  };
}

export function useBIVendedor() {
  const { salesperson } = useAuth();
  
  return useQuery({
    queryKey: ["bi-vendedor", salesperson?.id],
    queryFn: async (): Promise<BIVendedorData> => {
      if (!salesperson?.id) throw new Error("Vendedor não encontrado");
      
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      const today = format(now, "yyyy-MM-dd");
      const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");
      
      // Fetch all data in parallel
      const [
        currentSalesRes,
        previousSalesRes,
        allSalesRes,
        goalRes,
        activitiesRes,
        activityGoalsRes,
        achievementsRes,
        allSalespeopleRes,
        pipelineRes,
        convRes
      ] = await Promise.all([
        // Current month completed sales
        supabase
          .from("sales")
          .select("id, amount, category, status, created_at")
          .eq("salesperson_id", salesperson.id)
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        
        // Previous month completed sales
        supabase
          .from("sales")
          .select("amount")
          .eq("salesperson_id", salesperson.id)
          .eq("status", "completed")
          .gte("created_at", prevMonthStart.toISOString())
          .lte("created_at", prevMonthEnd.toISOString()),
        
        // All current month sales (for conversion rate)
        supabase
          .from("sales")
          .select("id, status, created_at")
          .eq("salesperson_id", salesperson.id)
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        
        // Current month goal
        supabase
          .from("sales_goals")
          .select("goal_amount")
          .eq("salesperson_id", salesperson.id)
          .eq("month", format(now, "yyyy-MM") + "-01")
          .maybeSingle(),
        
        // Activities last 30 days
        supabase
          .from("activities")
          .select("activity_type, created_at")
          .eq("salesperson_id", salesperson.id)
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: false }),
        
        // Activity goals
        supabase
          .from("activity_goals")
          .select("*")
          .eq("salesperson_id", salesperson.id)
          .maybeSingle(),
        
        // Recent achievements
        supabase
          .from("achievements")
          .select("achievement_type, achievement_date")
          .eq("salesperson_id", salesperson.id)
          .order("achievement_date", { ascending: false })
          .limit(10),
        
        // All salespeople for ranking
        supabase
          .from("salespeople")
          .select("id")
          .eq("is_active", true),
        
        // Pipeline deals (pending)
        supabase
          .from("sales")
          .select("id, amount, status, created_at")
          .eq("salesperson_id", salesperson.id)
          .in("status", ["pending", "qualified", "proposal", "negotiation"]),

        // Conversation Analyses
        supabase
          .from("conversation_analyses")
          .select("*")
          .eq("analyzed_by", salesperson.id)
          .gte("created_at", monthStart.toISOString())
          .order("created_at", { ascending: false })
          .limit(100)
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
      
      // Calculate revenue metrics
      const totalRevenue = currentSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const previousRevenue = previousSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      // Calculate conversion
      const completedDeals = currentSales.length;
      const totalDeals = allSales.length;
      const conversionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;
      const avgTicket = completedDeals > 0 ? totalRevenue / completedDeals : 0;
      
      // Goal progress
      const goalProgress = goal > 0 ? (totalRevenue / goal) * 100 : 0;
      const daysRemaining = differenceInDays(monthEnd, now);
      const dailyRequired = goal > 0 && daysRemaining > 0 ? Math.max(0, (goal - totalRevenue) / daysRemaining) : 0;
      const commission = totalRevenue * (salesperson.commission_rate / 100);
      
      // Pipeline
      const { pipelineValue, dealsByStage, avgDaysInPipeline } = computePipelineByStage(pipelineDeals, now);
      
      // Get ranking
      const { data: rankingData } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());
      
      const currentRank = computeRanking(rankingData || [], salesperson.id, allSalespeople.length);
      
      // Activities by type
      const activitiesByType = computeActivitiesByType(activities);
      
      // Activity goal progress
      const todayActivities = activities.filter(a => 
        a.created_at.slice(0, 10) === today
      ).length;
      
      const totalGoalToday = activityGoals 
        ? activityGoals.calls_goal + activityGoals.emails_goal + activityGoals.meetings_goal + 
          activityGoals.linkedin_goal + activityGoals.whatsapp_goal 
        : 0;
      
      const activityGoalProgress = totalGoalToday > 0 ? (todayActivities / totalGoalToday) * 100 : 0;
      
      // Calculate streak
      const { data: streakAchievements } = await supabase
        .from("achievements")
        .select("achievement_date")
        .eq("salesperson_id", salesperson.id)
        .eq("achievement_type", "daily_goal")
        .order("achievement_date", { ascending: false });
      
      const achievementDates = (streakAchievements || []).map(a => a.achievement_date);
      const { currentStreak, bestStreak } = computeStreak(achievementDates, now);
      
      // Sales by day/category for charts
      const salesByDay = buildSalesByDay(currentSales);
      const salesByCategory = buildSalesByCategory(currentSales);
      
      return {
        totalRevenue,
        previousRevenue,
        revenueChange,
        totalDeals,
        completedDeals,
        conversionRate,
        avgTicket,
        currentGoal: goal,
        goalProgress,
        daysRemaining,
        dailyRequired,
        commission,
        commissionRate: salesperson.commission_rate,
        pipelineValue,
        pipelineDeals: pipelineDeals.length,
        dealsByStage,
        avgDaysInPipeline,
        currentRank,
        totalSalespeople: allSalespeople.length,
        totalActivities: activities.length,
        activitiesByType,
        activityGoalProgress,
        currentStreak,
        bestStreak,
        totalAchievements: achievements.length,
        recentAchievements: achievements.slice(0, 5).map(a => ({ type: a.achievement_type, date: a.achievement_date })),
        salesByDay,
        salesByCategory
      };
    },
    enabled: !!salesperson?.id,
    staleTime: 60000,
    refetchInterval: 60000
  });
}
