import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { computeStageDeltas, type FunnelStageBasic, type StageDelta } from "@/components/reporting/funnelReportHelpers";

interface FunnelSnapshot {
  stages: FunnelStageBasic[];
  overallConversion: number;
  totalValue: number;
  avgDealSize: number;
  topDropOffStage: string;
  totalDeals: number;
  wonCount: number;
}

const STAGE_ORDER = ["lead", "prospecting", "qualified", "proposal", "negotiation"];

const fetchFunnelSnapshot = async (startDate: Date, endDate: Date): Promise<FunnelSnapshot> => {
  const [{ data: stageHistory, error: shErr }, { data: sales, error: sErr }] = await Promise.all([
    supabase
      .from("deal_stage_history")
      .select("sale_id, stage, entered_at")
      .gte("entered_at", startDate.toISOString())
      .lt("entered_at", endDate.toISOString()),
    supabase
      .from("sales")
      .select("id, amount, status, created_at")
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString()),
  ]);

  if (shErr) throw shErr;
  if (sErr) throw sErr;

  const stageGroups = new Map<string, Set<string>>();
  STAGE_ORDER.forEach((s) => stageGroups.set(s, new Set()));
  (stageHistory || []).forEach((r) => {
    const s = (r.stage || "").toLowerCase();
    if (stageGroups.has(s)) stageGroups.get(s)!.add(r.sale_id || "");
  });

  const amountMap = new Map<string, number>();
  (sales || []).forEach((s) => amountMap.set(s.id, s.amount || 0));

  const totalDeals = (sales || []).length;
  let prevCount = totalDeals || 1;

  const stages: FunnelStageBasic[] = STAGE_ORDER.map((stage) => {
    const ids = stageGroups.get(stage) || new Set();
    const count = ids.size;
    const value = Array.from(ids).reduce((sum, id) => sum + (amountMap.get(id) || 0), 0);
    const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 0;
    const dropOffRate = Math.max(0, 100 - conversionRate);
    const result: FunnelStageBasic = {
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count,
      value,
      conversionRate: Math.round(conversionRate * 10) / 10,
      dropOffRate: Math.round(dropOffRate * 10) / 10,
    };
    if (count > 0) prevCount = count;
    return result;
  });

  const won = (sales || []).filter((s) => s.status === "completed");
  const overallConversion = totalDeals > 0 ? (won.length / totalDeals) * 100 : 0;
  const totalValue = won.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgDealSize = won.length > 0 ? totalValue / won.length : 0;

  const topDropOffStage = stages.length > 0
    ? stages.reduce((m, s) => (s.dropOffRate > m.dropOffRate ? s : m), stages[0]).stage
    : "N/A";

  return {
    stages,
    overallConversion: Math.round(overallConversion * 10) / 10,
    totalValue,
    avgDealSize: Math.round(avgDealSize),
    topDropOffStage,
    totalDeals,
    wonCount: won.length,
  };
};

export interface FunnelComparison {
  current: FunnelSnapshot;
  previous: FunnelSnapshot;
  deltas: StageDelta[];
  kpiDeltas: {
    overallConversion: number;
    totalValue: number;
    avgDealSize: number;
    wonCount: number;
  };
}

export const useFunnelComparison = (timeframe: number = 30) => {
  const { startCurr, endCurr, startPrev, endPrev } = useMemo(() => {
    const endCurr = new Date();
    const startCurr = new Date();
    startCurr.setDate(endCurr.getDate() - timeframe);
    const endPrev = new Date(startCurr);
    const startPrev = new Date(startCurr);
    startPrev.setDate(startPrev.getDate() - timeframe);
    return { startCurr, endCurr, startPrev, endPrev };
  }, [timeframe]);

  return useQuery<FunnelComparison>({
    queryKey: ["funnel-comparison", timeframe],
    queryFn: async () => {
      const [current, previous] = await Promise.all([
        fetchFunnelSnapshot(startCurr, endCurr),
        fetchFunnelSnapshot(startPrev, endPrev),
      ]);
      return {
        current,
        previous,
        deltas: computeStageDeltas(current.stages, previous.stages),
        kpiDeltas: {
          overallConversion: Math.round((current.overallConversion - previous.overallConversion) * 10) / 10,
          totalValue: current.totalValue - previous.totalValue,
          avgDealSize: current.avgDealSize - previous.avgDealSize,
          wonCount: current.wonCount - previous.wonCount,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
