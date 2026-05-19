import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { PeriodFilter } from "@/components/vendedores/PeriodFilter";

export type { PeriodFilter };
export type SalespersonRole = "sdr" | "closer" | "hybrid";

export interface Salesperson {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  commission_rate: number;
  is_active: boolean;
  role: SalespersonRole;
  auth_user_id: string | null;
  squad_id?: string | null;
  notify_sales_in_app?: boolean;
  notify_sales_email?: boolean;
}

interface SalesGoal {
  id: string;
  salesperson_id: string;
  month: string;
  goal_amount: number;
}

export interface SalespersonWithStats extends Salesperson {
  totalSales: number;
  completedSales: number;
  goalAmount: number;
  goalProgress: number;
  commission: number;
  rank: number;
}

export function getDateRange(period: PeriodFilter): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
  }
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
      return (data || []).map(sp => ({
        ...sp,
        notify_sales_in_app: sp.notify_sales_in_app ?? true,
        notify_sales_email: sp.notify_sales_email ?? false,
      })) as Salesperson[];
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

export function useSalespeopleRanking(period: PeriodFilter = "month") {
  const { start, end } = getDateRange(period);

  return useQuery({
    queryKey: ["salespeople_ranking", period],
    queryFn: async () => {
      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("*")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch current month goals (goals are always monthly)
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: goals, error: goalsError } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonth);

      if (goalsError) throw goalsError;

      // Fetch sales for selected period
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .eq("status", "completed");

      if (salesError) throw salesError;

      // Calculate stats for each salesperson
      const salespeopleWithStats: SalespersonWithStats[] = (salespeople || []).map(sp => {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const totalSales = spSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const goal = (goals || []).find(g => g.salesperson_id === sp.id);
        const goalAmount = goal ? Number(goal.goal_amount) : 0;
        
        // Adjust goal based on period
        let adjustedGoal = goalAmount;
        if (period === "week") {
          adjustedGoal = goalAmount / 4; // ~4 weeks per month
        } else if (period === "quarter") {
          adjustedGoal = goalAmount * 3; // 3 months per quarter
        }
        
        const goalProgress = adjustedGoal > 0 ? (totalSales / adjustedGoal) * 100 : 0;
        const commission = totalSales * (Number(sp.commission_rate) / 100);

        return {
          ...sp,
          commission_rate: Number(sp.commission_rate),
          totalSales,
          completedSales: spSales.length,
          goalAmount: adjustedGoal,
          goalProgress,
          commission,
          rank: 0,
          notify_sales_in_app: sp.notify_sales_in_app ?? true,
          notify_sales_email: sp.notify_sales_email ?? false,
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

export function useUpdateSalesperson(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Salesperson>) => {
      const { data, error } = await supabase
        .from("salespeople")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salespeople"] });
      queryClient.invalidateQueries({ queryKey: ["salespeople_ranking"] });
      onSuccess?.();
      toast.success("Vendedor atualizado!");
    },
    onError: (e: Error) => toast.error("Erro ao atualizar: " + e.message),
  });
}
