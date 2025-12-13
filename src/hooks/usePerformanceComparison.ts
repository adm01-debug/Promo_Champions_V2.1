import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface SalespersonPerformance {
  id: string;
  name: string;
  avatar_url: string | null;
  role: "sdr" | "closer" | "hybrid";
  totalSales: number;
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
  totalActivities: number;
  meetingsScheduled: number;
  goalProgress: number;
}

export interface RoleBenchmark {
  role: "sdr" | "closer" | "hybrid";
  avgRevenue: number;
  avgDealSize: number;
  avgWinRate: number;
  avgActivities: number;
  topPerformer: SalespersonPerformance | null;
  salespeople: SalespersonPerformance[];
}

export function usePerformanceComparison(month?: Date) {
  const targetMonth = month || new Date();
  const monthStart = format(startOfMonth(targetMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(targetMonth), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["performance-comparison", monthStart],
    queryFn: async (): Promise<RoleBenchmark[]> => {
      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch sales for the month
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("id, salesperson_id, amount, status")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd + "T23:59:59");

      if (salesError) throw salesError;

      // Fetch activities for the month
      const { data: activities, error: actError } = await supabase
        .from("activities")
        .select("id, salesperson_id, outcome")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd + "T23:59:59");

      if (actError) throw actError;

      // Fetch goals for the month
      const { data: goals, error: goalsError } = await supabase
        .from("sales_goals")
        .select("salesperson_id, goal_amount")
        .eq("month", monthStart);

      if (goalsError) throw goalsError;

      // Calculate performance per salesperson
      const performanceMap: Record<string, SalespersonPerformance> = {};

      for (const sp of salespeople || []) {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const wonSales = spSales.filter(s => s.status === "completed");
        const lostSales = spSales.filter(s => s.status === "lost");
        const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);
        const scheduledMeetings = spActivities.filter(a => a.outcome === "scheduled").length;
        const goal = (goals || []).find(g => g.salesperson_id === sp.id);
        
        const totalRevenue = wonSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const totalDeals = wonSales.length + lostSales.length;
        const winRate = totalDeals > 0 ? (wonSales.length / totalDeals) * 100 : 0;
        const avgDealSize = wonSales.length > 0 ? totalRevenue / wonSales.length : 0;
        const goalProgress = goal && goal.goal_amount > 0 
          ? (totalRevenue / Number(goal.goal_amount)) * 100 
          : 0;

        performanceMap[sp.id] = {
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          totalSales: wonSales.length,
          totalRevenue,
          avgDealSize,
          winRate,
          totalActivities: spActivities.length,
          meetingsScheduled: scheduledMeetings,
          goalProgress,
        };
      }

      // Group by role
      const roles: Array<"sdr" | "closer" | "hybrid"> = ["sdr", "closer", "hybrid"];
      const benchmarks: RoleBenchmark[] = [];

      for (const role of roles) {
        const roleSalespeople = Object.values(performanceMap).filter(sp => sp.role === role);
        
        if (roleSalespeople.length === 0) continue;

        const avgRevenue = roleSalespeople.reduce((sum, sp) => sum + sp.totalRevenue, 0) / roleSalespeople.length;
        const avgDealSize = roleSalespeople.reduce((sum, sp) => sum + sp.avgDealSize, 0) / roleSalespeople.length;
        const avgWinRate = roleSalespeople.reduce((sum, sp) => sum + sp.winRate, 0) / roleSalespeople.length;
        const avgActivities = roleSalespeople.reduce((sum, sp) => sum + sp.totalActivities, 0) / roleSalespeople.length;

        // Sort by revenue to find top performer
        const sorted = [...roleSalespeople].sort((a, b) => b.totalRevenue - a.totalRevenue);

        benchmarks.push({
          role,
          avgRevenue,
          avgDealSize,
          avgWinRate,
          avgActivities,
          topPerformer: sorted[0] || null,
          salespeople: sorted,
        });
      }

      return benchmarks;
    },
    refetchInterval: 60000,
  });
}
