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
  commissionRate: number;
  currentCommission: number;
  projectedCommission: number;
  predictedAttainment?: number;
  paceStatus?: 'ahead' | 'on_track' | 'behind';
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
  totalCurrentCommission: number;
  totalProjectedCommission: number;
  teamPredictedAttainment?: number;
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

      // Fetch all data in parallel for better performance
      const [salespeopleResult, goalsResult, salesResult, predictionsResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id, name, avatar_url, role, commission_rate")
          .eq("is_active", true),
        supabase
          .from("sales_goals")
          .select("salesperson_id, goal_amount")
          .eq("month", currentMonth),
        supabase
          .from("sales")
          .select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("quota_attainment_predictions")
          .select("*")
          .eq("period_start", currentMonth),
      ]);

      if (salespeopleResult.error) throw salespeopleResult.error;
      if (goalsResult.error) throw goalsResult.error;
      if (salesResult.error) throw salesResult.error;

      const salespeople = salespeopleResult.data || [];
      const goals = goalsResult.data || [];
      const sales = salesResult.data || [];
      const predictions = predictionsResult.data || [];

      // Calculate per-salesperson data
      const salespeopleData: SalespersonGoalData[] = salespeople.map(sp => {
        const goal = goals.find(g => g.salesperson_id === sp.id);
        const prediction = predictions.find(p => p.salesperson_id === sp.id);
        const goalAmount = goal ? Number(goal.goal_amount) : 0;
        const spSales = sales.filter(s => s.salesperson_id === sp.id);
        const currentSales = spSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const progress = goalAmount > 0 ? (currentSales / goalAmount) * 100 : 0;
        const dailyAverage = daysElapsed > 0 ? currentSales / daysElapsed : 0;
        const projection = dailyAverage * totalDays;
        const requiredDailyAverage = daysRemaining > 0 ? (goalAmount - currentSales) / daysRemaining : 0;
        const onTrack = projection >= goalAmount;
        
        // Commission calculations
        const commissionRate = Number(sp.commission_rate) || 10;
        const currentCommission = currentSales * (commissionRate / 100);
        const projectedCommission = projection * (commissionRate / 100);

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
          commissionRate,
          currentCommission,
          projectedCommission,
          predictedAttainment: prediction?.predicted_attainment_pct ?? (progress * (totalDays / daysElapsed)),
          paceStatus: prediction?.pace_status as 'ahead' | 'on_track' | 'behind' | undefined,
        };
      });

      // Calculate team totals
      const teamPrediction = predictions.find(p => p.salesperson_id === '00000000-0000-0000-0000-000000000000'); // ID fictício para time ou lógica similar
      const totalGoal = salespeopleData.reduce((sum, sp) => sum + sp.goalAmount, 0);
      const totalSales = salespeopleData.reduce((sum, sp) => sum + sp.currentSales, 0);
      const teamProgress = totalGoal > 0 ? (totalSales / totalGoal) * 100 : 0;
      const teamDailyAverage = daysElapsed > 0 ? totalSales / daysElapsed : 0;
      const teamProjection = teamDailyAverage * totalDays;
      const teamRequiredDaily = daysRemaining > 0 ? (totalGoal - totalSales) / daysRemaining : 0;

      // Team commission totals
      const totalCurrentCommission = salespeopleData.reduce((sum, sp) => sum + sp.currentCommission, 0);
      const totalProjectedCommission = salespeopleData.reduce((sum, sp) => sum + sp.projectedCommission, 0);

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
        totalCurrentCommission,
        totalProjectedCommission,
        teamPredictedAttainment: teamPrediction ? (teamPrediction as any).predicted_attainment_pct : (teamProgress * (totalDays / daysElapsed)),
        salespeople: salespeopleData.sort((a, b) => b.progress - a.progress),
      };
    },
    refetchInterval: false, // Optimize: manual refresh or on-stale only
    staleTime: 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
}
