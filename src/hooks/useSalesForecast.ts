import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, endOfDay } from "date-fns";

interface ForecastData {
  projectedRevenue: number;
  pipelineValue: number;
  historicalAvg: number;
  goalAmount: number;
  daysRemaining: number;
  dailyRequired: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  pipelineBreakdown: {
    stage: string;
    value: number;
    probability: number;
  }[];
}

export function useSalesForecast() {
  return useQuery({
    queryKey: ["sales_forecast"],
    queryFn: async (): Promise<ForecastData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const daysPassed = differenceInDays(now, monthStart) + 1;
      const daysRemaining = daysInMonth - daysPassed;

      // Get current month completed sales
      const { data: currentSales, error: currentError } = await supabase
        .from("sales")
        .select("amount, status")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", endOfDay(now).toISOString());

      if (currentError) throw currentError;

      // Get pipeline (pending sales)
      const pendingSales = (currentSales || []).filter(s => s.status === "pending");
      const completedSales = (currentSales || []).filter(s => s.status === "completed");
      
      const currentRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const pipelineValue = pendingSales.reduce((sum, s) => sum + Number(s.amount), 0);

      // Get last 3 months for historical average
      const threeMonthsAgo = subMonths(now, 3);
      const { data: historicalSales, error: histError } = await supabase
        .from("sales")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", threeMonthsAgo.toISOString())
        .lt("created_at", monthStart.toISOString());

      if (histError) throw histError;

      // Calculate monthly averages
      const monthlyTotals: Record<string, number> = {};
      (historicalSales || []).forEach(sale => {
        const monthKey = format(new Date(sale.created_at), "yyyy-MM");
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(sale.amount);
      });

      const monthValues = Object.values(monthlyTotals);
      const historicalAvg = monthValues.length > 0 
        ? monthValues.reduce((a, b) => a + b, 0) / monthValues.length 
        : 0;

      // Get current month goal
      const monthStr = format(now, "yyyy-MM") + "-01";
      const { data: goals, error: goalsError } = await supabase
        .from("sales_goals")
        .select("goal_amount")
        .eq("month", monthStr);

      if (goalsError) throw goalsError;

      const goalAmount = (goals || []).reduce((sum, g) => sum + Number(g.goal_amount), 0);

      // Calculate projection
      const dailyRate = daysPassed > 0 ? currentRevenue / daysPassed : 0;
      const projectedFromRate = currentRevenue + (dailyRate * daysRemaining);
      
      // Pipeline with 60% conversion probability
      const pipelineContribution = pipelineValue * 0.6;
      
      // Weighted projection: 60% current rate + 40% pipeline
      const projectedRevenue = projectedFromRate * 0.6 + (currentRevenue + pipelineContribution) * 0.4;

      // Calculate daily required to hit goal
      const remaining = goalAmount - currentRevenue;
      const dailyRequired = daysRemaining > 0 ? Math.max(0, remaining / daysRemaining) : 0;

      // Determine trend
      let trend: "up" | "down" | "stable" = "stable";
      if (monthValues.length >= 2) {
        const lastMonth = monthValues[monthValues.length - 1] || 0;
        const prevMonth = monthValues[monthValues.length - 2] || 0;
        if (lastMonth > prevMonth * 1.05) trend = "up";
        else if (lastMonth < prevMonth * 0.95) trend = "down";
      }

      // Confidence based on data availability and variance
      const variance = monthValues.length > 1 
        ? Math.sqrt(monthValues.reduce((sum, v) => sum + Math.pow(v - historicalAvg, 2), 0) / monthValues.length)
        : 0;
      const coefficientOfVariation = historicalAvg > 0 ? variance / historicalAvg : 0;
      const confidence = Math.max(50, Math.min(95, 85 - (coefficientOfVariation * 50)));

      // Pipeline breakdown by simulated stages
      const pipelineBreakdown = [
        { stage: "Proposta", value: pipelineValue * 0.4, probability: 0.5 },
        { stage: "Negociação", value: pipelineValue * 0.35, probability: 0.7 },
        { stage: "Fechamento", value: pipelineValue * 0.25, probability: 0.9 },
      ];

      return {
        projectedRevenue,
        pipelineValue,
        historicalAvg,
        goalAmount,
        daysRemaining,
        dailyRequired,
        trend,
        confidence: Math.round(confidence),
        pipelineBreakdown,
      };
    },
  });
}
