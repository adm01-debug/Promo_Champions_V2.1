import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, differenceInDays, format, getDaysInMonth } from "date-fns";

interface SalespersonGoalData {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  goalAmount: number;
  currentSales: number;
  progress: number;
  projection: number;
  onTrack: boolean;
  dailyAverage: number;
  requiredDailyAverage: number;
}

interface TeamGoalData {
  totalGoal: number;
  totalSales: number;
  progress: number;
  projection: number;
  onTrack: boolean;
  daysElapsed: number;
  daysRemaining: number;
  dailyAverage: number;
  requiredDailyAverage: number;
  salespeople: SalespersonGoalData[];
}

export function useGoalsDashboard() {
  return useQuery({
    queryKey: ["goals-dashboard"],
    queryFn: async (): Promise<TeamGoalData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const currentMonth = format(now, "yyyy-MM") + "-01";
      const totalDays = getDaysInMonth(now);
      const daysElapsed = differenceInDays(now, monthStart) + 1;
      const daysRemaining = totalDays - daysElapsed;

      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("*")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch goals for current month
      const { data: goals, error: goalsError } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonth);

      if (goalsError) throw goalsError;

      // Fetch completed sales for current month
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      if (salesError) throw salesError;

      // Calculate per-salesperson data
      const salespeopleData: SalespersonGoalData[] = (salespeople || []).map(sp => {
        const goal = (goals || []).find(g => g.salesperson_id === sp.id);
        const goalAmount = goal ? Number(goal.goal_amount) : 0;
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const currentSales = spSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const progress = goalAmount > 0 ? (currentSales / goalAmount) * 100 : 0;
        const dailyAverage = daysElapsed > 0 ? currentSales / daysElapsed : 0;
        const projection = dailyAverage * totalDays;
        const requiredDailyAverage = daysRemaining > 0 ? (goalAmount - currentSales) / daysRemaining : 0;
        const onTrack = projection >= goalAmount;

        return {
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          goalAmount,
          currentSales,
          progress,
          projection,
          onTrack,
          dailyAverage,
          requiredDailyAverage: Math.max(0, requiredDailyAverage),
        };
      });

      // Calculate team totals
      const totalGoal = salespeopleData.reduce((sum, sp) => sum + sp.goalAmount, 0);
      const totalSales = salespeopleData.reduce((sum, sp) => sum + sp.currentSales, 0);
      const teamProgress = totalGoal > 0 ? (totalSales / totalGoal) * 100 : 0;
      const teamDailyAverage = daysElapsed > 0 ? totalSales / daysElapsed : 0;
      const teamProjection = teamDailyAverage * totalDays;
      const teamRequiredDaily = daysRemaining > 0 ? (totalGoal - totalSales) / daysRemaining : 0;

      return {
        totalGoal,
        totalSales,
        progress: teamProgress,
        projection: teamProjection,
        onTrack: teamProjection >= totalGoal,
        daysElapsed,
        daysRemaining,
        dailyAverage: teamDailyAverage,
        requiredDailyAverage: Math.max(0, teamRequiredDaily),
        salespeople: salespeopleData.sort((a, b) => b.progress - a.progress),
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });
}
