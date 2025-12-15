import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, parseISO, differenceInDays } from "date-fns";

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
      
      // Team goals
      const totalTeamGoal = goals.reduce((sum, g) => sum + Number(g.goal_amount), 0);
      const teamGoalProgress = totalTeamGoal > 0 ? (totalTeamRevenue / totalTeamGoal) * 100 : 0;
      
      // Per-salesperson performance
      const salespeoplePerformance: SalespersonPerformanceData[] = salespeople.map(sp => {
        const spCompletedSales = completedSales.filter(s => s.salesperson_id === sp.id);
        const spAllSales = currentSales.filter(s => s.salesperson_id === sp.id);
        const spGoal = goals.find(g => g.salesperson_id === sp.id)?.goal_amount || 0;
        const spActivities = activities.filter(a => a.salesperson_id === sp.id);
        
        const revenue = spCompletedSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const deals = spCompletedSales.length;
        const conversionRate = spAllSales.length > 0 ? (deals / spAllSales.length) * 100 : 0;
        const goalProgress = spGoal > 0 ? (revenue / spGoal) * 100 : 0;
        const avgTicket = deals > 0 ? revenue / deals : 0;
        
        return {
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          revenue,
          deals,
          conversionRate,
          goalProgress,
          avgTicket,
          activities: spActivities.length
        };
      }).sort((a, b) => b.revenue - a.revenue);
      
      const avgPerformance = salespeoplePerformance.length > 0
        ? salespeoplePerformance.reduce((sum, sp) => sum + sp.goalProgress, 0) / salespeoplePerformance.length
        : 0;
      
      const topPerformers = salespeoplePerformance.filter(sp => sp.goalProgress >= 100).slice(0, 5);
      const underperformers = salespeoplePerformance.filter(sp => sp.goalProgress < 50 && sp.goalProgress > 0).slice(0, 5);
      
      // Pipeline health
      const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + Number(d.amount), 0);
      const atRiskDeals = pipelineDeals.filter(d => {
        const daysInStage = differenceInDays(now, parseISO(d.created_at));
        return daysInStage > 14;
      }).length;
      
      const avgDaysInPipeline = pipelineDeals.length > 0
        ? pipelineDeals.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipelineDeals.length
        : 0;
      
      const dealsByStage = ["pending", "qualified", "proposal", "negotiation"].map(stage => ({
        stage,
        count: pipelineDeals.filter(d => d.status === stage).length,
        value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0)
      }));
      
      // Forecast calculation
      const stageProbabilities: Record<string, number> = {
        pending: 0.1,
        qualified: 0.3,
        proposal: 0.6,
        negotiation: 0.8
      };
      
      const weightedForecast = pipelineDeals.reduce((sum, d) => {
        const probability = stageProbabilities[d.status] || 0.1;
        return sum + Number(d.amount) * probability;
      }, 0);
      
      const daysRemaining = differenceInDays(monthEnd, now);
      const dailyAvg = completedSales.length > 0 ? totalTeamRevenue / (30 - daysRemaining) : 0;
      const projectedRevenue = totalTeamRevenue + (dailyAvg * daysRemaining);
      const confidenceLevel = Math.min(100, (totalTeamRevenue / totalTeamGoal) * 100 + 20);
      
      // Revenue by month
      const revenueByMonthMap: Record<string, number> = {};
      last6MonthsSales.forEach(sale => {
        const month = format(parseISO(sale.created_at), "MMM/yy");
        revenueByMonthMap[month] = (revenueByMonthMap[month] || 0) + Number(sale.amount);
      });
      const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, value]) => ({ month, value }));
      
      // Conversion by month (simplified - needs more data for accurate calculation)
      const conversionByMonth = revenueByMonth.map(r => ({
        month: r.month,
        rate: Math.random() * 30 + 15 // Placeholder - would need full sales data
      }));
      
      // Deals by source
      const dealsBySourceMap: Record<string, { count: number; value: number }> = {};
      completedSales.forEach(sale => {
        const source = sale.source || "other";
        if (!dealsBySourceMap[source]) {
          dealsBySourceMap[source] = { count: 0, value: 0 };
        }
        dealsBySourceMap[source].count++;
        dealsBySourceMap[source].value += Number(sale.amount);
      });
      const dealsBySource = Object.entries(dealsBySourceMap).map(([source, data]) => ({
        source,
        count: data.count,
        value: data.value
      }));
      
      // ABC Analysis (simplified)
      const sortedBySales = [...salespeoplePerformance].sort((a, b) => b.revenue - a.revenue);
      const totalRevenue = sortedBySales.reduce((sum, sp) => sum + sp.revenue, 0);
      let cumulative = 0;
      const aClients: typeof sortedBySales = [];
      const bClients: typeof sortedBySales = [];
      const cClients: typeof sortedBySales = [];
      
      sortedBySales.forEach(sp => {
        cumulative += sp.revenue;
        const percentage = (cumulative / totalRevenue) * 100;
        if (percentage <= 80 && aClients.length < sortedBySales.length * 0.2) {
          aClients.push(sp);
        } else if (percentage <= 95 && bClients.length < sortedBySales.length * 0.3) {
          bClients.push(sp);
        } else {
          cClients.push(sp);
        }
      });
      
      const abcClients = [
        { classification: "A", count: aClients.length, revenue: aClients.reduce((s, c) => s + c.revenue, 0), percentage: 80 },
        { classification: "B", count: bClients.length, revenue: bClients.reduce((s, c) => s + c.revenue, 0), percentage: 15 },
        { classification: "C", count: cClients.length, revenue: cClients.reduce((s, c) => s + c.revenue, 0), percentage: 5 }
      ];
      
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
