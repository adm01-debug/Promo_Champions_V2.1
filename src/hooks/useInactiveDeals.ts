import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { CACHE_TIMES } from "@/constants";

export interface InactivityRule {
  stage: string;
  maxDaysInactive: number;
  label: string;
}

export const INACTIVITY_RULES: InactivityRule[] = [
  { stage: "lead", maxDaysInactive: 2, label: "Lead" },
  { stage: "qualified", maxDaysInactive: 3, label: "Qualificado" },
  { stage: "proposal", maxDaysInactive: 5, label: "Proposta" },
  { stage: "negotiation", maxDaysInactive: 7, label: "Negociação" },
  { stage: "won", maxDaysInactive: 15, label: "Ganho" },
  { stage: "lost", maxDaysInactive: 30, label: "Perdido" },
];

export interface InactiveDeal {
  id: string;
  clientName: string;
  stage: string;
  daysInactive: number;
  maxDays: number;
  severity: "mild" | "moderate" | "critical";
  lastActivityDate: string;
}

export const useInactiveDeals = () => {
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
    const now = new Date();

    // Map latest activity per sale
    const latestActivity = new Map<string, string>();
    (activities || []).forEach((a) => {
      if (a.sale_id && !latestActivity.has(a.sale_id)) {
        latestActivity.set(a.sale_id, a.created_at);
      }
    });

    const results: InactiveDeal[] = [];

    sales.forEach((sale) => {
      const rule = INACTIVITY_RULES.find((r) => r.stage === sale.status);
      if (!rule) return;

      const lastDate = latestActivity.get(sale.id) || sale.updated_at;
      const daysInactive = differenceInDays(now, parseISO(lastDate));

      if (daysInactive >= rule.maxDaysInactive) {
        let severity: InactiveDeal["severity"] = "mild";
        if (daysInactive >= rule.maxDaysInactive * 2) severity = "critical";
        else if (daysInactive >= rule.maxDaysInactive * 1.5) severity = "moderate";

        results.push({
          id: sale.id,
          clientName: sale.client_name,
          stage: sale.status,
          daysInactive,
          maxDays: rule.maxDaysInactive,
          severity,
          lastActivityDate: lastDate,
        });
      }
    });

    return results.sort((a, b) => b.daysInactive - a.daysInactive);
  }, [sales, activities]);

  const summary = useMemo(() => ({
    critical: inactiveDeals.filter((d) => d.severity === "critical").length,
    moderate: inactiveDeals.filter((d) => d.severity === "moderate").length,
    mild: inactiveDeals.filter((d) => d.severity === "mild").length,
    total: inactiveDeals.length,
  }), [inactiveDeals]);

  return { inactiveDeals, summary };
};
