import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ForecastDeal {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  probability: number;
  weighted_value: number;
  days_in_stage: number;
  lead_score: number | null;
}

interface StageBreakdown {
  stage: string;
  label: string;
  count: number;
  total_value: number;
  weighted_value: number;
  probability: number;
  color: string;
}

export interface WeightedForecastData {
  deals: ForecastDeal[];
  stages: StageBreakdown[];
  totalPipeline: number;
  weightedForecast: number;
  bestCase: number;
  worstCase: number;
  confidenceScore: number;
  projectedRevenue: number;
  currentRevenue: number;
  monthlyGoal: number;
  avgDealSize: number;
  avgCloseTime: number;
}

const STAGE_CONFIG: Record<string, { label: string; baseProbability: number; color: string }> = {
  pending: { label: "Lead", baseProbability: 0.10, color: "hsl(var(--muted-foreground))" },
  qualified: { label: "Qualificado", baseProbability: 0.30, color: "hsl(var(--primary))" },
  proposal: { label: "Proposta", baseProbability: 0.55, color: "hsl(45, 93%, 47%)" },
  negotiation: { label: "Negociação", baseProbability: 0.80, color: "hsl(142, 71%, 45%)" },
};

export function useWeightedForecast() {
  return useQuery({
    queryKey: ["weighted-forecast"],
    queryFn: async (): Promise<WeightedForecastData> => {
      const [salesRes, scoresRes, stageHistoryRes, goalsRes, wonSalesRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, client_name, product_name, amount, status, created_at")
          .in("status", ["pending", "qualified", "proposal", "negotiation"]),
        supabase
          .from("lead_scores")
          .select("sale_id, score"),
        supabase
          .from("deal_stage_history")
          .select("sale_id, stage, entered_at, exited_at")
          .is("exited_at", null),
        supabase
          .from("sales_goals")
          .select("goal_amount")
          .gte("month", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase
          .from("sales")
          .select("amount, created_at")
          .in("status", ["completed", "won"])
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      if (salesRes.error) throw salesRes.error;

      const sales = salesRes.data || [];
      const scores = scoresRes.data || [];
      const currentStages = stageHistoryRes.data || [];
      const wonSales = wonSalesRes.data || [];

      const scoreMap = new Map(scores.map(s => [s.sale_id, s.score]));
      const stageEntryMap = new Map(currentStages.map(s => [s.sale_id, s.entered_at]));

      const now = Date.now();

      const deals: ForecastDeal[] = sales.map(sale => {
        const config = STAGE_CONFIG[sale.status];
        const leadScore = scoreMap.get(sale.id) || null;
        const enteredAt = stageEntryMap.get(sale.id);
        const daysInStage = enteredAt
          ? Math.round((now - new Date(enteredAt).getTime()) / (1000 * 60 * 60 * 24))
          : Math.round((now - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24));

        // Adjust probability based on lead score
        let probability = config?.baseProbability || 0.1;
        if (leadScore !== null) {
          const scoreMultiplier = leadScore > 70 ? 1.2 : leadScore > 40 ? 1.0 : 0.8;
          probability = Math.min(0.95, probability * scoreMultiplier);
        }

        // Penalize deals stagnant too long
        if (daysInStage > 30) {
          probability *= 0.8;
        } else if (daysInStage > 60) {
          probability *= 0.5;
        }

        return {
          id: sale.id,
          client_name: sale.client_name,
          product_name: sale.product_name,
          amount: Number(sale.amount),
          status: sale.status,
          probability: Math.round(probability * 100) / 100,
          weighted_value: Math.round(Number(sale.amount) * probability),
          days_in_stage: daysInStage,
          lead_score: leadScore,
        };
      });

      const stages: StageBreakdown[] = Object.entries(STAGE_CONFIG).map(([key, config]) => {
        const stageDeals = deals.filter(d => d.status === key);
        return {
          stage: key,
          label: config.label,
          count: stageDeals.length,
          total_value: stageDeals.reduce((s, d) => s + d.amount, 0),
          weighted_value: stageDeals.reduce((s, d) => s + d.weighted_value, 0),
          probability: config.baseProbability,
          color: config.color,
        };
      });

      const totalPipeline = deals.reduce((s, d) => s + d.amount, 0);
      const weightedForecast = deals.reduce((s, d) => s + d.weighted_value, 0);
      const bestCase = deals.reduce((s, d) => s + d.amount * Math.min(1, d.probability * 1.3), 0);
      const worstCase = deals.reduce((s, d) => s + d.amount * d.probability * 0.6, 0);

      const currentRevenue = wonSales.reduce((s, sale) => s + Number(sale.amount), 0);
      const monthlyGoal = (goalsRes.data || []).reduce((s, g) => s + Number(g.goal_amount), 0);

      const dayOfMonth = new Date().getDate();
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const dailyRate = dayOfMonth > 0 ? currentRevenue / dayOfMonth : 0;
      const projectedRevenue = currentRevenue + dailyRate * (daysInMonth - dayOfMonth);

      const avgDealSize = deals.length > 0 ? totalPipeline / deals.length : 0;
      const avgCloseTime = deals.length > 0
        ? Math.round(deals.reduce((s, d) => s + d.days_in_stage, 0) / deals.length)
        : 0;

      const confidenceScore = Math.min(100, Math.round(
        (deals.length > 0 ? 20 : 0) +
        (weightedForecast > 0 ? 30 : 0) +
        (deals.filter(d => d.lead_score !== null).length / Math.max(1, deals.length)) * 30 +
        (currentRevenue / Math.max(1, monthlyGoal)) * 20
      ));

      return {
        deals: deals.sort((a, b) => b.weighted_value - a.weighted_value),
        stages,
        totalPipeline,
        weightedForecast,
        bestCase: Math.round(bestCase),
        worstCase: Math.round(worstCase),
        confidenceScore,
        projectedRevenue: Math.round(projectedRevenue),
        currentRevenue,
        monthlyGoal,
        avgDealSize: Math.round(avgDealSize),
        avgCloseTime,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
