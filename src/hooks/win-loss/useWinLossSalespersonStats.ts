import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  aggregateBySalesperson,
  type SalespersonStat,
} from "./useWinLossAggregations";
import type { WLAnalysisRow } from "./useWinLossData";

export const useSalespersonWinLossStats = (
  rows: WLAnalysisRow[] | undefined,
): { data: SalespersonStat[]; isLoading: boolean } => {
  const ids = (rows ?? []).map(r => r.sale_id);
  const { data: sales = [], isLoading: l1 } = useQuery({
    queryKey: ["wl-sp-sales", ids.length, ids[0]],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("id,salesperson_id")
        .in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
    enabled: ids.length > 0,
  });
  const spIds = Array.from(new Set(sales.map(s => s.salesperson_id).filter(Boolean) as string[]));
  const { data: people = [], isLoading: l2 } = useQuery({
    queryKey: ["wl-sp-people", spIds.length],
    queryFn: async () => {
      if (!spIds.length) return [];
      const { data, error } = await supabase
        .from("salespeople_public")
        .select("id,name")
        .in("id", spIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: spIds.length > 0,
  });

  const salesMap = new Map<string, string>(sales.map(s => [s.id, s.salesperson_id ?? ""]));
  const nameMap = new Map<string, string>(people.map(p => [p.id ?? "", p.name ?? ""]));
  const stats = rows ? aggregateBySalesperson(rows, salesMap, nameMap) : [];
  return { data: stats, isLoading: l1 || l2 };
};
