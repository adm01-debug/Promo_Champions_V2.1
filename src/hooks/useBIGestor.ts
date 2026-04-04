import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from "date-fns";
import {
  buildSalespeoplePerformance,
  computePipelineHealth,
  computeForecast,
  buildRevenueByMonth,
  buildDealsBySource,
  buildABCAnalysis,
} from "./biGestorHelpers";

export interface SalespersonPerformanceData {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  revenue: number;
  deals: number;
  conversionRate: number;
  goalProgress: number;
  avgTicket: number;
  activities: number;
}

export interface BIGestorData {
  // Team overview
  totalTeamRevenue: number;
  previousTeamRevenue: number;
  teamRevenueChange: number;
  totalTeamGoal: number;
  teamGoalProgress: number;
  activeSalespeople: number;
  avgPerformance: number;
  
  // Pipeline health
  totalPipelineValue: number;
  totalPipelineDeals: number;
  atRiskDeals: number;
  avgDaysInPipeline: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  
  // Forecast
  weightedForecast: number;
  projectedRevenue: number;
  confidenceLevel: number;
  
  // Team comparison
  salespeoplePerformance: SalespersonPerformanceData[];
  topPerformers: SalespersonPerformanceData[];
  underperformers: SalespersonPerformanceData[];
  
  // Trends
  revenueByMonth: { month: string; value: number }[];
  conversionByMonth: { month: string; rate: number }[];
  dealsBySource: { source: string; count: number; value: number }[];
  
  // ABC Analysis
  abcClients: { classification: string; count: number; revenue: number; percentage: number }[];
  
  // Alerts
  stagnantDeals: number;
  missedGoals: number;
  lowActivitySalespeople: number;
}

export function useBIGestor() {
  return useQuery({
    queryKey: ["bi-gestor"],
    queryFn: async (): Promise<BIGestorData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      
      // Fetch all data in parallel
      const [
        salespeopleRes,
        currentSalesRes,
        previousSalesRes,
        goalsRes,
        pipelineRes,
        activitiesRes,
        last6MonthsSalesRes
      ] = await Promise.all([
        // All active salespeople
        supabase
          .from("salespeople")
          .select("id, name, avatar_url, role, commission_rate")
          .eq("is_active", true),
        
        // Current month sales
        supabase
          .from("sales")
          .select("id, salesperson_id, amount, status, category, source, created_at")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        
        // Previous month sales
        supabase
          .from("sales")
          .select("salesperson_id, amount, status")
          .eq("status", "completed")
          .gte("created_at", prevMonthStart.toISOString())
          .lte("created_at", prevMonthEnd.toISOString()),
        
        // Current month goals
        supabase
          .from("sales_goals")
          .select("salesperson_id, goal_amount")
          .eq("month", format(now, "yyyy-MM") + "-01"),
        
        // Pipeline deals
        supabase
          .from("sales")
          .select("id, salesperson_id, amount, status, created_at")
          .in("status", ["pending", "qualified", "proposal", "negotiation"]),
        
        // Activities this month
        supabase
          .from("activities")
          .select("salesperson_id, activity_type")
          .gte("created_at", monthStart.toISOString()),
        
        // Last 6 months sales for trends
        supabase
          .from("sales")
          .select("amount, status, created_at")
          .eq("status", "completed")
          .gte("created_at", subMonths(now, 6).toISOString())
      ]);
      
      const salespeople = salespeopleRes.data || [];
      const currentSales = currentSalesRes.data || [];
      const previousSales = previousSalesRes.data || [];
      const goals = goalsRes.data || [];
      const pipelineDeals = pipelineRes.data || [];
      const activities = activitiesRes.data || [];
      const last6MonthsSales = last6MonthsSalesRes.data || [];
      
      // Calculate team revenue
      const completedSales = currentSales.filter(s => s.status === "completed");
      const totalTeamRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const previousTeamRevenue = previousSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const teamRevenueChange = previousTeamRevenue > 0 
        ? ((totalTeamRevenue - previousTeamRevenue) / previousTeamRevenue) * 100 
        : 0;
      
      const totalTeamGoal = goals.reduce((sum, g) => sum + Number(g.goal_amount), 0);
      const teamGoalProgress = totalTeamGoal > 0 ? (totalTeamRevenue / totalTeamGoal) * 100 : 0;
      
      // Per-salesperson performance
      const salespeoplePerformance = buildSalespeoplePerformance(
        salespeople, completedSales, currentSales, goals, activities
      );
      
      const avgPerformance = salespeoplePerformance.length > 0
        ? salespeoplePerformance.reduce((sum, sp) => sum + sp.goalProgress, 0) / salespeoplePerformance.length
        : 0;
      
      const topPerformers = salespeoplePerformance.filter(sp => sp.goalProgress >= 100).slice(0, 5);
      const underperformers = salespeoplePerformance.filter(sp => sp.goalProgress < 50 && sp.goalProgress > 0).slice(0, 5);
      
      // Pipeline health
      const { totalPipelineValue, atRiskDeals, avgDaysInPipeline, dealsByStage } = 
        computePipelineHealth(pipelineDeals, now);
      
      // Forecast
      const daysRemaining = differenceInDays(monthEnd, now);
      const daysPassed = 30 - daysRemaining;
      const { weightedForecast, projectedRevenue, confidenceLevel } = 
        computeForecast(pipelineDeals, totalTeamRevenue, totalTeamGoal, daysRemaining, daysPassed);
      
      // Trends
      const revenueByMonth = buildRevenueByMonth(last6MonthsSales);
      const conversionByMonth = revenueByMonth.map(r => ({ month: r.month, rate: 0 }));
      const dealsBySource = buildDealsBySource(completedSales);
      const abcClients = buildABCAnalysis(salespeoplePerformance);
      
      // Alerts
      const stagnantDeals = atRiskDeals;
      const missedGoals = salespeoplePerformance.filter(sp => sp.goalProgress < 80 && sp.goalProgress > 0).length;
      const lowActivitySalespeople = salespeoplePerformance.filter(sp => sp.activities < 5).length;
      
      return {
        totalTeamRevenue,
        previousTeamRevenue,
        teamRevenueChange,
        totalTeamGoal,
        teamGoalProgress,
        activeSalespeople: salespeople.length,
        avgPerformance,
        totalPipelineValue,
        totalPipelineDeals: pipelineDeals.length,
        atRiskDeals,
        avgDaysInPipeline,
        dealsByStage,
        weightedForecast,
        projectedRevenue,
        confidenceLevel,
        salespeoplePerformance,
        topPerformers,
        underperformers,
        revenueByMonth,
        conversionByMonth,
        dealsBySource,
        abcClients,
        stagnantDeals,
        missedGoals,
        lowActivitySalespeople
      };
    },
    staleTime: 60000,
    refetchInterval: 60000
  });
}
