import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { CACHE_TIMES } from "@/constants";

export interface InactivityRule {
  stage: string;
  label: string;
  mildDays: number;
  moderateDays: number;
  criticalDays: number;
  enabled: boolean;
}

// Fallback defaults if the table is empty / unreachable.
export const INACTIVITY_RULES: InactivityRule[] = [
  { stage: "lead",        label: "Lead",        mildDays: 2,  moderateDays: 3,  criticalDays: 4,  enabled: true },
  { stage: "qualified",   label: "Qualificado", mildDays: 3,  moderateDays: 5,  criticalDays: 6,  enabled: true },
  { stage: "proposal",    label: "Proposta",    mildDays: 5,  moderateDays: 8,  criticalDays: 10, enabled: true },
  { stage: "negotiation", label: "Negociação",  mildDays: 7,  moderateDays: 11, criticalDays: 14, enabled: true },
  { stage: "won",         label: "Ganho",       mildDays: 15, moderateDays: 23, criticalDays: 30, enabled: true },
  { stage: "lost",        label: "Perdido",     mildDays: 30, moderateDays: 45, criticalDays: 60, enabled: true },
];

// Back-compat: some callers still read `.maxDaysInactive` (= mild threshold).
export type LegacyInactivityRule = InactivityRule & { maxDaysInactive: number };
const withLegacy = (r: InactivityRule): LegacyInactivityRule => ({ ...r, maxDaysInactive: r.mildDays });

export interface InactiveDeal {
  id: string;
  clientName: string;
  stage: string;
  daysInactive: number;
  mildDays: number;
  moderateDays: number;
  criticalDays: number;
  severity: "mild" | "moderate" | "critical";
  lastActivityDate: string;
}

export const useStageInactivityRules = () =>
  useQuery<LegacyInactivityRule[]>({
    queryKey: ["stage-inactivity-rules"],
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_inactivity_rules")
        .select("stage, label, mild_days, moderate_days, critical_days, enabled")
        .order("mild_days", { ascending: true });
      if (error) throw error;
      if (!data?.length) return INACTIVITY_RULES.map(withLegacy);
      return data.map((r) =>
        withLegacy({
          stage: r.stage,
          label: r.label,
          mildDays: r.mild_days,
          moderateDays: r.moderate_days,
          criticalDays: r.critical_days,
          enabled: r.enabled,
        })
      );
    },
  });

export const useInactiveDeals = () => {
  const { data: rules } = useStageInactivityRules();

  const { data: sales } = useQuery({
    queryKey: ["sales-inactivity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, status, updated_at, created_at")
        .not("status", "in", '("closed")')
        .order("updated_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const { data: activities } = useQuery({
    queryKey: ["activities-latest-per-sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("sale_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const inactiveDeals = useMemo((): InactiveDeal[] => {
    if (!sales) return [];
    const activeRules = (rules ?? INACTIVITY_RULES.map(withLegacy)).filter((r) => r.enabled);
    const ruleByStage = new Map(activeRules.map((r) => [r.stage, r]));
    const now = new Date();

    const latestActivity = new Map<string, string>();
    (activities || []).forEach((a) => {
      if (a.sale_id && !latestActivity.has(a.sale_id)) {
        latestActivity.set(a.sale_id, a.created_at);
      }
    });

    const results: InactiveDeal[] = [];

    sales.forEach((sale) => {
      const rule = ruleByStage.get(sale.status);
      if (!rule) return;

      const lastDate = latestActivity.get(sale.id) || sale.updated_at;
      const daysInactive = differenceInDays(now, parseISO(lastDate));

      if (daysInactive < rule.mildDays) return;

      let severity: InactiveDeal["severity"] = "mild";
      if (daysInactive >= rule.criticalDays) severity = "critical";
      else if (daysInactive >= rule.moderateDays) severity = "moderate";

      results.push({
        id: sale.id,
        clientName: sale.client_name,
        stage: sale.status,
        daysInactive,
        mildDays: rule.mildDays,
        moderateDays: rule.moderateDays,
        criticalDays: rule.criticalDays,
        severity,
        lastActivityDate: lastDate,
      });
    });

    return results.sort((a, b) => b.daysInactive - a.daysInactive);
  }, [sales, activities, rules]);

  const summary = useMemo(() => ({
    critical: inactiveDeals.filter((d) => d.severity === "critical").length,
    moderate: inactiveDeals.filter((d) => d.severity === "moderate").length,
    mild: inactiveDeals.filter((d) => d.severity === "mild").length,
    total: inactiveDeals.length,
  }), [inactiveDeals]);

  return { inactiveDeals, summary };
};
