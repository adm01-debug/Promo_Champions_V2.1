import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

export interface MicroGoal {
  id: string;
  type: "overtake" | "record" | "milestone" | "challenge" | "streak";
  icon: string;
  message: string;
  progress: number; // 0-100
  remaining: string;
  priority: number; // 1 = most urgent
}

export function useMicroGoals(salespersonId?: string) {
  return useQuery({
    queryKey: ["micro-goals", salespersonId],
    enabled: !!salespersonId,
    queryFn: async (): Promise<MicroGoal[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [rankingResult, goalsResult, salesResult, streakResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id, name")
          .eq("is_active", true),
        supabase
          .from("sales_goals")
          .select("salesperson_id, goal_amount")
          .eq("month", now.toISOString().slice(0, 7) + "-01"),
        supabase
          .from("sales")
          .select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("daily_streak_achievements")
          .select("salesperson_id, streak_count")
          .eq("salesperson_id", salespersonId!)
          .order("achieved_at", { ascending: false })
          .limit(1),
      ]);

      const salespeople = rankingResult.data || [];
      const goals = goalsResult.data || [];
      const sales = salesResult.data || [];
      const microGoals: MicroGoal[] = [];

      // Build ranking
      const salesBySp = new Map<string, number>();
      salespeople.forEach((sp) => {
        const total = sales
          .filter((s) => s.salesperson_id === sp.id)
          .reduce((sum, s) => sum + Number(s.amount), 0);
        salesBySp.set(sp.id, total);
      });

      const sorted = Array.from(salesBySp.entries())
        .map(([id, total]) => ({ id, total, name: salespeople.find((s) => s.id === id)?.name || "" }))
        .sort((a, b) => b.total - a.total);

      const myIndex = sorted.findIndex((s) => s.id === salespersonId);
      const mySales = salesBySp.get(salespersonId!) || 0;

      // 1. Overtake next person
      if (myIndex > 0) {
        const nextPerson = sorted[myIndex - 1];
        const gap = nextPerson.total - mySales;
        if (gap > 0 && gap < mySales * 0.5) {
          microGoals.push({
            id: "overtake",
            type: "overtake",
            icon: "⚔️",
            message: `Faltam R$ ${gap.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} para ultrapassar ${nextPerson.name}!`,
            progress: Math.round((mySales / nextPerson.total) * 100),
            remaining: `R$ ${gap.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            priority: 1,
          });
        }
      }

      // 2. Monthly goal milestone
      const myGoal = goals.find((g) => g.salesperson_id === salespersonId);
      if (myGoal) {
        const goalAmount = Number(myGoal.goal_amount);
        const remaining = goalAmount - mySales;
        const progress = goalAmount > 0 ? Math.round((mySales / goalAmount) * 100) : 0;

        if (remaining > 0) {
          // Next milestone (25%, 50%, 75%, 100%)
          const milestones = [25, 50, 75, 100];
          const nextMilestone = milestones.find((m) => progress < m);
          if (nextMilestone) {
            const milestoneValue = (goalAmount * nextMilestone) / 100;
            const toMilestone = milestoneValue - mySales;
            if (toMilestone > 0) {
              microGoals.push({
                id: `milestone-${nextMilestone}`,
                type: "milestone",
                icon: nextMilestone === 100 ? "🏆" : "🎯",
                message: `Faltam R$ ${toMilestone.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} para ${nextMilestone}% da meta!`,
                progress,
                remaining: `R$ ${toMilestone.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                priority: 2,
              });
            }
          }
        } else {
          microGoals.push({
            id: "goal-exceeded",
            type: "milestone",
            icon: "🚀",
            message: `Meta batida! R$ ${Math.abs(remaining).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} acima do objetivo!`,
            progress: 100,
            remaining: "Superada!",
            priority: 5,
          });
        }
      }

      // 3. Personal record
      // Check if current month is personal best (simplified)
      if (mySales > 0 && myIndex === 0) {
        microGoals.push({
          id: "first-place",
          type: "record",
          icon: "👑",
          message: "Você é o #1 do time! Mantenha o ritmo!",
          progress: 100,
          remaining: "Liderando",
          priority: 4,
        });
      }

      // 4. Streak goal
      const currentStreak = streakResult.data?.[0]?.streak_count || 0;
      const nextStreakMilestone = [3, 5, 7, 14, 21, 30].find((m) => currentStreak < m);
      if (nextStreakMilestone) {
        microGoals.push({
          id: "streak",
          type: "streak",
          icon: "🔥",
          message: `${nextStreakMilestone - currentStreak} dia(s) para streak de ${nextStreakMilestone}!`,
          progress: Math.round((currentStreak / nextStreakMilestone) * 100),
          remaining: `${nextStreakMilestone - currentStreak} dias`,
          priority: 3,
        });
      }

      microGoals.sort((a, b) => a.priority - b.priority);
      return microGoals.slice(0, 4);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
