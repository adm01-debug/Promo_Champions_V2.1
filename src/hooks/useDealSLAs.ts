import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { differenceInHours, differenceInDays, parseISO } from "date-fns";

export interface SLAConfig {
  stage: string;
  maxHours: number;
  escalationHours: number;
  label: string;
}

export const DEFAULT_SLA_CONFIGS: SLAConfig[] = [
  { stage: "lead", maxHours: 4, escalationHours: 2, label: "Lead" },
  { stage: "qualified", maxHours: 24, escalationHours: 8, label: "Qualificado" },
  { stage: "proposal", maxHours: 48, escalationHours: 24, label: "Proposta" },
  { stage: "negotiation", maxHours: 72, escalationHours: 48, label: "Negociação" },
  { stage: "won", maxHours: 120, escalationHours: 72, label: "Ganho" },
  { stage: "lost", maxHours: 240, escalationHours: 120, label: "Perdido" },
];

export interface DealSLAStatus {
  dealId: string;
  clientName: string;
  stage: string;
  hoursInStage: number;
  maxHours: number;
  percentUsed: number;
  status: "ok" | "warning" | "breached";
  daysRemaining: number;
}

export const useDealSLAs = () => {
  const { data: stageHistory } = useQuery({
    queryKey: ["deal-stage-history-sla"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_stage_history")
        .select("sale_id, stage, entered_at, exited_at")
        .is("exited_at", null)
        .order("entered_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const { data: sales } = useQuery({
    queryKey: ["sales-for-sla"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, status, updated_at")
        .not("status", "in", '("closed")');
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const slaStatuses = useMemo((): DealSLAStatus[] => {
    if (!sales) return [];
    const now = new Date();
    const historyMap = new Map<string, { stage: string; entered_at: string }>();

    (stageHistory || []).forEach((h) => {
      if (h.sale_id) {
        historyMap.set(h.sale_id, { stage: h.stage, entered_at: h.entered_at });
      }
    });

    return sales
      .map((sale) => {
        const config = DEFAULT_SLA_CONFIGS.find((c) => c.stage === sale.status);
        if (!config) return null;

        const historyEntry = historyMap.get(sale.id);
        const enteredAt = historyEntry
          ? parseISO(historyEntry.entered_at)
          : parseISO(sale.updated_at);

        const hoursInStage = differenceInHours(now, enteredAt);
        const percentUsed = Math.min((hoursInStage / config.maxHours) * 100, 150);
        const hoursRemaining = config.maxHours - hoursInStage;

        let status: "ok" | "warning" | "breached" = "ok";
        if (hoursInStage >= config.maxHours) status = "breached";
        else if (hoursInStage >= config.escalationHours) status = "warning";

        return {
          dealId: sale.id,
          clientName: sale.client_name,
          stage: sale.status,
          hoursInStage,
          maxHours: config.maxHours,
          percentUsed,
          status,
          daysRemaining: Math.max(0, Math.ceil(hoursRemaining / 24)),
        };
      })
      .filter(Boolean) as DealSLAStatus[];
  }, [sales, stageHistory]);

  const summary = useMemo(() => {
    const breached = slaStatuses.filter((s) => s.status === "breached").length;
    const warning = slaStatuses.filter((s) => s.status === "warning").length;
    const ok = slaStatuses.filter((s) => s.status === "ok").length;
    return { breached, warning, ok, total: slaStatuses.length };
  }, [slaStatuses]);

  return { slaStatuses, summary };
};
