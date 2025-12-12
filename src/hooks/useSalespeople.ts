import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Salesperson {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  commission_rate: number;
  is_active: boolean;
}

interface SalesGoal {
  id: string;
  salesperson_id: string;
  month: string;
  goal_amount: number;
}

interface SalespersonWithStats extends Salesperson {
  totalSales: number;
  completedSales: number;
  goalAmount: number;
  goalProgress: number;
  commission: number;
  rank: number;
}

export function useSalespeople() {
  return useQuery({
    queryKey: ["salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Salesperson[];
    },
  });
}

export function useSalesGoals(month?: Date) {
  const targetMonth = month || new Date();
  const monthStr = targetMonth.toISOString().slice(0, 7) + "-01";

  return useQuery({
    queryKey: ["sales_goals", monthStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", monthStr);

      if (error) throw error;
      return data as SalesGoal[];
    },
  });
}

export function useSalespeopleRanking() {
  return useQuery({
    queryKey: ["salespeople_ranking"],
    queryFn: async () => {
      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("*")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch current month goals
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: goals, error: goalsError } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonth);

      if (goalsError) throw goalsError;

      // Fetch sales for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .gte("created_at", startOfMonth.toISOString())
        .eq("status", "completed");

      if (salesError) throw salesError;

      // Calculate stats for each salesperson
      const salespeopleWithStats: SalespersonWithStats[] = (salespeople || []).map(sp => {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const totalSales = spSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const goal = (goals || []).find(g => g.salesperson_id === sp.id);
        const goalAmount = goal ? Number(goal.goal_amount) : 0;
        const goalProgress = goalAmount > 0 ? (totalSales / goalAmount) * 100 : 0;
        const commission = totalSales * (Number(sp.commission_rate) / 100);

        return {
          ...sp,
          commission_rate: Number(sp.commission_rate),
          totalSales,
          completedSales: spSales.length,
          goalAmount,
          goalProgress,
          commission,
          rank: 0,
        };
      });

      // Sort by total sales and assign ranks
      salespeopleWithStats.sort((a, b) => b.totalSales - a.totalSales);
      salespeopleWithStats.forEach((sp, index) => {
        sp.rank = index + 1;
      });

      return salespeopleWithStats;
    },
  });
}
