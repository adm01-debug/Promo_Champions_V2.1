import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, endOfDay } from "date-fns";

// Stage probabilities for weighted forecast
const STAGE_PROBABILITIES: Record<string, number> = {
  pending: 0.10,
  lead: 0.10,
  qualified: 0.25,
  proposal: 0.50,
  negotiation: 0.75,
  completed: 1.0,
  lost: 0,
};

const STAGE_LABELS: Record<string, string> = {
  pending: "Lead",
  lead: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
};

interface PipelineDeal {
  id: string;
  client_name: string;
  amount: number;
  status: string;
  probability: number;
  weighted_value: number;
}

interface StageBreakdown {
  stage: string;
  label: string;
  deals: number;
  totalValue: number;
  probability: number;
  weightedValue: number;
}

interface ForecastData {
  projectedRevenue: number;
  currentRevenue: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  historicalAvg: number;
  goalAmount: number;
  daysRemaining: number;
  dailyRequired: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  pipelineBreakdown: StageBreakdown[];
  topDeals: PipelineDeal[];
}

export function useSalesForecast() {
  return useQuery({
    queryKey: ["sales_forecast_weighted"],
    queryFn: async (): Promise<ForecastData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const daysPassed = differenceInDays(now, monthStart) + 1;
      const daysRemaining = daysInMonth - daysPassed;

      // Get current month sales with status
      const { data: currentSales, error: currentError } = await supabase
        .from("sales")
        .select("id, client_name, amount, status")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", endOfDay(now).toISOString());

      if (currentError) throw currentError;

      // Get lead scores for probability adjustment
      const { data: leadScores, error: scoresError } = await supabase
        .from("lead_scores")
        .select("sale_id, score");

      if (scoresError) throw scoresError;

      const scoreMap = new Map((leadScores || []).map(s => [s.sale_id, s.score]));

      // Separate completed and pipeline deals
      const completedSales = (currentSales || []).filter(s => s.status === "completed");
      const lostSales = (currentSales || []).filter(s => s.status === "lost");
      const pipelineSales = (currentSales || []).filter(s => 
        !["completed", "lost"].includes(s.status)
      );

      const currentRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const pipelineValue = pipelineSales.reduce((sum, s) => sum + Number(s.amount), 0);

      // Calculate weighted pipeline value with probability
      const pipelineDeals: PipelineDeal[] = pipelineSales.map(sale => {
        const baseProbability = STAGE_PROBABILITIES[sale.status] || 0.1;
        
        // Adjust probability based on lead score if available
        const leadScore = scoreMap.get(sale.id);
        let adjustedProbability = baseProbability;
        
        if (leadScore !== undefined) {
          // Lead score (0-100) adds up to 15% to probability
          const scoreBonus = (leadScore / 100) * 0.15;
          adjustedProbability = Math.min(0.95, baseProbability + scoreBonus);
        }

        return {
          id: sale.id,
          client_name: sale.client_name,
          amount: Number(sale.amount),
          status: sale.status,
          probability: adjustedProbability,
          weighted_value: Number(sale.amount) * adjustedProbability,
        };
      });

      const weightedPipelineValue = pipelineDeals.reduce((sum, d) => sum + d.weighted_value, 0);

      // Group by stage for breakdown
      const stageGroups: Record<string, { deals: PipelineDeal[]; totalValue: number }> = {};
      
      for (const deal of pipelineDeals) {
        const stage = deal.status;
        if (!stageGroups[stage]) {
          stageGroups[stage] = { deals: [], totalValue: 0 };
        }
        stageGroups[stage].deals.push(deal);
        stageGroups[stage].totalValue += deal.amount;
      }

      const pipelineBreakdown: StageBreakdown[] = Object.entries(stageGroups)
        .map(([stage, data]) => ({
          stage,
          label: STAGE_LABELS[stage] || stage,
          deals: data.deals.length,
          totalValue: data.totalValue,
          probability: STAGE_PROBABILITIES[stage] || 0.1,
          weightedValue: data.deals.reduce((sum, d) => sum + d.weighted_value, 0),
        }))
        .sort((a, b) => b.probability - a.probability);

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

      // Calculate weighted projection
      // Projection = Current Revenue + Weighted Pipeline + (Daily Rate × Days Remaining × 0.3)
      const dailyRate = daysPassed > 0 ? currentRevenue / daysPassed : 0;
      const rateProjection = dailyRate * daysRemaining * 0.3; // 30% weight on rate projection
      
      const projectedRevenue = currentRevenue + weightedPipelineValue + rateProjection;

      // Calculate daily required to hit goal
      const remaining = goalAmount - currentRevenue - weightedPipelineValue;
      const dailyRequired = daysRemaining > 0 ? Math.max(0, remaining / daysRemaining) : 0;

      // Determine trend
      let trend: "up" | "down" | "stable" = "stable";
      if (monthValues.length >= 2) {
        const lastMonth = monthValues[monthValues.length - 1] || 0;
        const prevMonth = monthValues[monthValues.length - 2] || 0;
        if (lastMonth > prevMonth * 1.05) trend = "up";
        else if (lastMonth < prevMonth * 0.95) trend = "down";
      }

      // Confidence based on pipeline concentration and data availability
      const dealCount = pipelineDeals.length;
      const avgDealValue = dealCount > 0 ? pipelineValue / dealCount : 0;
      const largestDeal = Math.max(...pipelineDeals.map(d => d.amount), 0);
      const concentration = avgDealValue > 0 ? largestDeal / pipelineValue : 0;
      
      // Lower confidence if pipeline is concentrated in few deals
      const baseConfidence = 75;
      const concentrationPenalty = concentration * 20;
      const dataPenalty = monthValues.length < 2 ? 10 : 0;
      const confidence = Math.max(50, Math.min(95, baseConfidence - concentrationPenalty - dataPenalty));

      // Top deals by weighted value
      const topDeals = [...pipelineDeals]
        .sort((a, b) => b.weighted_value - a.weighted_value)
        .slice(0, 5);

      return {
        projectedRevenue,
        currentRevenue,
        pipelineValue,
        weightedPipelineValue,
        historicalAvg,
        goalAmount,
        daysRemaining,
        dailyRequired,
        trend,
        confidence: Math.round(confidence),
        pipelineBreakdown,
        topDeals,
      };
    },
    refetchInterval: 60000,
  });
}
