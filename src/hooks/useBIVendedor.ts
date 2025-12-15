import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, subMonths, format, parseISO, differenceInDays, subDays } from "date-fns";

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
        pipelineRes
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
          .in("status", ["pending", "qualified", "proposal", "negotiation"])
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
      const pipelineValue = pipelineDeals.reduce((sum, s) => sum + Number(s.amount), 0);
      const dealsByStage = ["pending", "qualified", "proposal", "negotiation"].map(stage => ({
        stage,
        count: pipelineDeals.filter(d => d.status === stage).length,
        value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0)
      }));
      
      const avgDaysInPipeline = pipelineDeals.length > 0 
        ? pipelineDeals.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipelineDeals.length 
        : 0;
      
      // Get ranking
      const { data: rankingData } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());
      
      const salesBySalesperson: Record<string, number> = {};
      (rankingData || []).forEach(sale => {
        if (sale.salesperson_id) {
          salesBySalesperson[sale.salesperson_id] = (salesBySalesperson[sale.salesperson_id] || 0) + Number(sale.amount);
        }
      });
      
      const rankings = Object.entries(salesBySalesperson)
        .sort((a, b) => b[1] - a[1])
        .map(([id], index) => ({ id, rank: index + 1 }));
      
      const currentRank = rankings.find(r => r.id === salesperson.id)?.rank || allSalespeople.length;
      
      // Activities by type
      const activityTypeCounts: Record<string, number> = {};
      activities.forEach(a => {
        activityTypeCounts[a.activity_type] = (activityTypeCounts[a.activity_type] || 0) + 1;
      });
      const activitiesByType = Object.entries(activityTypeCounts).map(([type, count]) => ({ type, count }));
      
      // Activity goal progress
      const todayActivities = activities.filter(a => 
        format(parseISO(a.created_at), "yyyy-MM-dd") === today
      ).length;
      
      const totalGoalToday = activityGoals 
        ? activityGoals.calls_goal + activityGoals.emails_goal + activityGoals.meetings_goal + 
          activityGoals.linkedin_goal + activityGoals.whatsapp_goal 
        : 0;
      
      const activityGoalProgress = totalGoalToday > 0 ? (todayActivities / totalGoalToday) * 100 : 0;
      
      // Calculate streak (simplified)
      const { data: streakAchievements } = await supabase
        .from("achievements")
        .select("achievement_date")
        .eq("salesperson_id", salesperson.id)
        .eq("achievement_type", "daily_goal")
        .order("achievement_date", { ascending: false });
      
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      const achievementDates = (streakAchievements || []).map(a => a.achievement_date);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = format(subDays(now, i), "yyyy-MM-dd");
        if (achievementDates.includes(checkDate)) {
          if (i === 0 || tempStreak > 0) {
            tempStreak++;
            if (i < 7) currentStreak = tempStreak;
          }
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      
      // Sales by day for chart
      const salesByDayMap: Record<string, number> = {};
      currentSales.forEach(sale => {
        const day = format(parseISO(sale.created_at), "dd/MM");
        salesByDayMap[day] = (salesByDayMap[day] || 0) + Number(sale.amount);
      });
      const salesByDay = Object.entries(salesByDayMap).map(([day, value]) => ({ day, value }));
      
      // Sales by category
      const salesByCategoryMap: Record<string, number> = {};
      currentSales.forEach(sale => {
        salesByCategoryMap[sale.category] = (salesByCategoryMap[sale.category] || 0) + Number(sale.amount);
      });
      const salesByCategory = Object.entries(salesByCategoryMap).map(([category, value]) => ({ category, value }));
      
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
